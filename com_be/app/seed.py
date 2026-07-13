"""Idempotent seed script: `python -m app.seed`.

Upserts every record by primary key (slug-stable ids), so re-running is safe.
"""
import asyncio
from datetime import date

from sqlalchemy.dialects.postgresql import insert

from app.db.session import async_session_factory
from app.models import ImpactStat, Product, Report, Story, UpcomingProject

PRODUCTS = [
    {
        "id": "p1",
        "slug": "gio-may-buon-ban",
        "name": "Giỏ mây Buôn Bản",
        "price": 185000,
        "art": {"from": "#d9b26f", "to": "#b88a4a", "emoji": "🧺", "realPhotoNote": "Ảnh giỏ mây đan tay trên nền vải thổ cẩm"},
        "category": "gio",
        "maker": "Cô H’Lan",
        "region": "Buôn Ma Thuột, Đắk Lắk",
        "short": "Giỏ mây đan tay, dáng tròn ấm, dùng đi chợ hay trang trí.",
        "description": "Mỗi chiếc giỏ được cô H’Lan đan trong khoảng hai ngày, từ sợi mây phơi nắng tự nhiên. Đường đan đều và chắc, càng dùng càng lên màu đẹp. Đây là sản phẩm bán chạy nhất của dự án.",
        "materials": ["Mây tự nhiên", "Quai da thật"],
        "size": "Ø 28cm · cao 24cm",
        "stock": 18,
        "featured": True,
        "story_slug": "co-hlan-nguoi-giu-nghe-dan",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/mqfpyk4dottb0tapn4zn",
    },
    {
        "id": "p2",
        "slug": "gio-co-bang-thi-thanh",
        "name": "Giỏ cỏ bàng Thị Thành",
        "price": 210000,
        "art": {"from": "#cfe3d6", "to": "#3a8062", "emoji": "🌾", "realPhotoNote": "Ảnh giỏ cỏ bàng cận cảnh đường đan"},
        "category": "gio",
        "maker": "Chú Tư",
        "region": "Long An",
        "short": "Cỏ bàng phơi sương, nhẹ và bền, mùi thơm cỏ tự nhiên.",
        "description": "Chú Tư thu hoạch cỏ bàng vào sáng sớm rồi phơi qua ba nắng. Chiếc giỏ nhẹ tênh nhưng đựng được cả buổi chợ. Mua một chiếc giỏ là một đêm chú không phải ngồi bán rong tới khuya.",
        "materials": ["Cỏ bàng", "Chỉ gai"],
        "size": "Ø 26cm · cao 22cm",
        "stock": 12,
        "featured": True,
        "story_slug": "chu-tu-va-ganh-hang-dem",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/dlfxoxs32wqpbv8msrdb",
    },
    {
        "id": "p3",
        "slug": "gio-treo-thom",
        "name": "Giỏ treo Thơm",
        "price": 145000,
        "art": {"from": "#fbe7d7", "to": "#e07a3f", "emoji": "🪴", "realPhotoNote": "Ảnh giỏ treo cây cảnh trước hiên nhà"},
        "category": "gio",
        "maker": "Cô H’Lan",
        "region": "Buôn Ma Thuột, Đắk Lắk",
        "short": "Giỏ treo nhỏ xinh cho cây cảnh, ban công thêm xanh.",
        "description": "Phiên bản nhỏ gọn để treo cây, đan từ phần mây mảnh nhất. Một món quà nhỏ mà ấm áp cho người yêu cây.",
        "materials": ["Mây tự nhiên", "Dây treo cotton"],
        "size": "Ø 18cm · cao 16cm",
        "stock": 25,
        "featured": True,
        "story_slug": "co-hlan-nguoi-giu-nghe-dan",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/bndm7riudzr1pntnjrfl",
    },
    {
        "id": "p4",
        "slug": "gio-quai-vai-tho-cam",
        "name": "Giỏ quai thổ cẩm",
        "price": 235000,
        "art": {"from": "#f3e7cf", "to": "#c45f2e", "emoji": "🎒", "realPhotoNote": "Ảnh giỏ phối quai vải thổ cẩm dệt tay"},
        "category": "gio",
        "maker": "Nhóm phụ nữ Buôn Kô Tam",
        "region": "Đắk Lắk",
        "short": "Giỏ mây phối quai thổ cẩm dệt tay, đậm chất Tây Nguyên.",
        "description": "Sự kết hợp giữa nghề đan mây và nghề dệt thổ cẩm của nhóm phụ nữ Buôn Kô Tam. Mỗi quai vải có hoa văn riêng, không chiếc nào giống chiếc nào.",
        "materials": ["Mây tự nhiên", "Vải thổ cẩm dệt tay"],
        "size": "Ø 30cm · cao 26cm",
        "stock": 9,
        "featured": False,
        "story_slug": "co-hlan-nguoi-giu-nghe-dan",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/rpebxyfjpsmnkwxwjyx6",
    },
    {
        "id": "p5",
        "slug": "gio-mini-de-ban",
        "name": "Giỏ mini để bàn",
        "price": 95000,
        "art": {"from": "#eef5ef", "to": "#3a8062", "emoji": "🧺", "realPhotoNote": "Ảnh giỏ mini đựng đồ trên bàn làm việc"},
        "category": "phu-kien",
        "maker": "Chú Tư",
        "region": "Long An",
        "short": "Giỏ nhỏ đựng đồ lặt vặt, gọn gàng góc làm việc.",
        "description": "Chiếc giỏ tí hon đựng bút, dây sạc hay đồ trang điểm. Giá mềm, hợp làm quà tặng kèm.",
        "materials": ["Cỏ bàng"],
        "size": "Ø 14cm · cao 10cm",
        "stock": 40,
        "featured": False,
        "story_slug": "chu-tu-va-ganh-hang-dem",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/d8lbeoxym8m74fteipcq",
    },
    {
        "id": "p6",
        "slug": "gio-picnic-doi",
        "name": "Giỏ picnic đôi",
        "price": 320000,
        "art": {"from": "#f3e7cf", "to": "#b88a4a", "emoji": "🧺", "realPhotoNote": "Ảnh giỏ picnic lớn đặt trên cỏ"},
        "category": "gio",
        "maker": "Nhóm phụ nữ Buôn Kô Tam",
        "region": "Đắk Lắk",
        "short": "Giỏ lớn có nắp, cho buổi dã ngoại cuối tuần.",
        "description": "Chiếc giỏ lớn nhất bộ sưu tập, có nắp gài và hai quai chắc chắn. Đủ chỗ cho bữa trưa của cả gia đình.",
        "materials": ["Mây tự nhiên", "Quai da thật", "Khoá đồng"],
        "size": "Ø 38cm · cao 30cm",
        "stock": 6,
        "featured": False,
        "story_slug": "co-hlan-nguoi-giu-nghe-dan",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/eb8rgcpvgiu94xdv62dc",
    },
    {
        "id": "p7",
        "slug": "non-co-bang-di-nang",
        "name": "Nón cỏ bàng đi nắng",
        "price": 120000,
        "art": {"from": "#f7efdc", "to": "#b88a4a", "emoji": "👒", "realPhotoNote": "Ảnh nón cỏ bàng đội thử dưới nắng chiều"},
        "category": "phu-kien",
        "maker": "Bà Sáu",
        "region": "Long An",
        "short": "Nón vành rộng đan từ cỏ bàng, nhẹ đầu và thoáng mát.",
        "description": "Bà Sáu chuốt từng sợi cỏ bàng già để đan chiếc nón vành rộng này. Đội cả buổi chợ không nặng đầu, gấp nhẹ bỏ giỏ mang theo đi biển cũng được.",
        "materials": ["Cỏ bàng", "Ruy băng vải"],
        "size": "Ø vành 40cm",
        "stock": 20,
        "featured": False,
        "story_slug": "ba-sau-va-chiec-non-co",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/etyeumrwia6nshjmw0d8",
    },
    {
        "id": "p8",
        "slug": "tui-coi-deo-cheo",
        "name": "Túi cói đeo chéo",
        "price": 165000,
        "art": {"from": "#eef5ef", "to": "#c45f2e", "emoji": "👜", "realPhotoNote": "Ảnh túi cói đeo chéo phối áo dài cách tân"},
        "category": "phu-kien",
        "maker": "Chị Mai",
        "region": "Nga Sơn, Thanh Hoá",
        "short": "Túi cói dệt tay có lót vải, đi phố hay đi chợ đều hợp.",
        "description": "Chị Mai dệt túi từ cói Nga Sơn — thứ cói nổi tiếng dùng dệt chiếu tiến vua. Túi có lớp lót vải bố và khuy gỗ, mộc mạc mà chắc chắn.",
        "materials": ["Cói Nga Sơn", "Vải bố lót", "Khuy gỗ"],
        "size": "30cm × 22cm × 8cm",
        "stock": 15,
        "featured": False,
        "story_slug": "chi-mai-va-soi-coi-nga-son",
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/kkfhd6vvoaicmahkmydm",
    },
]

