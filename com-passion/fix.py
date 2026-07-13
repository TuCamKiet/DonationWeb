import re

with open('src/pages/Account.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Imports
content = content.replace(
    'import { Loading } from "../components/Status";',
    'import { Loading } from "../components/Status";\nimport AvatarUploader from "../components/AvatarUploader";\nimport { api } from "../lib/api";'
)
content = content.replace('  Edit2,\n  X,\n} from "lucide-react";', '  Edit2,\n  CheckCircle,\n} from "lucide-react";')

# State
content = content.replace(
    'const [editAvatar, setEditAvatar] = useState("");',
    'const [editAvatar, setEditAvatar] = useState<string | File>("");'
)

# Remove handleSaveProfile
content = re.sub(r'  const handleSaveProfile = async \(e: React\.FormEvent\) => \{.*?\n  \};\n', '', content, flags=re.DOTALL)

# Modal start
modal_start = content.find('{isEditModalOpen &&')
modal_end = content.find('    </section>', modal_start)

new_modal = """{isEditModalOpen &&
        createPortal(
          <div
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
                    color: "#b91c1c",
                    borderRadius: "8px",
                  }}
                >
                  {editError}
                </div>
              )}

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!user) return;
                  setIsSaving(true);
                  setEditError("");

                  let finalAvatarUrl = user.avatar || "";
                  
                  if (editAvatar && editAvatar !== user.avatar && typeof editAvatar !== "string") {
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

                  try {
                    await updateUserProfile(editName, finalAvatarUrl);
                    setIsEditModalOpen(false);
                  } catch (err: any) {
                    setEditError("Lỗi khi lưu: " + (err.message || String(err)));
                  } finally {
                    setIsSaving(false);
                  }
                }}
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
                    <AvatarUploader value={editAvatar} onChange={setEditAvatar} />
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
                    {isSaving ? <Loading size={20} color="#fff" /> : "Lưu thay đổi"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>,
          document.body,
        )}
"""

content = content[:modal_start] + new_modal + "\n" + content[modal_end:]

with open('src/pages/Account.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
