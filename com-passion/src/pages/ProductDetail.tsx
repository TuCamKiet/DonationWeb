import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api, ApiError } from '../lib/api';
import { useApi } from '../lib/useApi';
import { formatVND } from '../data/types';
import { useCart } from '../context/CartContext';
import Photo from '../components/Photo';
import ProductCard from '../components/ProductCard';
import { Loading, ErrorNote } from '../components/Status';
import { SkeletonProductDetail } from '../components/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

export default function ProductDetail() {
  const { slug } = useParams();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const { data: product, loading, error } = useApi(
    async () => {
      try {
        return await api.product(slug!);
      } catch (err) {
        if (err instanceof ApiError && err.status === 404) return null;
        throw err;
      }
    },
    [slug]
  );

  const { data: story } = useApi(
    async () => {
      if (!product?.storySlug) return null;
      try {
        return await api.story(product.storySlug);
      } catch {
        return null;
      }
    },
    [product?.storySlug]
  );

  const { data: related } = useApi(
    async () => {
      if (!product) return [];
      const list = await api.products({ category: product.category });
      return list.filter((p) => p.id !== product.id).slice(0, 3);
    },
    [product?.id]
  );

  if (loading) {
    return (
      <section className="section section--top container">
        <SkeletonProductDetail />
      </section>
    );
  }

  if (error) {
    return (
      <section className="section container">
        <ErrorNote message={error} />
        <Link to="/shop" className="btn btn--ghost">← Về cửa hàng</Link>
      </section>
    );
  }

  if (!product) {
    return (
      <section className="section container">
        <h1>Không tìm thấy sản phẩm</h1>
        <Link to="/shop" className="btn btn--ghost">← Về cửa hàng</Link>
      </section>
    );
  }

  const handleAdd = () => {
    add(product, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
      <section className="section section--top">
        <div className="container">
          <motion.nav variants={fadeUp} className="crumbs" style={{ marginBottom: "2rem" }}>
            <Link to="/shop" className="interactive">Sản phẩm</Link> <span>/</span> 
            <span style={{ color: "var(--green-700)", fontWeight: 500 }}>{product.name}</span>
          </motion.nav>

          <div className="pdp">
            <motion.div variants={fadeUp} className="pdp__media">
              <motion.div whileHover={{ scale: 1.02 }} transition={{ duration: 0.4 }}>
                <Photo art={product.art} ratio="1 / 1" style={{ borderRadius: "var(--radius-lg)" }} imgUrl={product.imageUrl} />
              </motion.div>
            </motion.div>

            <motion.div variants={staggerContainer} className="pdp__info">
              <motion.div variants={fadeUp} className="pdp__meta">
                <span className="chip chip--green">{product.maker}</span>
                <span className="muted">📍 {product.region}</span>
              </motion.div>
              <motion.h1 variants={fadeUp} style={{ fontSize: "clamp(2rem, 5vw, 3rem)", lineHeight: 1.2 }}>
                {product.name}
              </motion.h1>
              <motion.p variants={fadeUp} className="pdp__price">{formatVND(product.price)}</motion.p>
              <motion.p variants={fadeUp} className="pdp__desc" style={{ fontSize: "1.1rem" }}>{product.description}</motion.p>

              <motion.ul variants={fadeUp} className="pdp__specs">
                <li><span className="muted">Chất liệu</span><strong>{product.materials.join(' · ')}</strong></li>
                <li><span className="muted">Kích thước</span><strong>{product.size}</strong></li>
                <li>
                  <span className="muted">Còn lại</span>
                  <strong style={{ color: product.stock > 0 ? "inherit" : "var(--red-600)" }}>
                    {product.stock > 0 ? `${product.stock} chiếc` : 'Tạm hết'}
                  </strong>
                </li>
              </motion.ul>

              <motion.div variants={fadeUp} className="pdp__buy">
                <div className="qty" style={{ background: "var(--surface)", border: "1px solid var(--border-strong)" }}>
                  <button className="interactive" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Giảm">−</button>
                  <span style={{ fontWeight: 500 }}>{qty}</span>
                  <button
                    className="interactive"
                    onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                    aria-label="Tăng"
                  >
                    +
                  </button>
                </div>
                <motion.button 
                  whileHover={{ scale: product.stock > 0 ? 1.03 : 1 }}
                  whileTap={{ scale: product.stock > 0 ? 0.97 : 1 }}
                  className={`btn btn--accent btn--lg pdp__add ${added ? 'btn--success' : ''}`} 
                  onClick={handleAdd} 
                  disabled={product.stock === 0}
                  style={{ 
                    transition: "background 0.3s ease",
                    background: added ? "var(--green-600)" : "",
                    borderColor: added ? "var(--green-600)" : ""
                  }}
                >
                  {added ? '✨ Đã thêm vào giỏ' : 'Thêm vào giỏ'}
                </motion.button>
              </motion.div>

              <motion.p variants={fadeUp} className="pdp__assurance muted" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "1.5rem" }}>
                <span>🤲 Trực tiếp tới tay nghệ nhân</span>
                <span>·</span>
                <span>🍱 Góp bữa trưa cho trẻ em</span>
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {story && (
        <section className="section pdp-story">
          <div className="container">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true, margin: "-100px" }}
              variants={staggerContainer}
              className="pdp-story__inner"
            >
              <motion.div variants={fadeUp}>
                <Photo art={story.art} ratio="4 / 3" className="pdp-story__img" style={{ borderRadius: "var(--radius-lg)" }} imgUrl={story.imageUrl} />
              </motion.div>
              <motion.div variants={staggerContainer}>
                <motion.span variants={fadeUp} className="eyebrow">Câu chuyện đằng sau</motion.span>
                <motion.h2 variants={fadeUp} style={{ fontSize: "2.5rem" }}>{story.title}</motion.h2>
                <motion.p variants={fadeUp} className="muted" style={{ fontSize: "1.2rem", fontWeight: 500 }}>{story.excerpt}</motion.p>
                <motion.p variants={fadeUp} className="pdp-story__body">{story.body[0]}</motion.p>
                <motion.div variants={fadeUp}>
                  <Link to={`/cau-chuyen/${story.slug}`} className="btn btn--ghost interactive">
                    Đọc toàn bộ câu chuyện <span style={{ marginLeft: "0.5rem" }}>→</span>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {related && related.length > 0 && (
        <section className="section">
          <div className="container">
            <motion.div 
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
            >
              <motion.div variants={fadeUp} className="section-head">
                <h2 style={{ fontSize: "2rem" }}>Có thể bạn cũng thích</h2>
              </motion.div>
              <motion.div variants={fadeUp} className="grid cols-3">
                {related.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
    </motion.div>
  );
}