STORIES = [
    {
        "id": "s1",
        "slug": "co-hlan-nguoi-giu-nghe-dan",
        "kind": "artisan",
        "title": "Cô H’Lan — người giữ nghề đan",
        "person": "Cô H’Lan, 52 tuổi",
        "location": "Buôn Ma Thuột, Đắk Lắk",
        "excerpt": "Cô H’Lan học đan mây từ bà ngoại khi mới lên mười. Giờ cô là người cuối cùng trong buôn còn giữ những đường đan cũ.",
        "body": [
            "Sáng nào cô H’Lan cũng dậy từ 5 giờ, ra sau nhà lấy bó mây đã phơi đủ nắng. “Mây phải khô vừa, đan mới mềm tay mà không gãy,” cô nói, hai bàn tay chai sạn thoăn thoắt luồn từng sợi.",
            "Trước đây giỏ của cô chỉ bán được cho khách quen trong buôn, mỗi tháng vài chiếc. Từ khi com-passion đưa giỏ lên mạng, cô nhận đơn đều đặn hơn, đủ để lo cho hai đứa cháu đang đi học.",
            "Mỗi chiếc giỏ bạn mua giúp cô có thêm lý do để ngồi xuống, tiếp tục đan, và truyền lại nghề cho lớp trẻ trong buôn.",
        ],
        "art": {"from": "#d9b26f", "to": "#b88a4a", "emoji": "👵", "realPhotoNote": "Chân dung cô H’Lan đang đan mây trước hiên nhà, ánh sáng sáng sớm"},
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/dgjgv5osrlmfxghr3cdn",
    },
    {
        "id": "s2",
        "slug": "chu-tu-va-ganh-hang-dem",
        "kind": "artisan",
        "title": "Chú Tư và gánh hàng đêm",
        "person": "Chú Tư, 60 tuổi",
        "location": "Long An",
        "excerpt": "Nhiều năm chú Tư ngồi bán giỏ cỏ bàng bên lề đường tới tận khuya. Giờ khách có thể mua online — chú đỡ một đêm sương gió.",
        "body": [
            "Hơn hai mươi năm, gánh hàng của chú Tư là cái đèn dầu nhỏ và chồng giỏ cỏ bàng bên vỉa hè. Có đêm bán hết, có đêm ngồi tới 1 giờ sáng mới về.",
            "“Tui không rành điện thoại, nhưng tụi nhỏ ở dự án chụp hình giỏ rồi đăng lên giùm. Giờ có người ở tận Hà Nội đặt mua,” chú cười.",
            "Thay vì phải tìm đến tận nơi chú ngồi bán, bạn chỉ cần đặt một chiếc giỏ trên web. Với chú, đó là một đêm được về sớm hơn, ngủ ngon hơn.",
        ],
        "art": {"from": "#cfe3d6", "to": "#3a8062", "emoji": "👴", "realPhotoNote": "Chú Tư bên gánh hàng rong buổi đêm, đèn vàng ấm"},
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/xrzozbxces7vs5mngfwr",
    },
    {
        "id": "s3",
        "slug": "bua-trua-o-truong-buon",
        "kind": "school",
        "title": "Bữa trưa ở trường buôn",
        "person": "Lớp 3, Trường Tiểu học Ea Tu",
        "location": "Buôn Ma Thuột, Đắk Lắk",
        "excerpt": "Một phần lợi nhuận mỗi chiếc giỏ trở thành bữa trưa nóng cho các em nhỏ vùng cao đang tới trường.",
        "body": [
            "Ở điểm trường Ea Tu, nhiều em nhỏ 8–10 tuổi đi bộ vài cây số tới lớp, buổi trưa thường chỉ có cơm trắng mang theo từ nhà.",
            "Từ quỹ của dự án, các em có thêm bữa trưa với rau, trứng và thịt — đủ no để học buổi chiều. “Con thích nhất hôm có canh,” một em nói, miệng vẫn còn dính cơm.",
            "Mỗi đơn hàng của bạn được ghi lại minh bạch, và một phần được chuyển thẳng thành những bữa ăn như thế này.",
        ],
        "art": {"from": "#fbe7d7", "to": "#e07a3f", "emoji": "🍱", "realPhotoNote": "Các em nhỏ 8–10 tuổi vùng cao đang ăn trưa ở trường, khung cảnh ấm áp"},
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/gzxqsmtek6bigchbt6c3",
    },
    {
        "id": "s4",
        "slug": "ba-sau-va-chiec-non-co",
        "kind": "artisan",
        "title": "Bà Sáu và chiếc nón cỏ",
        "person": "Bà Sáu, 68 tuổi",
        "location": "Long An",
        "excerpt": "Ở tuổi 68, bà Sáu vẫn ngồi đan nón mỗi chiều. Với bà, từng vành nón là từng câu chuyện kể cho cháu nghe.",
        "body": [
            "Bà Sáu là hàng xóm của chú Tư, và là người dạy chú những đường đan đầu tiên. Mắt bà đã kém, nhưng đôi tay thì chưa bao giờ lẫn một sợi cỏ.",
            "“Đan nón chậm hơn đan giỏ, mà vui hơn. Ai đội nón của tui là mang theo một mảnh đồng cỏ bàng đi khắp nơi,” bà nói, tay vẫn xoay đều vành nón.",
            "Tiền bán nón giúp bà tự lo thuốc thang, không phải phiền tới con cháu — điều bà xem là niềm tự hào lớn nhất của tuổi già.",
        ],
        "art": {"from": "#f7efdc", "to": "#b88a4a", "emoji": "👒", "realPhotoNote": "Bà Sáu ngồi đan nón bên hiên, ánh nắng chiều xiên qua đồng cỏ bàng"},
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/jtwwtqtb3at7tiqtk5dm",
    },
    {
        "id": "s5",
        "slug": "chi-mai-va-soi-coi-nga-son",
        "kind": "artisan",
        "title": "Chị Mai và sợi cói Nga Sơn",
        "person": "Chị Mai, 34 tuổi",
        "location": "Nga Sơn, Thanh Hoá",
        "excerpt": "Từng rời quê đi làm công nhân, chị Mai quay về giữ khung dệt cói của mẹ — và tìm thấy con đường mới cho làng nghề.",
        "body": [
            "Nga Sơn có nghề dệt cói mấy trăm năm, nhưng lớp trẻ lần lượt bỏ đi làm xa. Chị Mai cũng từng như thế, cho tới khi mẹ ốm và khung dệt phủ bụi.",
            "Chị về quê, học lại từng mối dệt, rồi thử làm túi xách thay vì chiếu — thứ khách trẻ thành phố thích. Đơn hàng đầu tiên qua com-passion là mười chiếc túi, chị thức trắng hai đêm để kịp giao.",
            "Giờ xưởng nhỏ của chị có thêm ba chị em trong xóm cùng làm. “Chỉ mong nghề cói không dừng lại ở đời mẹ tôi,” chị nói.",
        ],
        "art": {"from": "#eef5ef", "to": "#c45f2e", "emoji": "🧵", "realPhotoNote": "Chị Mai bên khung dệt cói, những cuộn cói xếp sau lưng"},
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/phqqg8qsh21r1cu7ll7y",
    },
    {
        "id": "s6",
        "slug": "thu-vien-nho-tren-doi",
        "kind": "school",
        "title": "Thư viện nhỏ trên đồi",
        "person": "Điểm trường Ea Kmat",
        "location": "Buôn Ma Thuột, Đắk Lắk",
        "excerpt": "Từ quỹ minh bạch của dự án, một góc lớp học cũ trở thành thư viện đầu tiên của điểm trường trên đồi.",
        "body": [
            "Điểm trường Ea Kmat nằm trên đồi, cách trường chính gần chục cây số. Trước đây cả trường chỉ có vài cuốn truyện cũ chuyền tay nhau đọc.",
            "Tháng 3 vừa rồi, quỹ dự án góp kệ gỗ, 240 đầu sách và một tấm thảm cói do chính chú Tư đan tặng. Giờ trưa nào góc thư viện cũng chật kín.",
            "“Có em đọc xong còn kể lại cho ba mẹ nghe — nhiều phụ huynh không biết chữ,” cô giáo phụ trách kể. Một chiếc giỏ bạn mua hôm nay có thể là một cuốn sách mới trên kệ ngày mai.",
        ],
        "art": {"from": "#cfe3d6", "to": "#3a8062", "emoji": "📚", "realPhotoNote": "Các em nhỏ ngồi đọc sách quanh kệ gỗ trong góc lớp học"},
        "image_url": "https://res.cloudinary.com/c36upord/image/upload/f_auto,q_auto/bskellhx9zcmddkgx2ap",
    },
]

