import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Toast } from "../components/Shared";
import { EyeOpenIcon, EyeClosedIcon } from "../components/Icons";
import { registerUser } from "../services/api";

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

export default function RegisterPage() {
  const [role, setRole] = useState("foodlover");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { checks, strength, passed } = checkPasswordStrength(form.password);
  const isPasswordValid = passed === 4;

  const handle = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      setToast({ msg: "Please fill all fields", type: "error" }); return;
    }
    if (!isPasswordValid) {
      setToast({ msg: "Please meet all password requirements", type: "error" }); return;
    }
    setLoading(true);
    try {
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
    } catch {
      setToast({ msg: "Something went wrong!", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <button onClick={() => navigate("/")} className="auth-back-floating">←</button>

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
            <input className="form-input" placeholder="Your full name" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="your@email.com" value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={showPassword ? "text" : "password"}
                placeholder="Create a password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                style={{ paddingRight: "2.6rem" }}
              />
              <button type="button" onClick={() => setShowPassword((v) => !v)}
                style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 0, display: "flex", alignItems: "center" }}>
                {showPassword ? <EyeOpenIcon size={18} /> : <EyeClosedIcon size={18} />}
              </button>
            </div>

            {/* Strength indicator */}
            {form.password.length > 0 && (
              <div style={{ marginTop: "0.5rem" }}>
                <div style={{ display: "flex", gap: 4, marginBottom: "0.3rem" }}>
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} style={{ flex: 1, height: 4, borderRadius: 4, background: i <= passed ? strengthColor[strength] : "#e5ddd0", transition: "background 0.2s" }} />
                  ))}
                </div>
                <div style={{ fontSize: 12, color: strengthColor[strength], fontWeight: 600, marginBottom: "0.35rem" }}>
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
            <label className="form-label">Profile Photo</label>
            <input className="form-input" type="file" accept="image/*"
              onChange={(e) => setAvatar(e.target.files[0])} />
          </div>

          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.4rem" }}>
            <button type="submit" className="btn btn-primary"
              style={{ padding: "0.5rem 2rem", width: "60%" }} disabled={loading}>
              {loading ? "Registering..." : "Register Account"}
            </button>
          </div>
        </form>

        <p className="auth-foot">
          Already have an account?{" "}
          <Link to="/login" className="login-link">Login here</Link>
        </p>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}