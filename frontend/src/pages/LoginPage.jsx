import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { loginUser } from "../services/api";

export default function LoginPage() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const redirectFor = (role) =>
    role === "chef" ? "/chef" : role === "admin" ? "/admin" : "/home";

  const handle = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setToast({ msg: "Please fill all fields", type: "error" }); return;
    }

    setLoading(true);
    try {
      const result = await loginUser(form.email, form.password);

      if (result.success) {
        login(result.data.user, result.data.token);
        setToast({ msg: "Login successful!", type: "success" });
        setTimeout(() => navigate(redirectFor(result.data.user.role)), 1000);
      } else {
        setToast({ msg: result.message || "Login failed", type: "error" });
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
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              placeholder="Your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ padding: "0.5rem 2rem", width: "50%" }}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </div>
        </form>

        <p className="auth-foot" style={{ marginTop: "1.1rem" }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}