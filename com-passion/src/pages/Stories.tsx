import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { api } from "../lib/api";
import { useApi } from "../lib/useApi";
import Photo from "../components/Photo";
import { Loading, ErrorNote } from "../components/Status";
import { SkeletonStory } from "../components/Skeleton";

const fadeUp = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const slideLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const slideRight = {
  hidden: { opacity: 0, x: 60 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2 },
  },
};

export default function Stories() {
  const { data: stories, loading, error } = useApi(() => api.stories());

  return (
    <>
      <section className="pagehead">
        <div className="container">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.span variants={fadeUp} className="eyebrow">
              Câu chuyện
            </motion.span>
            <motion.h1 variants={fadeUp}>
              Những con người đằng sau dự án
            </motion.h1>
            <motion.p variants={fadeUp} className="lead">
              Từ đôi tay các cô chú nghệ nhân tới bữa trưa của các em nhỏ — đây
              là lý do mỗi chiếc giỏ tồn tại.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section section--top">
        <div className="container">
          {loading && (
            <div className="stories">
              <SkeletonStory />
              <SkeletonStory />
              <SkeletonStory />
            </div>
          )}
          {error && <ErrorNote message={error} />}
          {stories && (
            <div className="stories">
              {stories.map((s, i) => {
                const isRev = i % 2 !== 0;

                return (
                  <motion.div
                    key={s.id}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                  >
                    <Link
                      to={`/cau-chuyen/${s.slug}`}
                      className={`feature interactive ${isRev ? "feature--rev" : ""}`}
                    >
                      <motion.div
                        variants={isRev ? slideRight : slideLeft}
                        className="feature__media"
                      >
                        <Photo
                          art={s.art}
                          ratio="4 / 3"
                          className="feature__img"
                          imgUrl={s.imageUrl}
                        />
                      </motion.div>
                      <motion.div
                        variants={isRev ? slideLeft : slideRight}
                        className="feature__text"
                      >
                        <span
                          className={`chip ${s.kind === "school" ? "chip--clay" : "chip--green"}`}
                        >
                          {s.kind === "school" ? "Các em nhỏ" : "Nghệ nhân"}
                        </span>
                        <h2>{s.title}</h2>
                        <p className="muted feature__who">
                          {s.person} · {s.location}
                        </p>
                        <p>{s.excerpt}</p>
                        <span className="story-card__more">Đọc tiếp →</span>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