IMPACT_STATS = [
    {"key": "sold", "label": "Sản phẩm đã bán", "value": 1248, "suffix": None, "prefix": None, "emoji": "🧺", "position": 0},
    {"key": "funds", "label": "Đã tích luỹ cho cộng đồng", "value": 86, "suffix": " triệu₫", "prefix": None, "emoji": "💚", "position": 1},
    {"key": "artisans", "label": "Cô chú nghệ nhân đồng hành", "value": 14, "suffix": None, "prefix": None, "emoji": "🤲", "position": 2},
    {"key": "children", "label": "Em nhỏ được hỗ trợ bữa trưa", "value": 92, "suffix": None, "prefix": None, "emoji": "🧒", "position": 3},
    {"key": "meals", "label": "Bữa trưa đã trao tới trường", "value": 5400, "suffix": None, "prefix": None, "emoji": "🍱", "position": 4},
]

REPORTS = [
    {
        "id": "r-2026-05",
        "period": "Tháng 5, 2026",
        "title": "Báo cáo minh bạch tháng 5/2026",
        "summary": "Tháng 5 dự án bán được 312 chiếc giỏ. Toàn bộ dòng tiền được phân bổ và công khai bên dưới.",
        "total_raised": 18600000,
        "allocations": [
            {"label": "Trả công nghệ nhân", "amount": 11160000, "color": "#3a8062"},
            {"label": "Bữa trưa cho trường", "amount": 3720000, "color": "#e07a3f"},
            {"label": "Nguyên vật liệu & vận hành", "amount": 2790000, "color": "#d9b26f"},
            {"label": "Quỹ dự phòng", "amount": 930000, "color": "#cfe3d6"},
        ],
        "invoice_label": "Hoá đơn & sao kê T5-2026.pdf",
        "period_date": date(2026, 5, 1),
    },
    {
        "id": "r-2026-04",
        "period": "Tháng 4, 2026",
        "title": "Báo cáo minh bạch tháng 4/2026",
        "summary": "Tháng 4 ghi nhận 268 đơn hàng. Lần đầu mở rộng hỗ trợ sang điểm trường thứ hai.",
        "total_raised": 15900000,
        "allocations": [
            {"label": "Trả công nghệ nhân", "amount": 9540000, "color": "#3a8062"},
            {"label": "Bữa trưa cho trường", "amount": 3180000, "color": "#e07a3f"},
            {"label": "Nguyên vật liệu & vận hành", "amount": 2385000, "color": "#d9b26f"},
            {"label": "Quỹ dự phòng", "amount": 795000, "color": "#cfe3d6"},
        ],
        "invoice_label": "Hoá đơn & sao kê T4-2026.pdf",
        "period_date": date(2026, 4, 1),
    },
]

