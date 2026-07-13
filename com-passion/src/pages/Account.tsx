import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, badgeFor } from "../context/AuthContext";
import { formatVND } from "../data/types";
import { Loading } from "../components/Status";
import AvatarUploader from "../components/AvatarUploader";
import { api } from "../lib/api";
import { SkeletonAccount } from "../components/Skeleton";
import {
  Heart,
  ShoppingBag,
  Award,
  LogOut,
  Package,
  ShieldCheck,
  ArrowRight,
  Edit2,
  CheckCircle,
} from "lucide-react";

const allBadges = [
  { name: "Hạt giống", emoji: "🌱", tier: 1, at: "Đơn hàng đầu tiên" },
  { name: "Người đồng hành", emoji: "🌿", tier: 2, at: "Đóng góp 500.000₫" },
  { name: "Người gieo mầm", emoji: "🌳", tier: 3, at: "Đóng góp 1.000.000₫" },
];

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

export default function Account() {
  const {
    user,
    loading,
    logout,
    refresh,
    totalContribution,
    updateUserProfile,
    resetPassword,
  } = useAuth();
  const navigate = useNavigate();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState<string | File>("");
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [isResetting, setIsResetting] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showAllOrders, setShowAllOrders] = useState(false);

  useEffect(() => {
    if (isEditModalOpen) {
      if (user) {
        setEditName(user.name);
        setEditAvatar(user.avatar || "");
      }
      setEditError("");
      setEditSuccess(false);
      setResetSent(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditModalOpen]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) {
      setEditError("Tên hiển thị không hợp lệ.");
      return;
    }
    setEditError("");
    setIsSaving(true);
    try {
      let finalAvatarUrl = user?.avatar || "";
      
      if (editAvatar && editAvatar !== user?.avatar && typeof editAvatar !== "string") {
        try {
          const res = await api.uploadImage(editAvatar);
          finalAvatarUrl = res.url;
        } catch (err: any) {
          setEditError("Lỗi tải ảnh lên: " + (err.message || String(err)));
          setIsSaving(false);
          return;
        }
      } else if (typeof editAvatar === "string") {
        finalAvatarUrl = editAvatar;
      }

      if (editName !== user?.name || finalAvatarUrl !== (user?.avatar || "")) {
        await updateUserProfile(editName, finalAvatarUrl);
      }

      setEditSuccess(true);
      setTimeout(() => {
        setIsEditModalOpen(false);
        setEditSuccess(false);
      }, 1500);
    } catch (err: any) {
      setEditError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (user) void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <section className="section section--top container">
        <SkeletonAccount />
      </section>
    );
  }

  if (!user) {
    return (
      <section className="section section--top container">
        <motion.div
          className="empty"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
        >
          <span className="empty__emoji">👤</span>
          <h1>Bạn chưa đăng nhập</h1>
          <p className="muted">
            Đăng nhập để theo dõi hành trình đóng góp của mình.
          </p>
          <Link to="/dang-nhap" className="btn btn--accent interactive">
            Đăng nhập hoặc Đăng ký
          </Link>
        </motion.div>
      </section>
    );
  }

  const badge = badgeFor(totalContribution);
  const meals = Math.floor(totalContribution / 25000); // ~25k/bữa, ước tính

  const displayedOrders = showAllOrders ? user.orders : user.orders.slice(0, 2);

  return (
    <section
      className="section section--top"
      style={{
        background:
          "linear-gradient(to bottom, var(--cream) 0%, transparent 800px)",
      }}
    >
      <div className="container">
        <motion.div
          className="account__head card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            display: "block",
            padding: 0,
            overflow: "hidden",
            position: "relative",
            border: "1px solid var(--border)",
            boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
          }}
        >
          {/* Abstract Theme Gradient Background */}
          <div
            style={{
              width: "100%",
              height: "200px",
              background: `
                radial-gradient(circle at 10% 150%, rgba(224, 122, 63, 0.15) 0%, transparent 50%),
                radial-gradient(circle at 90% -20%, rgba(31, 84, 64, 0.15) 0%, transparent 40%),
                radial-gradient(circle at 50% 50%, rgba(224, 122, 63, 0.05) 0%, transparent 60%),
                linear-gradient(135deg, var(--sand-400) 0%, var(--sand-100) 100%)
              `,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* SVG Blobs for artistic artisan feel */}
            <svg
              style={{
                position: "absolute",
                top: "-50px",
                left: "-20px",
                width: "250px",
                height: "250px",
                opacity: 0.03,
                fill: "var(--green-900)",
              }}
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M45.7,-76.4C58.9,-69.3,69,-55.4,76.5,-40.7C84,-26,88.9,-10.5,88.1,4.7C87.4,20,81,34.9,71.1,46.5C61.3,58,47.9,66.1,33.5,72.4C19.1,78.7,3.6,83.1,-11.4,80.7C-26.4,78.4,-41,69.4,-53.4,58C-65.7,46.6,-75.8,32.8,-81.8,17.2C-87.7,1.5,-89.6,-16,-83.4,-30.5C-77.2,-45.1,-63,-56.6,-48.5,-63.3C-34,-70.1,-17,-72.1,0.1,-72.3C17.3,-72.5,32.5,-83.5,45.7,-76.4Z"
                transform="translate(100 100)"
              />
            </svg>
            <svg
              style={{
                position: "absolute",
                bottom: "-80px",
                right: "-30px",
                width: "300px",
                height: "300px",
                opacity: 0.03,
                fill: "var(--clay-600)",
              }}
              viewBox="0 0 200 200"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M49.6,-70.5C63.6,-61.2,74,-46.5,80.1,-30.2C86.1,-13.9,87.8,4.1,82.4,20.1C77,36,64.6,50,50.1,60.2C35.6,70.5,18.9,77.1,1.4,75.1C-16.1,73.1,-32.2,62.4,-46.8,50.5C-61.4,38.6,-74.5,25.4,-79.6,9.5C-84.8,-6.4,-82,-25,-71.7,-39C-61.5,-53.1,-43.8,-62.7,-27.9,-70C-12.1,-77.3,1.9,-82.3,17.2,-79.2C32.4,-76,35.6,-79.8,49.6,-70.5Z"
                transform="translate(100 100)"
              />
            </svg>
          </div>
          <div
            style={{
              padding: "0 2rem 2.5rem",
              marginTop: "-50px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: "1.5rem",
              position: "relative",
              zIndex: 2,
            }}
          >
            <div
              className="account__id"
              style={{
                gap: "1.5rem",
                alignItems: "flex-end",
                flexWrap: "wrap",
              }}
            >
              {user.avatar ? (
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2,
                  }}
                  src={user.avatar}
                  alt=""
                  className="account__avatar"
                  style={{
                    objectFit: "cover",
                    borderRadius: "50%",
                    width: "100px",
                    height: "100px",
                    border: "4px solid #fff",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    background: "#fff",
                  }}
                  referrerPolicy="no-referrer"
                />
              ) : (
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    damping: 20,
                    delay: 0.2,
                  }}
                  className="account__avatar"
                  style={{
                    width: "100px",
                    height: "100px",
                    fontSize: "3rem",
                    border: "4px solid #fff",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                    background: "var(--green-700)",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "50%",
                  }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </motion.span>
              )}
              <div style={{ paddingBottom: "0.5rem" }}>
                <h1
                  style={{
                    fontSize: "2.2rem",
                    marginBottom: "0.2rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  Chào {user.name} 👋
                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--clay-500)",
                      display: "flex",
                      alignItems: "center",
                    }}
                    title="Chỉnh sửa hồ sơ"
                  >
                    <Edit2 size={24} />
                  </button>
                </h1>
                <p
                  className="muted"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    wordBreak: "break-all",
                  }}
                >
                  <ShieldCheck
                    size={16}
                    color="var(--green-700)"
                    style={{ flexShrink: 0 }}
                  />
                  {user.email}
                </p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="btn interactive"
              style={{
                marginBottom: "0.5rem",
                background: "rgba(255,255,255,0.8)",
                backdropFilter: "blur(4px)",
                color: "var(--text)",
                border: "1px solid var(--border)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onClick={() => {
                logout();
                navigate("/");
              }}
            >
              <LogOut size={16} /> Đăng xuất
            </motion.button>
          </div>
        </motion.div>

        <motion.div
          className="account__stats"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          style={{
            gap: "1.5rem",
            marginTop: "1.5rem",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
          }}
        >
          <motion.div
            className="astat card"
            variants={fadeUp}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              borderColor: "var(--clay-500)",
            }}
            style={{ transition: "all 0.3s ease", width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.8rem",
              }}
            >
              <Heart size={20} color="var(--clay-500)" />
              <span className="muted" style={{ fontWeight: 500 }}>
                Tổng đóng góp
              </span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--green-700)" }}>
              {formatVND(totalContribution)}
            </strong>
          </motion.div>
          <motion.div
            className="astat card"
            variants={fadeUp}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              borderColor: "var(--sand-600)",
            }}
            style={{ transition: "all 0.3s ease", width: "100%" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.8rem",
              }}
            >
              <ShoppingBag size={20} color="var(--sand-600)" />
              <span className="muted" style={{ fontWeight: 500 }}>
                Đơn hàng
              </span>
            </div>
            <strong style={{ fontSize: "1.8rem", color: "var(--text)" }}>
              {user.orders.length}
            </strong>
          </motion.div>
          <motion.div
            className="astat card astat--badge"
            variants={fadeUp}
            whileHover={{
              y: -5,
              boxShadow: "0 10px 30px rgba(0,0,0,0.08)",
              borderColor: "var(--green-700)",
            }}
            style={{
              transition: "all 0.3s ease",
              background: "linear-gradient(145deg, #fff, var(--cream))",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.8rem",
              }}
            >
              <Award size={20} color="var(--green-700)" />
              <span className="muted" style={{ fontWeight: 500 }}>
                Huy hiệu hiện tại
              </span>
            </div>
            <strong
              style={{
                fontSize: "1.4rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "var(--text)",
              }}
            >
              <span style={{ fontSize: "1.8rem" }}>{badge.emoji}</span>{" "}
              {badge.name}
            </strong>
          </motion.div>
        </motion.div>

        <motion.div
          className="account__impact card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          transition={{ delay: 0.3 }}
          style={{
            marginTop: "1.5rem",
            background: "var(--green-700)",
            color: "white",
            padding: "2rem",
            display: "flex",
            alignItems: "center",
            gap: "1.5rem",
            borderRadius: "var(--radius-lg)",
            boxShadow: "0 10px 30px rgba(31, 84, 64, 0.2)",
            fontSize: "1.1rem",
            flexWrap: "wrap",
          }}
        >
          <span style={{ fontSize: "3.5rem" }}>🍱</span>
          <div style={{ flex: "1 1 250px" }}>
            Đóng góp của bạn đã tương đương khoảng{" "}
            <strong style={{ color: "var(--sand-400)", fontSize: "1.3rem" }}>
              {meals} bữa trưa
            </strong>{" "}
            cho các em nhỏ vùng cao. <br />
            <span style={{ opacity: 0.9, fontSize: "0.95rem" }}>
              Mỗi một sản phẩm bạn mua đều đang góp phần tạo nên thay đổi thực
              tế. Cảm ơn bạn! 💚
            </span>
          </div>
        </motion.div>

        <div className="account__grid" style={{ marginTop: "3rem" }}>
          <motion.section
            className="account__orders"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ delay: 0.4 }}
          >
            <motion.h2
              variants={fadeUp}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "1.5rem",
              }}
            >
              <Package size={24} color="var(--green-700)" /> Lịch sử đơn hàng
            </motion.h2>
            {user.orders.length === 0 ? (
              <motion.div
                className="card"
                variants={fadeUp}
                style={{
                  textAlign: "center",
                  padding: "4rem 2rem",
                  background: "var(--cream)",
                  border: "1px dashed var(--border)",
                }}
              >
                <span style={{ fontSize: "3rem", opacity: 0.5 }}>🛒</span>
                <p
                  className="muted"
                  style={{ marginTop: "1rem", fontSize: "1.1rem" }}
                >
                  Chưa có đơn hàng nào.
                  <br />
                  Hãy dạo quanh cửa hàng và chọn cho mình một món đồ thủ công
                  nhé!
                </p>
                <Link
                  to="/shop"
                  className="btn btn--accent interactive"
                  style={{
                    marginTop: "1.5rem",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  Đến Cửa hàng <ArrowRight size={16} />
                </Link>
              </motion.div>
            ) : (
              <div
                className="orders"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {displayedOrders.map((o) => (
                  <motion.article
                    key={o.id}
                    className="order card"
                    variants={fadeUp}
                    whileHover={{
                      scale: 1.01,
                      boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
                    }}
                    style={{ transition: "all 0.3s ease", padding: "1.5rem" }}
                  >
                    <header
                      className="order__head"
                      style={{
                        borderBottom: "1px dashed var(--border)",
                        paddingBottom: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "1.1rem",
                          color: "var(--green-700)",
                        }}
                      >
                        #{o.id.toUpperCase()}
                      </strong>
                      <span
                        className="muted"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                        }}
                      >
                        🕒{" "}
                        {new Date(o.date).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </header>
                    <ul
                      className="order__items"
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.8rem",
                        paddingBottom: "1rem",
                      }}
                    >
                      {o.items.map((it, i) => (
                        <li
                          key={i}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "1rem",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              style={{
                                background: "var(--cream)",
                                padding: "0.2rem 0.6rem",
                                borderRadius: "1rem",
                                fontSize: "0.85rem",
                                fontWeight: 600,
                              }}
                            >
                              x{it.qty}
                            </span>
                            {it.name}
                          </span>
                          <span style={{ fontWeight: 500 }}>
                            {formatVND(it.price * it.qty)}
                          </span>
                        </li>
                      ))}
                      {o.donation > 0 && (
                        <li
                          className="order__donate"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginTop: "0.5rem",
                            padding: "0.8rem",
                            background: "var(--cream)",
                            borderRadius: "var(--radius-sm)",
                            color: "var(--clay-500)",
                            flexWrap: "wrap",
                            gap: "1rem",
                          }}
                        >
                          <span
                            style={{
                              fontWeight: 500,
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <Heart size={16} fill="currentColor" /> Đóng góp
                            thêm
                          </span>
                          <span style={{ fontWeight: 600 }}>
                            {formatVND(o.donation)}
                          </span>
                        </li>
                      )}
                    </ul>
                    <footer
                      className="order__foot"
                      style={{
                        borderTop: "1px solid var(--border)",
                        paddingTop: "1rem",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "1rem",
                      }}
                    >
                      <span className="muted">Tổng cộng</span>
                      <strong
                        style={{ fontSize: "1.3rem", color: "var(--text)" }}
                      >
                        {formatVND(o.total)}
                      </strong>
                    </footer>
                  </motion.article>
                ))}
                {user.orders.length > 2 && (
                  <motion.div variants={fadeUp} style={{ textAlign: "center", marginTop: "1rem" }}>
                    <button
                      className="btn btn--outline interactive"
                      onClick={() => setShowAllOrders(!showAllOrders)}
                      style={{
                        background: "transparent",
                        borderColor: "var(--clay-500)",
                        color: "var(--clay-700)",
                        padding: "0.5rem 1.5rem"
                      }}
                    >
                      {showAllOrders ? "Thu gọn" : `Xem thêm ${user.orders.length - 2} đơn hàng cũ hơn`}
                    </button>
                  </motion.div>
                )}
              </div>
            )}
          </motion.section>

          <motion.aside
            className="account__badges"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            transition={{ delay: 0.6 }}
          >
            <motion.div
              className="card"
              variants={fadeUp}
              style={{ background: "var(--cream)", border: "none" }}
            >
              <h2
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <Award size={24} color="var(--clay-500)" /> Hành trình huy hiệu
              </h2>
              <p className="muted" style={{ marginBottom: "1.5rem" }}>
                Mua và đóng góp nhiều hơn để mở khoá những cột mốc ấm áp.
              </p>
              <div
                className="badges"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {allBadges.map((b) => {
                  const unlocked = badge.tier >= b.tier;
                  return (
                    <motion.div
                      key={b.name}
                      className={`badge ${unlocked ? "is-unlocked" : ""}`}
                      variants={fadeUp}
                      whileHover={unlocked ? { scale: 1.03 } : {}}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        background: unlocked ? "#fff" : "rgba(255,255,255,0.5)",
                        borderRadius: "var(--radius-sm)",
                        border: unlocked
                          ? "1px solid var(--border)"
                          : "1px dashed var(--border)",
                        opacity: unlocked ? 1 : 0.6,
                        transition: "all 0.3s ease",
                      }}
                    >
                      <span
                        className="badge__emoji"
                        style={{
                          fontSize: "2.2rem",
                          filter: unlocked
                            ? "none"
                            : "grayscale(100%) opacity(0.5)",
                        }}
                      >
                        {unlocked ? b.emoji : "🔒"}
                      </span>
                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: unlocked ? "var(--green-700)" : "inherit",
                            fontSize: "1.1rem",
                          }}
                        >
                          {b.name}
                        </strong>
                        <span className="muted" style={{ fontSize: "0.85rem" }}>
                          {b.at}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </motion.aside>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {createPortal(
        <AnimatePresence>
          {isEditModalOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (!isSaving) setIsEditModalOpen(false);
              }}
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100vw",
                height: "100vh",
                background: "rgba(0,0,0,0.5)",
                zIndex: 1000,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "1rem",
                boxSizing: "border-box",
              }}
            >
              <motion.div
                onClick={(e) => e.stopPropagation()}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              style={{
                background: "var(--surface)",
                padding: "1.5rem",
                borderRadius: "var(--radius-lg)",
                width: "100%",
                maxWidth: "700px",
                maxHeight: "96vh",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
              }}
            >
              <h2 style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
                Chỉnh sửa hồ sơ
              </h2>
              {editError && (
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "1rem",
                    background: "#fee2e2",
                    color: "#991b1b",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.95rem",
                  }}
                >
                  {editError}
                </div>
              )}

              {editSuccess ? (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{ textAlign: "center", padding: "3rem 1rem" }}
                >
                  <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>
                    🌿
                  </div>
                  <h3
                    style={{
                      color: "var(--green-700)",
                      fontSize: "1.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Đã cập nhật hồ sơ!
                  </h3>
                  <p className="muted">
                    Những thay đổi của bạn đã được lưu lại.
                  </p>
                </motion.div>
              ) : (
                <form
                  onSubmit={handleSaveProfile}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    flex: 1,
                    overflow: "hidden"
                  }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: "1rem" }}>
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", height: "100%" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        <label>
                          <strong
                            style={{ display: "block", marginBottom: "0.25rem", fontSize: "0.95rem" }}
                          >
                            Tên hiển thị
                          </strong>
                          <input
                            className="input"
                            type="text"
                            required
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={isSaving}
                            style={{
                              opacity: isSaving ? 0.6 : 1,
                            }}
                          />
                        </label>
                        <h3
                          style={{
                            fontSize: "1rem",
                            color: "var(--green-700)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            margin: "0.5rem 0 0 0"
                          }}
                        >
                          <ShieldCheck size={16} /> Bảo mật
                        </h3>
                      </div>
                      
                      <div style={{ marginTop: "auto", paddingTop: "0.5rem" }}>
                        {!resetSent ? (
                          <button
                            type="button"
                            onClick={async () => {
                              setIsResetting(true);
                              setEditError("");
                              try {
                                await resetPassword(user.email);
                                setResetSent(true);
                              } catch (err: any) {
                                setEditError("Lỗi khi gửi email: " + err.message);
                              } finally {
                                setIsResetting(false);
                              }
                            }}
                            disabled={isResetting || isSaving}
                            className="btn btn--light interactive"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              gap: "0.5rem",
                              padding: "0.6rem",
                              width: "100%",
                              background: "var(--cream)",
                              border: "1px solid var(--border)",
                              color: "var(--text)",
                              fontWeight: 500,
                              fontSize: "0.95rem",
                              opacity: (isResetting || isSaving) ? 0.6 : 1,
                              pointerEvents: (isResetting || isSaving) ? "none" : "auto",
                            }}
                          >
                            {isResetting ? "Đang gửi..." : "Gửi email tạo mật khẩu mới"}
                          </button>
                        ) : (
                          <div style={{ color: "var(--green-700)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.6rem", background: "var(--green-50)", borderRadius: "var(--radius-sm)" }}>
                            <CheckCircle size={16} /> Đã gửi email khôi phục!
                          </div>
                        )}
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                      <strong style={{ display: "block", fontSize: "0.95rem" }}>
                        Ảnh đại diện
                      </strong>
                      <AvatarUploader value={editAvatar} onChange={setEditAvatar} disabled={isSaving} />
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      marginTop: "auto",
                      borderTop: "1px solid var(--border)",
                      paddingTop: "1rem"
                    }}
                  >
                    <button
                      type="button"
                      className="btn interactive"
                      onClick={() => setIsEditModalOpen(false)}
                      disabled={isSaving}
                      style={{
                        flex: 1,
                        background: "none",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        opacity: isSaving ? 0.6 : 1,
                        pointerEvents: isSaving ? "none" : "auto",
                      }}
                    >
                      Hủy bỏ
                    </button>
                    <button
                      type="submit"
                      className="btn btn--accent interactive"
                      disabled={isSaving}
                      style={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}
                    >
                      {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </section>
  );
}
