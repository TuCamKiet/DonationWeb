import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import { errorMessage } from "../lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export default function Login() {
  const { loginWithGoogle, loginWithEmail, registerWithEmail, resetPassword } =
    useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/tai-khoan";
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [view, setView] = useState<"login" | "register" | "forgotPassword">(
    "login",
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleLogin = async () => {
    setBusy(true);
    setError(null);
    try {
      await loginWithGoogle();
      navigate(from);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);

    try {
      if (view === "forgotPassword") {
        if (!email) {
          setError("Vui lòng nhập Email.");
          return;
        }
        await resetPassword(email);
        setError("Đã gửi link khôi phục. Vui lòng kiểm tra hộp thư của bạn.");
        setTimeout(() => setView("login"), 3000);
      } else {
        if (!email || !password || (view === "register" && !confirmPassword)) {
          setError("Vui lòng nhập đầy đủ thông tin.");
          return;
        }

        const trimmedPassword = password.trim();

        if (view === "register" && trimmedPassword !== confirmPassword.trim()) {
          setError("Mật khẩu xác nhận không khớp.");
          return;
        }

        if (view === "login") {
          await loginWithEmail(email, trimmedPassword);
        } else {
          await registerWithEmail(email, trimmedPassword);
        }
        navigate(from);
      }
    } catch (err: any) {
      if (err.message === "VERIFY_EMAIL") {
        setError(
          "Đăng ký thành công! Vui lòng kiểm tra hộp thư email của bạn để xác thực tài khoản.",
        );
        setView("login");
      } else if (err.message === "EMAIL_NOT_VERIFIED") {
        setError(
          "Tài khoản chưa được xác thực. Vui lòng kiểm tra email của bạn để kích hoạt.",
        );
      } else if (
        err.code === "auth/invalid-credential" ||
        (err.message && err.message.includes("invalid-credential"))
      ) {
        setError(
          "Email hoặc mật khẩu không đúng. (Lưu ý: Nếu bạn từng Đăng nhập bằng Google, mật khẩu cũ chưa xác thực của bạn có thể đã bị hệ thống xóa để bảo mật. Hãy đăng nhập lại bằng Google hoặc tạo mật khẩu mới bằng Quên mật khẩu).",
        );
      } else if (
        err.code === "auth/too-many-requests" ||
        (err.message && err.message.includes("too-many-requests"))
      ) {
        setError(
          "Bạn đã đăng nhập sai quá nhiều lần. Vui lòng chờ một lát rồi thử lại hoặc sử dụng Quên mật khẩu.",
        );
      } else if (
        err.code === "auth/email-already-in-use" ||
        (err.message && err.message.includes("email-already-in-use"))
      ) {
        setError(
          "Email này đã được đăng ký. Vui lòng quay lại màn hình Đăng nhập hoặc sử dụng email khác.",
        );
      } else if (
        err.code === "auth/invalid-email" ||
        (err.message && err.message.includes("invalid-email"))
      ) {
        setError(
          "Địa chỉ email không hợp lệ. Vui lòng kiểm tra lại định dạng email.",
        );
      } else if (
        err.code === "auth/weak-password" ||
        (err.message && err.message.includes("weak-password"))
      ) {
        setError("Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu an toàn hơn.");
      } else {
        // Firebase throws specific error codes we can catch here or in api.ts
        setError(err.message || "Đã có lỗi xảy ra. Vui lòng thử lại.");
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <section
      className="section section--top"
      style={{
        minHeight: "80vh",
        display: "flex",
        alignItems: "center",
        background:
          "radial-gradient(100% 100% at 50% 0%, var(--sand-100), transparent 70%)",
      }}
    >
      <div
        className="container authwrap"
        style={{ display: "flex", justifyContent: "center" }}
      >
        <motion.div
          className="auth card"
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          style={{
            maxWidth: "440px",
            width: "100%",
            textAlign: "center",
            padding: "3rem 2.5rem",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <span
            className="brand__mark auth__mark"
            aria-hidden="true"
            style={{
              fontSize: "3rem",
              marginBottom: "1rem",
              display: "inline-block",
            }}
          >
            🧺
          </span>
          <h1 style={{ marginBottom: "1rem" }}>
            {view === "forgotPassword"
              ? "Khôi phục mật khẩu"
              : "Đồng hành cùng dự án"}
          </h1>
          <p
            className="muted"
            style={{ marginBottom: "2rem", lineHeight: "1.6" }}
          >
            {view === "forgotPassword"
              ? "Nhập email của bạn để nhận liên kết đặt lại mật khẩu."
              : "Đăng nhập hoặc đăng ký để theo dõi hành trình của bạn — lịch sử đơn hàng, tổng đóng góp và những huy hiệu ấm áp."}
          </p>

          {view !== "forgotPassword" && (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  margin: "0 0 1.5rem",
                }}
              >
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={busy}
                  className="btn interactive"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.8rem",
                    padding: "0.8rem",
                    background: "white",
                    color: "#333",
                    border: "1px solid var(--border)",
                    fontWeight: 500,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.16v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.16C1.43 8.55 1 10.22 1 12s.43 3.45 1.16 4.93l3.68-2.84z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.16 7.07l3.68 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Đăng nhập hoặc đăng ký với Google
                </button>
              </div>

              <div
                className="auth__divider"
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "2rem 0",
                  color: "var(--text-muted)",
                  fontSize: "0.9rem",
                }}
              >
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border)",
                  }}
                />
                <span style={{ padding: "0 1rem" }}>Hoặc</span>
                <div
                  style={{
                    flex: 1,
                    height: "1px",
                    background: "var(--border)",
                  }}
                />
              </div>
            </>
          )}

          <form
            onSubmit={handleEmailAuth}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              textAlign: "left",
            }}
          >
            <div>
              <label
                htmlFor="email"
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 500,
                  fontSize: "0.95rem",
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input"
                placeholder="Ví dụ: name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: "100%", padding: "0.8rem 1rem" }}
              />
            </div>
            {view !== "forgotPassword" && (
              <div>
                <label
                  htmlFor="password"
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                    fontWeight: 500,
                    fontSize: "0.95rem",
                  }}
                >
                  <span>Mật khẩu</span>
                  {view === "login" && (
                    <button
                      type="button"
                      className="interactive"
                      style={{
                        background: "none",
                        border: "none",
                        color: "var(--green-700)",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                        padding: 0,
                      }}
                      onClick={() => {
                        setView("forgotPassword");
                        setError(null);
                      }}
                    >
                      Quên mật khẩu?
                    </button>
                  )}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className="input"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.8rem 2.5rem 0.8rem 1rem",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "var(--text-muted)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            <AnimatePresence>
              {view === "register" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label
                    htmlFor="confirmPassword"
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                    }}
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      id="confirmPassword"
                      type={showPassword ? "text" : "password"}
                      className="input"
                      placeholder="Nhập lại mật khẩu"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.8rem 2.5rem 0.8rem 1rem",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "var(--text-muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={busy}
              className="btn btn--accent interactive"
              style={{
                width: "100%",
                padding: "0.8rem",
                marginTop: "0.5rem",
                justifyContent: "center",
              }}
            >
              {view === "forgotPassword"
                ? "Gửi link khôi phục"
                : view === "register"
                  ? "Tạo tài khoản"
                  : "Đăng nhập"}
            </button>
          </form>

          <div style={{ marginTop: "1.5rem", fontSize: "0.95rem" }}>
            {view === "forgotPassword" ? (
              <button
                type="button"
                onClick={() => {
                  setView("login");
                  setError(null);
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--green-700)",
                  fontWeight: 600,
                  cursor: "pointer",
                  padding: 0,
                }}
                className="interactive"
              >
                Quay lại đăng nhập
              </button>
            ) : (
              <>
                <span className="muted">
                  {view === "register"
                    ? "Đã có tài khoản? "
                    : "Chưa có tài khoản? "}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setView(view === "login" ? "register" : "login");
                    setError(null);
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--green-700)",
                    fontWeight: 600,
                    cursor: "pointer",
                    padding: 0,
                  }}
                  className="interactive"
                >
                  {view === "register" ? "Đăng nhập" : "Đăng ký ngay"}
                </button>
              </>
            )}
          </div>

          {busy && (
            <p className="muted" style={{ marginTop: "1rem" }}>
              Đang xử lý…
            </p>
          )}
          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="auth__error"
                style={{
                  color: "#c0392b",
                  marginTop: "1rem",
                  padding: "1rem",
                  background: "#fdf3f2",
                  borderRadius: "var(--radius-sm)",
                }}
                role="alert"
              >
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
