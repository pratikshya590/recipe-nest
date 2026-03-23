import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

const FOODLOVER_NAV = [
  { to: "/home",        icon: "🏠", label: "Home"      },
  { to: "/chefs",       icon: "👨‍🍳", label: "Chefs"     },
  { to: "/favourites",  icon: "❤️",  label: "Saved"     },
  { to: "/profile",     icon: "👤", label: "Profile"   },
];
const CHEF_NAV = [
  { to: "/chef",    icon: "📋", label: "Dashboard" },
  { to: "/profile", icon: "👤", label: "Profile"   },
];
const ADMIN_NAV = [
  { to: "/admin",   icon: "📊", label: "Overview"  },
  { to: "/profile", icon: "👤", label: "Profile"   },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = () => { logout(); navigate("/"); };

  const dashHome =
    !user           ? "/" :
    user.role === "chef"  ? "/chef"  :
    user.role === "admin" ? "/admin" : "/home";

  const mobileItems =
    user?.role === "foodlover" ? FOODLOVER_NAV :
    user?.role === "chef"      ? CHEF_NAV      :
    user?.role === "admin"     ? ADMIN_NAV     : [];

  return (
    <>
      {/* ── Top Navbar ── */}
      <nav className="navbar">
        <Link to={dashHome} className="nav-logo">
          🍳 Recipe<span>Nest</span>
        </Link>

        {/* Desktop links */}
        {user?.role === "foodlover" && (
          <>
            <Link to="/home"       className={`nav-link ${pathname === "/home"       ? "active" : ""}`}>Home</Link>
            <Link to="/chefs"      className={`nav-link ${pathname === "/chefs"      ? "active" : ""}`}>Browse Chefs</Link>
            <Link to="/favourites" className={`nav-link ${pathname === "/favourites" ? "active" : ""}`}>Favourites</Link>
          </>
        )}
        {user?.role === "chef" && (
          <Link to="/chef" className={`nav-link ${pathname === "/chef" ? "active" : ""}`}>Dashboard</Link>
        )}
        {user?.role === "admin" && (
          <Link to="/admin" className={`nav-link ${pathname === "/admin" ? "active" : ""}`}>Admin Panel</Link>
        )}

        {user ? (
          <>
            <button className="nav-icon-btn" onClick={() => navigate("/profile")} title="Profile">👤</button>
            <button className="nav-icon-btn" onClick={handleLogout} title="Logout" style={{ color: "var(--danger)" }}>⏻</button>
          </>
        ) : (
          <>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            <Link to="/login"    className="btn btn-ghost  btn-sm">Login</Link>
          </>
        )}
      </nav>

      {/* ── Bottom Nav (mobile only) ── */}
      {user && (
        <nav className="bottom-nav">
          {mobileItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`bn-item ${pathname === item.to ? "active" : ""}`}
            >
              <span className="bn-icon">{item.icon}</span>
              {item.label}
            </Link>
          ))}
          <button className="bn-item" onClick={handleLogout} style={{ color: "var(--danger)" }}>
            <span className="bn-icon">⏻</span>Logout
          </button>
        </nav>
      )}
    </>
  );
}
