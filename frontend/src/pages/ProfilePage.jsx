import { useState } from "react";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { updateProfile, uploadAvatar } from "../services/api";

const ROLE_LABEL = { foodlover: "Food Lover", chef: "Chef", admin: "Admin" };

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [form, setForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  // Handle avatar file selection — show preview
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // Update profile text fields
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
    } catch (error) {
      setToast({ msg: "Something went wrong!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async () => {
  if (!avatarFile) {
    setToast({ msg: "Please select an image first", type: "error" }); return;
  }
  setUploadLoading(true);
  try {
    const formData = new FormData();
    formData.append("avatar", avatarFile);
    const result = await uploadAvatar(formData);
    console.log("Upload result:", result); // debug
    if (result.success) {
      // Update user in localStorage with new avatar
      const updatedUser = result.data.user;
      login(updatedUser, localStorage.getItem("token"));
      setAvatarPreview(null);
      setAvatarFile(null);
      setToast({ msg: "Profile photo updated! ✓", type: "success" });
    } else {
      setToast({ msg: result.message || "Upload failed", type: "error" });
    }
  } catch (error) {
    console.error("Upload error:", error);
    setToast({ msg: "Something went wrong!", type: "error" });
  } finally {
    setUploadLoading(false);
  }
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
            <input
              className="form-input"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={handleAvatarUpload}
              disabled={uploadLoading || !avatarFile}
            >
              {uploadLoading ? "Uploading..." : "Upload Photo"}
            </button>
          </div>
          {avatarPreview && (
            <img
              src={avatarPreview}
              alt="preview"
              style={{ width: 80, height: 80, borderRadius: "50%", objectFit: "cover", marginTop: "0.8rem" }}
            />
          )}
        </div>

        {/* Profile Form */}
        <div className="form-card">
          <div className="form-card-title">Edit Profile</div>
          <form onSubmit={handleProfileUpdate}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  className="form-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  className="form-input"
                  value={user?.email}
                  disabled
                  style={{ opacity: 0.6 }}
                />
              </div>
              {(user?.role === "chef" || user?.role === "foodlover") && (
                <div className="form-group span-2">
                  <label className="form-label">Bio</label>
                  <textarea
                    className="form-input"
                    placeholder="Tell people about yourself…"
                    value={form.bio}
                    onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  />
                </div>
              )}
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </form>
        </div>

      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}