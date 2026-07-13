import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import ProductCard from "../components/ProductCard";
import CountUp from "../components/CountUp";
import Photo from "../components/Photo";
import { Loading, ErrorNote } from "../components/Status";
import { Skeleton, SkeletonCard, SkeletonText } from "../components/Skeleton";

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  const featuredState = useApi(() => api.products({ featured: true }));
  const storiesState = useApi(() => api.stories());
  const statsState = useApi(() => api.impactStats());
  const upcomingState = useApi(() => api.upcoming());

  return (
    <>
      {/* Hero */}
      <section className="hero">
        <div className="container hero__inner">
          <motion.div
            className="hero__text"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="eyebrow">
              🌿 Thủ công · Tử tế · Minh bạch
            </motion.span>
            <motion.h1 variants={fadeUp}>
              Mỗi chiếc giỏ là{" "}
              <span className="text-accent">một câu chuyện</span>.
            </motion.h1>
            <motion.p variants={fadeUp} className="lead">
              Bạn mua một sản phẩm đan tay từ bà con vùng cao — và đồng hành
              cùng các em nhỏ tới trường. Đơn giản, minh bạch, và ấm áp.
            </motion.p>
            <motion.div variants={fadeUp} className="hero__cta">
              <Link to="/shop" className="btn btn--accent btn--lg interactive">
                Xem sản phẩm
              </Link>
              <Link
                to="/cau-chuyen"
                className="btn btn--light btn--lg interactive"
              >
                Nghe câu chuyện
              </Link>
            </motion.div>
            <motion.div variants={fadeUp} className="hero__trust">
              {statsState.loading ? (
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                  <Skeleton style={{ width: '120px', height: '24px', borderRadius: '4px' }} />
                  <Skeleton style={{ width: '150px', height: '24px', borderRadius: '4px' }} />
                  <Skeleton style={{ width: '130px', height: '24px', borderRadius: '4px' }} />
                </div>
              ) : (
                <>
                  <span>🤲 {statsState.data?.find(s => s.key === 'artisans')?.value || 14} nghệ nhân</span>
                  <span>🍱 {(statsState.data?.find(s => s.key === 'meals')?.value || 5400).toLocaleString('vi-VN')} bữa trưa</span>
                  <span>🧾 Hoá đơn công khai</span>
                </>
              )}
            </motion.div>
          </motion.div>

          <motion.div
            className="hero__art"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] as const, delay: 0.2 }}
          >
            <Photo
              art={{
                from: "#d9b26f",
                to: "#2e6b4f",
                emoji: "🧺",
                realPhotoNote:
                  "Ảnh cô chú vùng cao bên những chiếc giỏ đan tay",
              }}
              ratio="4 / 5"
              imgUrl={featuredState.data?.find(p => p.id === 'p1')?.imageUrl}
            />
            <motion.div
              className="hero__floatcard card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              style={{
                background: "var(--cream)",
                boxShadow: "0 12px 40px rgba(46, 107, 79, 0.2)",
                border: "1px solid var(--clay-200)",
              }}
            >
              {statsState.loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <Skeleton style={{ width: '100px', height: '28px', borderRadius: '4px' }} />
                  <Skeleton style={{ width: '160px', height: '16px', borderRadius: '4px' }} />
                </div>
              ) : (
                <>
                  <strong style={{ color: "var(--green-800)" }}>{statsState.data?.find(s => s.key === 'funds')?.value || 86}{statsState.data?.find(s => s.key === 'funds')?.suffix || " triệu₫"}</strong>
                  <span className="muted" style={{ color: "var(--clay-700)" }}>{statsState.data?.find(s => s.key === 'funds')?.label?.toLowerCase() || "đã tích luỹ cho cộng đồng"}</span>
                </>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Mission */}
      <motion.section
        className="section mission"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow">Sứ mệnh của chúng tôi</span>
            <h2>Giúp bạn biết rõ mình đang giúp ai</h2>
            <p>
              com·passion đưa sản phẩm của các cô chú lên mạng, kể câu chuyện
              đằng sau từng chiếc giỏ, và công khai từng đồng đã đi về đâu.
            </p>
          </div>
          <motion.div
            className="grid cols-3 mission__grid"
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
          >
            {[
              {
                e: "🤲",
                t: "Trả công xứng đáng",
                d: "Phần lớn giá trị mỗi đơn hàng về thẳng tay người làm ra sản phẩm.",
              },
              {
                e: "🍱",
                t: "Bữa trưa tới trường",
                d: "Một phần lợi nhuận thành bữa ăn nóng cho các em nhỏ vùng cao.",
              },
              {
                e: "🧾",
                t: "Minh bạch tuyệt đối",
                d: "Hoá đơn và báo cáo định kỳ được công khai cho mọi người cùng xem.",
              },
            ].map((m) => (
              <motion.div
                key={m.t}
                variants={fadeUp}
                className="mission__card card"
              >
                <span className="mission__emoji">{m.e}</span>
                <h3>{m.t}</h3>
                <p className="muted">{m.d}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* Impact */}
      <motion.section
        className="section impact"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeUp}
      >
        <div className="container">
          <div className="section-head center">
            <span className="eyebrow" style={{ color: "var(--sand-400)" }}>
              Dấu ấn dự án
            </span>
            <h2 style={{ color: "#fff" }}>Những con số biết nói</h2>
          </div>
          {statsState.loading && (
            <div className="impact__grid">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="impact__stat">
                  <Skeleton style={{ height: '3rem', width: '3rem', margin: '0 auto 0.5rem', borderRadius: '50%' }} />
                  <Skeleton style={{ height: '2rem', width: '60%', margin: '0 auto 0.5rem', borderRadius: '4px' }} />
                  <Skeleton style={{ height: '1rem', width: '80%', margin: '0 auto', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          )}
          {statsState.error && <ErrorNote message={statsState.error} />}
          {statsState.data && (
            <motion.div
              className="impact__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {statsState.data.map((s) => (
                <motion.div
                  key={s.key}
                  variants={fadeUp}
                  className="impact__stat"
                >
                  <span className="impact__emoji">{s.emoji}</span>
                  <span className="impact__value">
                    <CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} />
                  </span>
                  <span className="impact__label">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
          <p className="impact__note">
            <Link to="/minh-bach" className="btn btn--light interactive">
              Xem hoá đơn & báo cáo →
            </Link>
          </p>
        </div>
      </motion.section>

      {/* Featured products */}
      <section className="section">
        <div className="container">
          <motion.div
            className="section-head row"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <div>
              <span className="eyebrow">Sản phẩm nổi bật</span>
              <h2>Giỏ đan tay, mỗi chiếc một nét</h2>
            </div>
            <Link to="/shop" className="btn btn--ghost interactive">
              Tất cả sản phẩm →
            </Link>
          </motion.div>
          {featuredState.loading && (
            <div className="grid cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {featuredState.error && <ErrorNote message={featuredState.error} />}
          {featuredState.data && (
            <motion.div
              className="grid cols-3"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {featuredState.data
                .slice()
                .sort((a, b) => {
                  const aOut = a.stock === 0;
                  const bOut = b.stock === 0;
                  if (aOut !== bOut) return aOut ? 1 : -1;
                  return 0;
                })
                .map((p) => (
                  <motion.div key={p.id} variants={fadeUp}>
                    <ProductCard product={p} />
                  </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      {/* Story teaser */}
      <section className="section story-teaser">
        <div className="container">
          <motion.div
            className="section-head center"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={fadeUp}
          >
            <span className="eyebrow">Người làm ra sản phẩm</span>
            <h2>Đằng sau mỗi chiếc giỏ là một con người</h2>
          </motion.div>
          {storiesState.loading && (
            <div className="grid cols-3 story__grid">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {storiesState.error && <ErrorNote message={storiesState.error} />}
          {storiesState.data && (
            <motion.div
              className="grid cols-3 story__grid"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
            >
              {storiesState.data.map((s) => {
                return (
                  <motion.div key={s.id} variants={fadeUp}>
                    <Link
                      to={`/cau-chuyen/${s.slug}`}
                      className="story-card interactive"
                    >
                      <Photo art={s.art} ratio="4 / 3" imgUrl={s.imageUrl} />
                      <div className="story-card__body">
                        <span
                          className={`chip ${s.kind === "school" ? "chip--clay" : "chip--green"}`}
                        >
                          {s.kind === "school" ? "Các em nhỏ" : "Nghệ nhân"}
                        </span>
                        <h3>{s.title}</h3>
                        <p className="muted">{s.excerpt}</p>
                        <span className="story-card__more">Đọc tiếp →</span>
                      </div>
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </div>
      </section>

      {/* Upcoming */}
      <motion.section
        className="section upcoming"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={fadeUp}
      >
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Sắp ra mắt</span>
            <h2>Những kế hoạch mới</h2>
          </div>
          {upcomingState.loading && (
            <div className="upcoming__list">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="upcoming__item card">
                  <Skeleton style={{ width: '76px', height: '76px', borderRadius: 'var(--radius)', flexShrink: 0 }} />
                  <div className="upcoming__info" style={{ width: '100%' }}>
                    <Skeleton style={{ width: '120px', height: '24px', borderRadius: 'var(--radius-pill)', marginBottom: '0.8rem' }} />
                    <SkeletonText lines={2} style={{ width: '80%' }} />
                  </div>
                </div>
              ))}
            </div>
          )}
          {upcomingState.error && <ErrorNote message={upcomingState.error} />}
          {upcomingState.data && (
            <motion.div
              className="upcoming__list"
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {upcomingState.data.map((u) => (
                <motion.div
                  key={u.id}
                  variants={fadeUp}
                  className="upcoming__item card"
                >
                  <div
                    className="upcoming__art"
                    style={{
                      background: `linear-gradient(135deg, ${u.art.from}, ${u.art.to})`,
                    }}
                  >
                    <span>{u.art.emoji}</span>
                  </div>
                  <div className="upcoming__info">
                    <span className="chip chip--green">
                      Bắt đầu {formatDate(u.startDate)}
                    </span>
                    <p
                      className="muted"
                      style={{
                        marginTop: "0.5rem",
                        fontWeight: 500,
                        color: "var(--text)",
                      }}
                    >
                      {u.title}
                    </p>
                    <p className="muted">{u.note}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.section>
    </>
  );
}
