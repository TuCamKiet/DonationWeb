import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { api, errorMessage } from '../lib/api';
import { formatVND, type Order } from '../data/types';
import Photo from '../components/Photo';

const donationOptions = [0, 10000, 20000, 50000];

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

export default function Cart() {
  const { lines, subtotal, setQty, remove, clear } = useCart();
  const { user, refresh } = useAuth();
  const navigate = useNavigate();

  const [donation, setDonation] = useState(10000);
  const [custom, setCustom] = useState('');
  const [placed, setPlaced] = useState<Order | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const donateValue = custom ? Math.max(0, Number(custom) || 0) : donation;
  const total = subtotal + donateValue;

  const checkout = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const order = await api.createOrder({
        items: lines.map((l) => ({ productId: l.product.id, qty: l.qty })),
        donation: donateValue,
      });
      clear();
      setPlaced(order);
      void refresh();
      window.scrollTo({ top: 0 });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };



  if (placed) {
    return (
      <section className="section section--top container">
        <motion.div className="confirm card" initial="hidden" animate="visible" variants={fadeUp}>
          <span className="confirm__emoji">🌿</span>
          <h1>Cảm ơn bạn!</h1>
          <p className="lead">
            Đơn <strong>{placed.id}</strong> đã được ghi nhận. Bạn vừa giúp các cô chú nghệ nhân
            {placed.donation > 0 && <> và đóng góp thêm <strong>{formatVND(placed.donation)}</strong></>}.
          </p>
          <p className="muted">Tổng cộng: {formatVND(placed.total)}</p>
          <div className="confirm__cta">
            <Link to="/shop" className="btn btn--accent interactive">Tiếp tục mua sắm</Link>
            <Link to="/tai-khoan" className="btn btn--ghost interactive">Xem hành trình của tôi</Link>
          </div>
        </motion.div>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="section section--top container">
        <motion.div className="empty" initial="hidden" animate="visible" variants={fadeUp}>
          <span className="empty__emoji">🛍️</span>
          <h1>Giỏ hàng đang trống</h1>
          <p className="muted">Hãy chọn một chiếc giỏ — và bắt đầu một câu chuyện.</p>
          <Link to="/shop" className="btn btn--accent interactive">Xem sản phẩm</Link>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="section section--top">
      <div className="container">
        <motion.h1 className="cart__title" initial="hidden" animate="visible" variants={fadeUp}>
          Giỏ hàng của bạn
        </motion.h1>
        <div className="cart">
          <motion.div className="cart__lines" initial="hidden" animate="visible" variants={staggerContainer}>
            {lines.map((l) => (
              <motion.div key={l.product.id} variants={fadeUp} className="cline card">
                <Photo art={l.product.art} ratio="1 / 1" className="cline__img" imgUrl={l.product.imageUrl} />
                <div className="cline__info">
                  <Link to={`/san-pham/${l.product.slug}`} className="cline__name interactive">{l.product.name}</Link>
                  <span className="muted">{l.product.maker} · {l.product.region}</span>
                  <button className="cline__remove interactive" onClick={() => remove(l.product.id)}>Xoá</button>
                </div>
                <div className="cline__actions">
                  <div className="cline__qty qty">
                    <button className="interactive" onClick={() => setQty(l.product.id, l.qty - 1)} aria-label="Giảm">−</button>
                    <span>{l.qty}</span>
                    <button className="interactive" onClick={() => setQty(l.product.id, l.qty + 1)} aria-label="Tăng">+</button>
                  </div>
                  <span className="cline__price">{formatVND(l.product.price * l.qty)}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.aside className="cart__summary card" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <h3>Tóm tắt đơn hàng</h3>

            <div className="donate">
              <span className="donate__label">💚 Góp thêm cho cộng đồng?</span>
              <p className="muted donate__hint">100% khoản này vào quỹ bữa trưa cho các em nhỏ.</p>
              <div className="donate__opts">
                {donationOptions.map((d) => (
                  <button
                    key={d}
                    className={`pill interactive ${!custom && donation === d ? 'is-active' : ''}`}
                    onClick={() => { setDonation(d); setCustom(''); }}
                  >
                    {d === 0 ? 'Không' : formatVND(d)}
                  </button>
                ))}
              </div>
              <input
                className="input donate__custom interactive"
                type="number"
                min={0}
                placeholder="Số tiền khác (₫)"
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
              />
            </div>

            <dl className="summary__rows">
              <div><dt>Tạm tính</dt><dd>{formatVND(subtotal)}</dd></div>
              <div><dt>Đóng góp thêm</dt><dd>{formatVND(donateValue)}</dd></div>
              <div className="summary__total"><dt>Tổng cộng</dt><dd>{formatVND(total)}</dd></div>
            </dl>

            {user ? (
              <button className="btn btn--accent btn--block btn--lg interactive" onClick={checkout} disabled={submitting}>
                {submitting ? 'Đang xử lý…' : 'Thanh toán'}
              </button>
            ) : (
              <div className="cart__login" style={{ textAlign: 'center', marginBottom: '1rem' }}>
                <p className="muted" style={{ marginBottom: '0.8rem' }}>Vui lòng đăng nhập để thanh toán:</p>
                <Link to="/dang-nhap" className="btn btn--accent btn--block interactive" state={{ from: '/gio-hang' }}>
                  Đến trang Đăng nhập
                </Link>
              </div>
            )}

            {error && <p role="alert" style={{ color: '#c0392b' }}>⚠️ {error}</p>}

            <button className="btn btn--ghost btn--block interactive" onClick={() => navigate('/shop')}>
              Tiếp tục mua sắm
            </button>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
