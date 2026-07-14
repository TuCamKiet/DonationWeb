import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

export default function NewsletterSignup() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (user) setEmail(user.email);
  }, [user]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email && !user) return;
    // TODO(backend): gửi email tới dịch vụ newsletter thật (Mailchimp/Resend...).
    setDone(true);
  };

  return (
    <div className="newsletter card">
      <div className="newsletter__text">
        <span className="eyebrow">Thư đầu tháng</span>
        <h3>Nhận câu chuyện của tháng qua email</h3>
        <p className="muted">
          Đầu mỗi tháng, chúng tôi gửi bạn sản phẩm mới, câu chuyện của tháng trước và
          tổng số tiền đã đóng góp cho cộng đồng.
        </p>
      </div>

      <AnimatePresence mode="wait">
        {done ? (
          <motion.p 
            key="done"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="newsletter__done"
          >
            🌿 Cảm ơn bạn! Hẹn gặp lại trong thư đầu tháng tới.
          </motion.p>
        ) : (
          <motion.form 
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className="newsletter__form" 
            onSubmit={submit}
          >
            {user ? (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem', 
                background: 'rgba(255, 255, 255, 0.7)', 
                padding: '0.8rem 1rem', 
                borderRadius: 'var(--radius)',
                border: '1px solid #fff',
                boxShadow: '0 4px 15px -5px rgba(0,0,0,0.05)',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  width: '42px', height: '42px', 
                  borderRadius: '50%', 
                  background: 'var(--green-50)', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.2rem',
                  border: '1px solid var(--green-200)'
                }}>
                  💌
                </div>
                <div style={{ flex: '1 1 min-content' }}>
                  <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>Tài khoản của bạn</p>
                  <p style={{ margin: 0, fontWeight: 600, color: 'var(--green-900)' }}>{user.email}</p>
                </div>
                <button className="btn btn--accent interactive" type="submit" style={{ padding: '0.75rem 1.6rem', whiteSpace: 'nowrap' }}>
                  Đăng ký ngay
                </button>
              </div>
            ) : (
              <>
                <input
                  className="input interactive"
                  type="email"
                  required
                  minLength={5}
                  placeholder="email@cua-ban.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email của bạn"
                  style={{ borderRadius: 'var(--radius-pill)', padding: '0.85rem 1.5rem' }}
                />
                <button className="btn btn--accent interactive" type="submit" style={{ padding: '0.85rem 1.8rem' }}>Đăng ký</button>
              </>
            )}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
