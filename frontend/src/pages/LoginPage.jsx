import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { EyeOpenIcon, EyeClosedIcon } from "../components/Icons";
import { loginUser } from "../services/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "", role: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectFor = (role) =>
    role === "chef" ? "/chef" : role === "admin" ? "/admin" : "/home";

  const handle = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password || !form.role) {
      setToast({ msg: "Please fill all fields", type: "error" }); return;
    }
    setLoading(true);
    try {
      const result = await loginUser(form.email, form.password);
      if (result.success) {
        if (result.data.user.role !== form.role) {
          setToast({ msg: "Selected role does not match your account!", type: "error" });
          setLoading(false); return;
        }
        login(result.data.user, result.data.token);
        setToast({ msg: "Login successful!", type: "success" });
        setTimeout(() => navigate(redirectFor(result.data.user.role)), 1000);
      } else {
        setToast({ msg: result.message || "Login failed", type: "error" });
      }
    } catch {
      setToast({ msg: "Something went wrong!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title login-title">Welcome back</h2>
        <p className="auth-sub login-sub">Enter your credentials to access your account</p>

        <form onSubmit={handle}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[
                { value: "foodlover", label: "🧑 Food Lover" },
                { value: "chef",      label: "👨‍🍳 Chef" },
                { value: "admin",     label: "👤⚙️ Admin" },
              ].map((r) => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    flex: 1, padding: "0.6rem 0.3rem", borderRadius: "8px",
                    border: `2px solid ${form.role === r.value ? "#679436" : "#e5ddd0"}`,
                    background: form.role === r.value ? "#f0f7e6" : "#fff",
                    color: form.role === r.value ? "#679436" : "#7a6e60",
                    fontWeight: 600, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => { if (form.role !== r.value) { e.target.style.background = "#f0f7e6"; e.target.style.borderColor = "#679436"; e.target.style.color = "#679436"; }}}
                  onMouseLeave={(e) => { if (form.role !== r.value) { e.target.style.background = "#fff"; e.target.style.borderColor = "#e5ddd0"; e.target.style.color = "#7a6e60"; }}}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Your password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: "2.6rem" }}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                style={{
                  position: "absolute", right: "0.75rem", top: "50%",
                  transform: "translateY(-50%)", background: "none",
                  border: "none", cursor: "pointer", padding: 0,
                  display: "flex", alignItems: "center",
                }}
              >
                {/* showPassword=true → password visible → show EyeOpenIcon
                    showPassword=false → password hidden → show EyeClosedIcon */}
                {showPassword ? <EyeOpenIcon size={18} /> : <EyeClosedIcon size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "0.5rem 2rem", width: "60%", background: "#679436" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p className="auth-foot" style={{ marginTop: "1.1rem" }}>
          Don't have an account?{" "}
          <Link to="/register" className="register-link">Register here</Link>
        </p>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}