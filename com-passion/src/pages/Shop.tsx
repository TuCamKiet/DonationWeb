import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';
import { useApi } from '../lib/useApi';
import ProductCard from '../components/ProductCard';
import { Loading, ErrorNote } from '../components/Status';
import { SkeletonCard } from '../components/Skeleton';
import CustomSelect from '../components/CustomSelect';

const filters = [
  { key: 'all', label: 'Tất cả' },
  { key: 'gio', label: 'Giỏ' },
  { key: 'phu-kien', label: 'Phụ kiện' },
] as const;

type SortKey = 'featured' | 'price_asc' | 'price_desc';

const sortOptions = [
  { value: 'featured', label: 'Nổi bật' },
  { value: 'price_asc', label: 'Giá thấp → cao' },
  { value: 'price_desc', label: 'Giá cao → thấp' },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

export default function Shop() {
  const [cat, setCat] = useState<string>('all');
  const [sort, setSort] = useState<SortKey>('featured');

  const { data: products, loading, error } = useApi(
    () =>
      api.products({
        category: cat === 'all' ? undefined : cat,
        sort: sort === 'featured' ? undefined : sort,
      }),
    [cat, sort]
  );

  const list = products
    ? [...products].sort((a, b) => {
        const aOut = a.stock === 0;
        const bOut = b.stock === 0;
        if (aOut !== bOut) return aOut ? 1 : -1;
        if (sort === 'featured') {
          return Number(!!b.featured) - Number(!!a.featured);
        }
        return 0;
      })
    : [];

  return (
    <>
      <section className="pagehead">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="eyebrow">Cửa hàng</motion.span>
            <motion.h1 variants={fadeUp}>Sản phẩm thủ công</motion.h1>
            <motion.p variants={fadeUp} className="lead">
              Mỗi sản phẩm gắn với một cô chú nghệ nhân. Bấm vào để nghe câu chuyện đằng sau.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section section--top">
        <div className="container">
          <motion.div 
            className="shop__bar"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <div className="shop__filters">
              {filters.map((f) => (
                <button
                  key={f.key}
                  className={`pill interactive ${cat === f.key ? 'is-active' : ''}`}
                  onClick={() => setCat(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="shop__sort">
              <span className="muted">Sắp xếp</span>
              <CustomSelect
                value={sort}
                onChange={(val) => setSort(val as SortKey)}
                options={sortOptions}
              />
            </div>
          </motion.div>

          {loading && (
            <div className="grid cols-3 shop__grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}
          {error && <ErrorNote message={error} />}
          {!loading && !error && (
            <motion.div 
              className="grid cols-3 shop__grid"
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
            >
              {list.map((p) => (
                <motion.div key={p.id} variants={fadeUp}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}

