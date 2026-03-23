import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../components/Shared";
import { registerUser } from "../services/api";

export default function RegisterPage() {
  const [role, setRole] = useState("foodlover");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [avatar, setAvatar] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setToast({ msg: "Please fill all fields", type: "error" }); return;
    }

    setLoading(true);
    try {
      // Use FormData for file upload
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", role);
      if (avatar) formData.append("avatar", avatar);

      const result = await registerUser(formData);

      if (result.success) {
        setToast({ msg: "Registered successfully! Please login.", type: "success" });
        setTimeout(() => navigate("/login"), 1500);
      } else {
        setToast({ msg: result.message || "Registration failed", type: "error" });
      }
    } catch (error) {
      setToast({ msg: "Something went wrong!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Create an Account</h2>
        <p className="auth-sub login-sub">Join our community to discover and share recipes</p>

        <div className="role-tabs">
          <div className={`role-tab ${role === "foodlover" ? "on" : ""}`} onClick={() => setRole("foodlover")}>
            <span className="ri">👤</span>Food Lover
          </div>
          <div className={`role-tab ${role === "chef" ? "on" : ""}`} onClick={() => setRole("chef")}>
            <span className="ri">👨‍🍳</span>Chef
          </div>
        </div>

        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" placeholder="Your full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Create a password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Profile Photo</label>
            <input className="form-input" type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files[0])} />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
            <button type="submit" className="btn btn-primary" style={{ padding: "0.5rem 2rem", width: "60%" }} disabled={loading}>
              {loading ? "Registering..." : "Register Account"}
            </button>
          </div>
        </form>

        <p className="auth-foot">Already have an account? <Link to="/login">Login here</Link></p>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}