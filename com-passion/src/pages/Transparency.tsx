import { motion } from 'framer-motion';
import { api } from '../lib/api';
import ReportCard from '../components/ReportCard';
import { useApi } from '../lib/useApi';
import CountUp from '../components/CountUp';
import { ErrorNote } from '../components/Status';
import { Skeleton, SkeletonText } from '../components/Skeleton';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

export default function Transparency() {
  const statsState = useApi(() => api.impactStats());
  const reportsState = useApi(() => api.reports());

  return (
    <>
      <section className="pagehead">
        <div className="container">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.span variants={fadeUp} className="eyebrow">Minh bạch</motion.span>
            <motion.h1 variants={fadeUp}>Từng đồng, công khai</motion.h1>
            <motion.p variants={fadeUp} className="lead">
              Chúng tôi tin rằng lòng tin được xây từ sự minh bạch. Dưới đây là báo cáo định kỳ
              và hoá đơn của dự án.
            </motion.p>
          </motion.div>
        </div>
      </section>

      <section className="section section--top">
        <div className="container">
          {statsState.loading && (
            <div className="grid cols-4 tstats">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="tstat card">
                  <Skeleton style={{ height: '3rem', width: '3rem', margin: '0 auto 0.5rem', borderRadius: '50%' }} />
                  <Skeleton style={{ height: '2rem', width: '60%', margin: '0 auto 0.5rem', borderRadius: '4px' }} />
                  <Skeleton style={{ height: '1rem', width: '80%', margin: '0 auto', borderRadius: '4px' }} />
                </div>
              ))}
            </div>
          )}
          {statsState.error && <ErrorNote message={statsState.error} />}
          {statsState.data && (
            <motion.div className="grid cols-4 tstats" initial="hidden" animate="visible" variants={staggerContainer}>
              {statsState.data.slice(0, 4).map((s) => (
                <motion.div key={s.key} variants={fadeUp} className="tstat card">
                  <span className="impact__emoji">{s.emoji}</span>
                  <strong><CountUp to={s.value} prefix={s.prefix} suffix={s.suffix} /></strong>
                  <span className="muted">{s.label}</span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div className="section-head" initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-50px" }} variants={fadeUp}>
            <span className="eyebrow">Báo cáo định kỳ</span>
            <h2>Tiền đã đi về đâu?</h2>
          </motion.div>

          {reportsState.loading && (
            <div className="reports">
              {Array.from({ length: 2 }).map((_, i) => (
                <article key={i} className="report card">
                  <header className="report__head">
                    <div>
                      <Skeleton style={{ width: '80px', height: '24px', borderRadius: 'var(--radius-pill)', marginBottom: '0.5rem' }} />
                      <Skeleton style={{ height: '1.5rem', width: '200px', marginBottom: '0.5rem' }} />
                      <SkeletonText lines={2} style={{ width: '300px' }} />
                    </div>
                    <div className="report__total">
                      <Skeleton style={{ width: '100px', height: '1.2rem', marginBottom: '0.5rem' }} />
                      <Skeleton style={{ width: '150px', height: '2rem' }} />
                    </div>
                  </header>
                  <Skeleton style={{ height: '16px', width: '100%', borderRadius: 'var(--radius-pill)', marginTop: '2rem' }} />
                </article>
              ))}
            </div>
          )}
          {reportsState.error && <ErrorNote message={reportsState.error} />}
          {reportsState.data && (
            <motion.div className="reports" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}>
              {reportsState.data.map((r) => (
                <ReportCard key={r.id} report={r} variants={fadeUp} />
              ))}
            </motion.div>
          )}
        </div>
      </section>
    </>
  );
}
