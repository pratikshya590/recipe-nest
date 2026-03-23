import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "./components/AuthContext";
import Navbar           from "./components/Navbar";
import LandingPage      from "./pages/LandingPage";
import RegisterPage     from "./pages/RegisterPage";
import LoginPage        from "./pages/LoginPage";
import HomePage         from "./pages/HomePage";
import RecipeDetailPage from "./pages/RecipeDetailPage";
import FavouritesPage   from "./pages/FavouritesPage";
import ChefsPage        from "./pages/ChefsPage";
import ProfilePage      from "./pages/ProfilePage";
import ChefDashboard    from "./pages/ChefDashboard";
import AdminDashboard   from "./pages/AdminDashboard";
import "./App.css";

// Protect routes — redirect if not logged in or wrong role
function Guard({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={
      user.role === "chef"  ? "/chef"  :
      user.role === "admin" ? "/admin" : "/home"
    } replace />;
  }
  return children;
}

// Pages where we hide the Navbar
const PUBLIC_ROUTES = ["/", "/login", "/register"];

function Layout() {
  const { pathname } = useLocation();
  const isPublic = PUBLIC_ROUTES.includes(pathname);

  return (
    <>
      {!isPublic && <Navbar />}
      <Routes>
        {/* ── Public ── */}
        <Route path="/"         element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login"    element={<LoginPage />} />

        {/* ── Food Lover ── */}
        <Route path="/home"       element={<Guard roles={["foodlover"]}><HomePage /></Guard>} />
        <Route path="/recipe/:id" element={<Guard roles={["foodlover"]}><RecipeDetailPage /></Guard>} />
        <Route path="/favourites" element={<Guard roles={["foodlover"]}><FavouritesPage /></Guard>} />
        <Route path="/chefs"      element={<Guard roles={["foodlover"]}><ChefsPage /></Guard>} />

        {/* ── Shared ── */}
        <Route path="/profile" element={<Guard><ProfilePage /></Guard>} />

        {/* ── Chef ── */}
        <Route path="/chef" element={<Guard roles={["chef"]}><ChefDashboard /></Guard>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<Guard roles={["admin"]}><AdminDashboard /></Guard>} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Layout />
      </AuthProvider>
    </BrowserRouter>
  );
}
