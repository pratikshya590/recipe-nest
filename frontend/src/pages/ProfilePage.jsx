import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { updateProfile, uploadAvatar, changePassword } from "../services/api";

const ROLE_LABEL = { foodlover: "Food Lover", chef: "Chef", admin: "Admin" };

const checkPasswordStrength = (pwd) => {
  const checks = {
    length:    pwd.length >= 8,
    uppercase: /[A-Z]/.test(pwd),
    number:    /[0-9]/.test(pwd),
    special:   /[!@#$%^&*]/.test(pwd),
  };
  const passed = Object.values(checks).filter(Boolean).length;
  const strength = passed <= 1 ? "weak" : passed <= 2 ? "fair" : passed === 3 ? "good" : "strong";
  return { checks, strength, passed };
};

const strengthColor = { weak: "#e74c3c", fair: "#e67e22", good: "#f1c40f", strong: "#27ae60" };
const strengthLabel = { weak: "Weak", fair: "Fair", good: "Good", strong: "Strong ✓" };

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passLoading, setPassLoading] = useState(false);

  const { checks, strength, passed } = checkPasswordStrength(passForm.newPassword);
  const isPasswordValid = passed === 4;

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) { setAvatarFile(file); setAvatarPreview(URL.createObjectURL(file)); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await updateProfile(form);
      if (result.success) {
        login(result.data.user, localStorage.getItem("token"));
        setToast({ msg: "Profile updated! ✓", type: "success" });
      } else {
        setToast({ msg: result.message || "Update failed", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setLoading(false); }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) { setToast({ msg: "Please select an image first", type: "error" }); return; }
    setUploadLoading(true);
    try {
      const formData = new FormData();
      formData.append("avatar", avatarFile);
      const result = await uploadAvatar(formData);
      if (result.success) {
        login(result.data.user, localStorage.getItem("token"));
        setAvatarPreview(null); setAvatarFile(null);
        setToast({ msg: "Profile photo updated! ✓", type: "success" });
      } else {
        setToast({ msg: result.message || "Upload failed", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setUploadLoading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) {
      setToast({ msg: "New passwords do not match!", type: "error" }); return;
    }
    if (!isPasswordValid) {
      setToast({ msg: "Please meet all password requirements", type: "error" }); return;
    }
    setPassLoading(true);
    try {
      const result = await changePassword(passForm.currentPassword, passForm.newPassword);
      if (result.success) {
        setToast({ msg: "Password changed successfully! ✓", type: "success" });
        setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        setToast({ msg: result.message || "Failed to change password", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setPassLoading(false); }
  };

  const avatarSrc = avatarPreview ||
    (user?.avatar ? `http://localhost:5000${user.avatar}` : null);

  return (
    <div className="page">
      <div className="page-wrap" style={{ maxWidth: 680 }}>

        {/* Profile Hero */}
        <div className="profile-hero">
          <div className="profile-av">
            {avatarSrc
              ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
              : "👤"}
          </div>
          <div className="profile-name">{user?.name}</div>
          <div className="profile-badge">{ROLE_LABEL[user?.role] || user?.role}</div>
        </div>

        {/* Avatar Upload */}
        <div className="form-card" style={{ marginBottom: "1rem" }}>
          <div className="form-card-title">Update Profile Photo</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <input className="form-input" type="file" accept="image/*" onChange={handleAvatarChange} style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={handleAvatarUpload} disabled={uploadLoading || !avatarFile}>
              {uploadLoading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
          {avatarPreview && (
            <img src={avatarPreview} alt="preview"
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginTop: "0.8rem" }} />
          )}
        </div>

        {/* Edit Profile */}
        <div className="form-card" style={{ marginBottom: "1rem" }}>
          <div className="form-card-title">Edit Profile</div>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
              </div>
              {(user?.role === "chef" || user?.role === "foodlover") && (
                <div className="form-group span-2">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" placeholder="Tell people about yourself…"
                    value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div className="form-card" style={{ marginBottom: "1rem" }}>
          <div className="form-card-title">Change Password</div>
          <form onSubmit={handleChangePassword}>
            <div className="form-group">
              <label className="form-label">Current Password</label>
              <input className="form-input" type="password" placeholder="Enter current password"
                value={passForm.currentPassword}
                onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} />
            </div>
            <div className="form-group">
              <label className="form-label">New Password</label>
              <input className="form-input" type="password" placeholder="Enter new password"
                value={passForm.newPassword}
                onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} />

              {/* Strength indicator */}
              {passForm.newPassword.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <div style={{ display: "flex", gap: 4, marginBottom: "0.3rem" }}>
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= passed ? strengthColor[strength] : "#e5ddd0", transition: "background 0.2s" }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 12, color: strengthColor[strength], fontWeight: 600, marginBottom: "0.3rem" }}>
                    {strengthLabel[strength]}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.15rem" }}>
                    {[
                      { key: "length",    label: "8+ characters" },
                      { key: "uppercase", label: "Uppercase letter" },
                      { key: "number",    label: "Number (0-9)" },
                      { key: "special",   label: "Special (!@#$%^&*)" },
                    ].map(({ key, label }) => (
                      <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: 12 }}>
                        <span style={{ color: checks[key] ? "#27ae60" : "#ccc", fontSize: 13, fontWeight: 700 }}>
                          {checks[key] ? "✓" : "○"}
                        </span>
                        <span style={{ color: checks[key] ? "#27ae60" : "#b5ab9f" }}>{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Confirm New Password</label>
              <input className="form-input" type="password" placeholder="Confirm new password"
                value={passForm.confirmPassword}
                onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} />
              {/* Match indicator */}
              {passForm.confirmPassword.length > 0 && (
                <div style={{ fontSize: 12, marginTop: "0.3rem", color: passForm.newPassword === passForm.confirmPassword ? "#27ae60" : "#e74c3c" }}>
                  {passForm.newPassword === passForm.confirmPassword ? "✓ Passwords match" : "✗ Passwords do not match"}
                </div>
              )}
            </div>
            <button type="submit" className="btn btn-primary" disabled={passLoading}>
              {passLoading ? "Changing..." : "Change Password"}
            </button>
          </form>
        </div>

      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}