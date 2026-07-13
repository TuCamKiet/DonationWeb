import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { useApi } from '../lib/useApi';
import Photo from '../components/Photo';
import ProductCard from '../components/ProductCard';
import { Loading, ErrorNote } from '../components/Status';
import { SkeletonStoryDetail } from '../components/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

export default function StoryDetail() {
  const { slug } = useParams();

  const { data: story, loading, error } = useApi(
    async () => {
      try {
        return await api.story(slug!);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    [slug]
  );

  const { data: allStories } = useApi(() => api.stories());
  const { data: allProducts } = useApi(() => api.products());

  if (loading) {
    return (
      <section className="section section--top container">
        <SkeletonStoryDetail />
      </section>
    );
  }

  if (error) {
    return (
      <section className="section container">
        <ErrorNote message={error} />
        <Link to="/cau-chuyen" className="btn btn--ghost interactive">← Về trang câu chuyện</Link>
      </section>
    );
  }

  if (!story) {
    return (
      <section className="section container">
        <h1>Không tìm thấy câu chuyện</h1>
        <Link to="/cau-chuyen" className="btn btn--ghost interactive">← Về trang câu chuyện</Link>
      </section>
    );
  }

  const related = (allProducts ?? []).filter((p) => p.storySlug === story.slug);
  const others = (allStories ?? []).filter((s) => s.slug !== story.slug);

  return (
    <article>
      <section className="section--top container">
        <nav className="crumbs">
          <Link to="/cau-chuyen" className="interactive">Câu chuyện</Link> <span>/</span> <span>{story.title}</span>
        </nav>
      </section>

      <motion.section className="storyhero container" initial="hidden" animate="visible" variants={staggerContainer}>
        <motion.span variants={fadeUp} className={`chip ${story.kind === 'school' ? 'chip--clay' : 'chip--green'}`}>
          {story.kind === 'school' ? 'Các em nhỏ' : 'Nghệ nhân'}
        </motion.span>
        <motion.h1 variants={fadeUp}>{story.title}</motion.h1>
        <motion.p variants={fadeUp} className="muted storyhero__who">{story.person} · 📍 {story.location}</motion.p>
      </motion.section>

      <motion.section className="container" initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }}>
        <Photo art={story.art} ratio="16 / 9" className="storyhero__img" imgUrl={story.imageUrl} />
      </motion.section>

      <section className="section storybody">
        <motion.div className="container storybody__inner" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={staggerContainer}>
          <motion.p variants={fadeUp} className="storybody__lead">{story.excerpt}</motion.p>
          {story.body.map((para, i) => (
            <motion.p variants={fadeUp} key={i}>{para}</motion.p>
          ))}
        </motion.div>
      </section>

      {related.length > 0 && (
        <section className="section">
          <motion.div className="container" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="section-head center">
              <span className="eyebrow">Ủng hộ trực tiếp</span>
              <h2>Mua sản phẩm từ {story.person.split(',')[0]}</h2>
            </motion.div>
            <motion.div variants={fadeUp} className="grid cols-3">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}

      {others.length > 0 && (
        <section className="section story-more">
          <motion.div className="container" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={staggerContainer}>
            <motion.div variants={fadeUp} className="section-head"><h2>Câu chuyện khác</h2></motion.div>
            <motion.div variants={fadeUp} className="grid cols-2">
              {others.map((s) => (
                <Link key={s.id} to={`/cau-chuyen/${s.slug}`} className="story-card story-card--row interactive">
                  <Photo art={s.art} ratio="1 / 1" className="story-card__thumb" imgUrl={s.imageUrl} />
                  <div className="story-card__body">
                    <h3>{s.title}</h3>
                    <p className="muted">{s.excerpt}</p>
                    <span className="story-card__more">Đọc tiếp →</span>
                  </div>
                </Link>
              ))}
            </motion.div>
          </motion.div>
        </section>
      )}
    </article>
  );
}