UPCOMING = [
    {
        "id": "u1",
        "title": "Bộ sưu tập “Mùa cà phê”",
        "start_date": date(2026, 7, 1),
        "note": "Giỏ đựng quà mùa thu hoạch cà phê, phối màu hạt rang.",
        "art": {"from": "#f3e7cf", "to": "#c45f2e", "emoji": "☕"},
    },
    {
        "id": "u2",
        "title": "Góc bếp vùng cao",
        "start_date": date(2026, 8, 15),
        "note": "Khay, lót nồi và đồ bếp đan tay từ cỏ bàng.",
        "art": {"from": "#eef5ef", "to": "#3a8062", "emoji": "🍯"},
    },
    {
        "id": "u3",
        "title": "Học bổng “Tới trường”",
        "start_date": date(2026, 9, 5),
        "note": "Trích quỹ tặng cặp sách đầu năm cho 50 em nhỏ.",
        "art": {"from": "#fbe7d7", "to": "#e07a3f", "emoji": "🎒"},
    },
]


async def upsert_all(session, model, rows: list[dict]) -> None:
    pk = model.__mapper__.primary_key[0].name
    for row in rows:
        stmt = insert(model).values(**row)
        stmt = stmt.on_conflict_do_update(
            index_elements=[pk],
            set_={k: stmt.excluded[k] for k in row if k != pk},
        )
        await session.execute(stmt)


async def main() -> None:
    async with async_session_factory() as session:
        await upsert_all(session, Product, PRODUCTS)
        await upsert_all(session, Story, STORIES)
        await upsert_all(session, ImpactStat, IMPACT_STATS)
        await upsert_all(session, Report, REPORTS)
        await upsert_all(session, UpcomingProject, UPCOMING)
        await session.commit()
    print(
        f"Seeded: {len(PRODUCTS)} products, {len(STORIES)} stories, "
        f"{len(IMPACT_STATS)} impact stats, {len(REPORTS)} reports, {len(UPCOMING)} upcoming projects."
    )


if __name__ == "__main__":
    asyncio.run(main())
