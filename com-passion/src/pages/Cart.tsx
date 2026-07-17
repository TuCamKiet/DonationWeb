import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { MailCheck, CheckCircle, Heart, Sparkles } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { api, errorMessage } from "../lib/api";
import { formatVND, type Order } from "../data/types";
import Photo from "../components/Photo";

const donationOptions = [0, 10000, 20000, 50000];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  },
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
  const [custom, setCustom] = useState("");
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
      <section
        className="section section--top container"
        style={{
          minHeight: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.8, bounce: 0.4 }}
            className="card"
            style={{
              maxWidth: "560px",
              width: "100%",
              padding: "3rem 2rem",
              textAlign: "center",
              position: "relative",
              overflow: "hidden",
              background:
                "linear-gradient(to bottom, var(--color-surface), #ffffff)",
              boxShadow:
                "0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)",
              border: "1px solid rgba(58, 128, 98, 0.1)",
            }}
          >
            {/* Background Decorative Blobs */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
              style={{
                position: "absolute",
                top: "-10%",
                left: "-10%",
                width: "200px",
                height: "200px",
                background:
                  "radial-gradient(circle, rgba(58, 128, 98, 0.08) 0%, rgba(255,255,255,0) 70%)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
              style={{
                position: "absolute",
                bottom: "-10%",
                right: "-10%",
                width: "250px",
                height: "250px",
                background:
                  "radial-gradient(circle, rgba(224, 122, 63, 0.05) 0%, rgba(255,255,255,0) 70%)",
                borderRadius: "50%",
                zIndex: 0,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              {/* Animated Success Emoji */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", delay: 0.2, bounce: 0.6 }}
                style={{
                  width: "80px",
                  height: "80px",
                  background: "rgba(58, 128, 98, 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 1.5rem auto",
                  fontSize: "3rem",
                  boxShadow: "0 10px 25px rgba(58, 128, 98, 0.1)",
                }}
              >
                🌿
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                style={{
                  fontSize: "2.5rem",
                  marginBottom: "0.5rem",
                  color: "var(--color-text)",
                }}
              >
                Cảm ơn bạn!{" "}
                <Sparkles
                  size={28}
                  color="#e07a3f"
                  style={{
                    display: "inline",
                    verticalAlign: "middle",
                    marginBottom: "8px",
                  }}
                />
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="lead"
                style={{
                  fontSize: "1.1rem",
                  color: "var(--color-muted)",
                  marginBottom: "1.5rem",
                  lineHeight: 1.6,
                }}
              >
                Đơn hàng <strong>{placed.id}</strong> đã được ghi nhận. Bạn vừa
                giúp đỡ cộng đồng nghệ nhân
                {placed.donation > 0 && (
                  <span>
                    {" "}
                    và đóng góp thêm{" "}
                    <strong>{formatVND(placed.donation)}</strong>{" "}
                    <Heart
                      size={16}
                      color="#e07a3f"
                      fill="#e07a3f"
                      style={{ display: "inline", verticalAlign: "text-top" }}
                    />
                  </span>
                )}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                style={{
                  display: "inline-block",
                  background: "rgba(58, 128, 98, 0.1)",
                  padding: "8px 24px",
                  borderRadius: "30px",
                  fontWeight: 600,
                  color: "var(--color-accent)",
                  marginBottom: "2rem",
                  fontSize: "1.2rem",
                }}
              >
                Tổng cộng: {formatVND(placed.total)}
              </motion.div>

              {/* Email Reminder Box */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                style={{
                  background:
                    "linear-gradient(135deg, rgba(58, 128, 98, 0.05) 0%, rgba(58, 128, 98, 0.1) 100%)",
                  padding: "16px 20px",
                  borderRadius: "16px",
                  border: "1px solid rgba(58, 128, 98, 0.15)",
                  margin: "0 0 2.5rem 0",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "16px",
                }}
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    repeat: Infinity,
                    duration: 2.5,
                    ease: "easeInOut",
                  }}
                  style={{
                    backgroundColor: "rgba(58, 128, 98, 0.15)",
                    color: "var(--color-accent)",
                    padding: "10px",
                    borderRadius: "50%",
                    display: "flex",
                    flexShrink: 0,
                  }}
                >
                  <MailCheck size={22} strokeWidth={2.5} />
                </motion.div>
                <div>
                  <p
                    style={{
                      margin: "0 0 4px 0",
                      fontWeight: 700,
                      color: "var(--color-accent)",
                      fontSize: "1.05rem",
                    }}
                  >
                    Hoá đơn đã được gửi!
                  </p>
                  <p
                    className="muted"
                    style={{ margin: 0, fontSize: "0.95rem", lineHeight: 1.5 }}
                  >
                    Chúng tôi vừa gửi một email xác nhận chi tiết đến hòm thư
                    của bạn. Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam)
                    nhé.
                  </p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "center",
                  flexWrap: "wrap",
                }}
              >
                <Link
                  to="/shop"
                  className="btn btn--accent interactive"
                  style={{
                    padding: "0.8rem 2rem",
                    fontSize: "1rem",
                    borderRadius: "30px",
                    boxShadow: "0 4px 15px rgba(58, 128, 98, 0.25)",
                  }}
                >
                  Tiếp tục mua sắm
                </Link>
                <Link
                  to="/tai-khoan"
                  className="btn btn--ghost interactive"
                  style={{
                    padding: "0.8rem 2rem",
                    fontSize: "1rem",
                    borderRadius: "30px",
                  }}
                >
                  Xem hành trình
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>
      </section>
    );
  }

  if (lines.length === 0) {
    return (
      <section className="section section--top container">
        <motion.div
          className="empty"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <span className="empty__emoji">🛍️</span>
          <h1>Giỏ hàng đang trống</h1>
          <p className="muted">
            Hãy chọn một chiếc giỏ — và bắt đầu một câu chuyện.
          </p>
          <Link to="/shop" className="btn btn--accent interactive">
            Xem sản phẩm
          </Link>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="section section--top">
      <div className="container">
        <motion.h1
          className="cart__title"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          Giỏ hàng của bạn
        </motion.h1>
        <div className="cart">
          <motion.div
            className="cart__lines"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            {lines.map((l) => (
              <motion.div
                key={l.product.id}
                variants={fadeUp}
                className="cline card"
              >
                <Photo
                  art={l.product.art}
                  ratio="1 / 1"
                  className="cline__img"
                  imgUrl={l.product.imageUrl}
                />
                <div className="cline__info">
                  <Link
                    to={`/san-pham/${l.product.slug}`}
                    className="cline__name interactive"
                  >
                    {l.product.name}
                  </Link>
                  <span className="muted">
                    {l.product.maker} · {l.product.region}
                  </span>
                  <button
                    className="cline__remove interactive"
                    onClick={() => remove(l.product.id)}
                  >
                    Xoá
                  </button>
                </div>
                <div className="cline__actions">
                  <div className="cline__qty qty">
                    <button
                      className="interactive"
                      onClick={() => setQty(l.product.id, l.qty - 1)}
                      aria-label="Giảm"
                    >
                      −
                    </button>
                    <span>{l.qty}</span>
                    <button
                      className="interactive"
                      onClick={() => setQty(l.product.id, l.qty + 1)}
                      aria-label="Tăng"
                    >
                      +
                    </button>
                  </div>
                  <span className="cline__price">
                    {formatVND(l.product.price * l.qty)}
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>

          <motion.aside
            className="cart__summary card"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3>Tóm tắt đơn hàng</h3>

            <div className="donate">
              <span className="donate__label">💚 Góp thêm cho cộng đồng?</span>
              <p className="muted donate__hint">
                100% khoản này vào quỹ bữa trưa cho các em nhỏ.
              </p>
              <div className="donate__opts">
                {donationOptions.map((d) => (
                  <button
                    key={d}
                    className={`pill interactive ${!custom && donation === d ? "is-active" : ""}`}
                    onClick={() => {
                      setDonation(d);
                      setCustom("");
                    }}
                  >
                    {d === 0 ? "Không" : formatVND(d)}
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
              <div>
                <dt>Tạm tính</dt>
                <dd>{formatVND(subtotal)}</dd>
              </div>
              <div>
                <dt>Đóng góp thêm</dt>
                <dd>{formatVND(donateValue)}</dd>
              </div>
              <div className="summary__total">
                <dt>Tổng cộng</dt>
                <dd>{formatVND(total)}</dd>
              </div>
            </dl>

            {user ? (
              <button
                className="btn btn--accent btn--block btn--lg interactive"
                onClick={checkout}
                disabled={submitting}
              >
                {submitting ? "Đang xử lý…" : "Thanh toán"}
              </button>
            ) : (
              <div
                className="cart__login"
                style={{ textAlign: "center", marginBottom: "1rem" }}
              >
                <p className="muted" style={{ marginBottom: "0.8rem" }}>
                  Vui lòng đăng nhập để thanh toán:
                </p>
                <Link
                  to="/dang-nhap"
                  className="btn btn--accent btn--block interactive"
                  state={{ from: "/gio-hang" }}
                >
                  Đến trang Đăng nhập
                </Link>
              </div>
            )}

            {error && (
              <p role="alert" style={{ color: "#c0392b" }}>
                ⚠️ {error}
              </p>
            )}

            <button
              className="btn btn--ghost btn--block interactive"
              onClick={() => navigate("/shop")}
            >
              Tiếp tục mua sắm
            </button>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
