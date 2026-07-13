from datetime import date

from sqlalchemy import JSON, Boolean, Date, Integer, Float, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

# JSONB on Postgres, plain JSON elsewhere (in-memory SQLite in tests).
JSONVariant = JSON().with_variant(JSONB(), "postgresql")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    name: Mapped[str] = mapped_column(String)
    price: Mapped[int] = mapped_column(Integer)
    art: Mapped[dict] = mapped_column(JSONVariant)
    category: Mapped[str] = mapped_column(String, index=True)
    maker: Mapped[str] = mapped_column(String)
    region: Mapped[str] = mapped_column(String)
    short: Mapped[str] = mapped_column(Text)
    description: Mapped[str] = mapped_column(Text)
    materials: Mapped[list] = mapped_column(JSONVariant)
    size: Mapped[str] = mapped_column(String)
    stock: Mapped[int] = mapped_column(Integer, default=0)
    featured: Mapped[bool] = mapped_column(Boolean, default=False)
    story_slug: Mapped[str | None] = mapped_column(String, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    slug: Mapped[str] = mapped_column(String, unique=True, index=True)
    kind: Mapped[str] = mapped_column(String, index=True)
    title: Mapped[str] = mapped_column(String)
    person: Mapped[str] = mapped_column(String)
    location: Mapped[str] = mapped_column(String)
    excerpt: Mapped[str] = mapped_column(Text)
    body: Mapped[list] = mapped_column(JSONVariant)
    art: Mapped[dict] = mapped_column(JSONVariant)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)


class ImpactStat(Base):
    __tablename__ = "impact_stats"

    key: Mapped[str] = mapped_column(String, primary_key=True)
    label: Mapped[str] = mapped_column(String)
    value: Mapped[float] = mapped_column(Float)
    suffix: Mapped[str | None] = mapped_column(String, nullable=True)
    prefix: Mapped[str | None] = mapped_column(String, nullable=True)
    emoji: Mapped[str] = mapped_column(String)
    position: Mapped[int] = mapped_column(Integer, default=0)


class Report(Base):
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    period: Mapped[str] = mapped_column(String)
    title: Mapped[str] = mapped_column(String)
    summary: Mapped[str] = mapped_column(Text)
    total_raised: Mapped[int] = mapped_column(Integer)
    allocations: Mapped[list] = mapped_column(JSONVariant)
    invoice_label: Mapped[str] = mapped_column(String)
    # Month the report covers; list endpoint sorts newest first on this.
    period_date: Mapped[date] = mapped_column(Date, index=True)


class UpcomingProject(Base):
    __tablename__ = "upcoming_projects"

    id: Mapped[str] = mapped_column(String, primary_key=True)
    title: Mapped[str] = mapped_column(String)
    start_date: Mapped[date] = mapped_column(Date, index=True)
    note: Mapped[str] = mapped_column(Text)
    art: Mapped[dict] = mapped_column(JSONVariant)
