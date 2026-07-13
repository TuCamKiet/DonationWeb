import random
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException
from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload

from app.api.deps import CurrentUserDep, SessionDep
from app.models import Order, OrderItem, Product, ImpactStat, Report
from app.schemas.order import OrderCreate, OrderOut
from app.schemas.user import ContributionOut

router = APIRouter(tags=["orders"])


async def _generate_order_id(session: SessionDep) -> str:
    for _ in range(20):
        candidate = f"ORD-{random.randint(1000, 9999)}"
        exists = await session.scalar(select(Order.id).where(Order.id == candidate))
        if exists is None:
            return candidate
    raise HTTPException(status_code=503, detail="Không tạo được mã đơn hàng, vui lòng thử lại")


@router.get("/orders", response_model=list[OrderOut])
async def list_orders(current_user: CurrentUserDep, session: SessionDep) -> list[Order]:
    stmt = (
        select(Order)
        .where(Order.user_id == current_user.id)
        .options(selectinload(Order.items))
        .order_by(Order.date.desc())
    )
    return list(await session.scalars(stmt))


@router.post("/orders", response_model=OrderOut, status_code=201)
async def create_order(payload: OrderCreate, current_user: CurrentUserDep, session: SessionDep) -> Order:
    # Merge duplicate product lines so each product gets a single stock update.
    quantities: dict[str, int] = {}
    for item in payload.items:
        quantities[item.product_id] = quantities.get(item.product_id, 0) + item.qty

    products_stmt = select(Product).where(Product.id.in_(quantities))
    products = {p.id: p for p in await session.scalars(products_stmt)}
    missing = set(quantities) - set(products)
    if missing:
        raise HTTPException(status_code=404, detail=f"Không tìm thấy sản phẩm: {', '.join(sorted(missing))}")

    # Conditional UPDATE keeps the decrement atomic under concurrent orders:
    # it only applies when enough stock remains, otherwise we roll back.
    for product_id, qty in quantities.items():
        result = await session.execute(
            update(Product)
            .where(Product.id == product_id, Product.stock >= qty)
            .values(stock=Product.stock - qty)
        )
        if result.rowcount == 0:
            # Read the name before rollback: rollback expires ORM objects.
            name = products[product_id].name
            await session.rollback()
            raise HTTPException(status_code=409, detail=f"Sản phẩm '{name}' không đủ hàng trong kho")

    total = sum(products[pid].price * qty for pid, qty in quantities.items()) + payload.donation
    order = Order(
        id=await _generate_order_id(session),
        user_id=current_user.id,
        date=datetime.now(timezone.utc),
        donation=payload.donation,
        total=total,
        items=[
            OrderItem(product_id=pid, name=products[pid].name, qty=qty, price=products[pid].price)
            for pid, qty in quantities.items()
        ],
    )
    session.add(order)
    await session.flush()  # Make order available to aggregate queries in the same transaction

    # 1. Update ImpactStats
    total_qty = sum(quantities.values())
    await session.execute(
        update(ImpactStat)
        .where(ImpactStat.key == "sold")
        .values(value=ImpactStat.value + total_qty)
    )

    funds_added = total / 1000000.0
    await session.execute(
        update(ImpactStat)
        .where(ImpactStat.key == "funds")
        .values(value=ImpactStat.value + funds_added)
    )

    meals_added = int(total * 0.20 / 25000)
    await session.execute(
        update(ImpactStat)
        .where(ImpactStat.key == "meals")
        .values(value=ImpactStat.value + meals_added)
    )

    # 2. Update or Create Report for current month
    from datetime import date
    current_date = datetime.now(timezone.utc)
    period_str = f"Tháng {current_date.month}, {current_date.year}"
    report_id = f"r-{current_date.year}-{current_date.month:02d}"

    report = await session.scalar(select(Report).where(Report.id == report_id))
    if not report:
        report = Report(
            id=report_id,
            period=period_str,
            title=f"Báo cáo minh bạch tháng {current_date.month}/{current_date.year}",
            summary="",
            total_raised=0,
            allocations=[
                {"label": "Trả công nghệ nhân", "amount": 0, "color": "#3a8062"},
                {"label": "Bữa trưa cho trường", "amount": 0, "color": "#e07a3f"},
                {"label": "Nguyên vật liệu & vận hành", "amount": 0, "color": "#d9b26f"},
                {"label": "Quỹ dự phòng", "amount": 0, "color": "#cfe3d6"},
            ],
            invoice_label=f"Hoá đơn & sao kê T{current_date.month}-{current_date.year}.pdf",
            period_date=date(current_date.year, current_date.month, 1)
        )
        session.add(report)

    report.total_raised += total

    # Safely update allocations JSON (avoiding direct mutation issues in some SQLAlchemy setups)
    new_allocations = []
    ratios = {
        "Trả công nghệ nhân": 0.60,
        "Bữa trưa cho trường": 0.20,
        "Nguyên vật liệu & vận hành": 0.15,
        "Quỹ dự phòng": 0.05,
    }
    for alloc in report.allocations:
        label = alloc["label"]
        added_amount = int(total * ratios.get(label, 0.0))
        new_allocations.append({
            "label": label,
            "amount": alloc["amount"] + added_amount,
            "color": alloc["color"]
        })
    report.allocations = new_allocations

    # Update report summary with dynamic query
    month_start = datetime(current_date.year, current_date.month, 1, tzinfo=timezone.utc)
    orders_count = await session.scalar(select(func.count(Order.id)).where(Order.date >= month_start))
    items_count = await session.scalar(
        select(func.coalesce(func.sum(OrderItem.qty), 0))
        .join(Order)
        .where(Order.date >= month_start)
    )
    
    report.summary = f"Tháng {current_date.month} ghi nhận {orders_count} đơn hàng với {items_count} sản phẩm. Toàn bộ dòng tiền được phân bổ và công khai bên dưới."

    await session.commit()
    return order


@router.get("/me/contribution", response_model=ContributionOut)
async def my_contribution(current_user: CurrentUserDep, session: SessionDep) -> ContributionOut:
    total = await session.scalar(
        select(func.coalesce(func.sum(Order.total), 0)).where(Order.user_id == current_user.id)
    )
    return ContributionOut(total=total)
