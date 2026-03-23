import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { RECIPES, ADMIN_USERS } from "../services/mockData";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("overview");
  const [users, setUsers] = useState(ADMIN_USERS);
  const [recipes, setRecipes] = useState(RECIPES);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);

  const deleteUser = (id) => {
    // TODO: DELETE /api/admin/users/:id
    setUsers(users.filter((u) => u.id !== id));
    setToast({ msg: "User deleted", type: "success" });
  };
  const deleteRecipe = (id) => {
    // TODO: DELETE /api/admin/recipes/:id
    setRecipes(recipes.filter((r) => r.id !== id));
    setToast({ msg: "Recipe removed", type: "success" });
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page">
      <div className="dash-layout">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sb-logo">🛡 Admin Portal</div>
          <div className="sb-sec">Management</div>
          <button className={`sb-item ${view === "overview" ? "on" : ""}`} onClick={() => setView("overview")}>📊 System Overview</button>
          <button className={`sb-item ${view === "users"    ? "on" : ""}`} onClick={() => setView("users")}>👥 Users and Chefs</button>
          <button className={`sb-item ${view === "recipes"  ? "on" : ""}`} onClick={() => setView("recipes")}>📋 All Recipes</button>
          <button className="sb-item sb-logout" onClick={() => { logout(); navigate("/"); }}>⏻ Logout</button>
        </aside>

        {/* ── Main ── */}
        <main className="dash-main">

          {/* Overview */}
          {view === "overview" && <>
            <div className="dash-header"><h1 className="dash-title">System Overview</h1></div>
            <div className="admin-stats">
              <div className="admin-stat">
                <div className="admin-stat-icon">👥</div>
                <div>
                  <div className="admin-stat-val">500</div>
                  <div className="admin-stat-lbl">Total Users</div>
                </div>
              </div>
              <div className="admin-stat">
                <div className="admin-stat-icon">📋</div>
                <div>
                  <div className="admin-stat-val">1,000</div>
                  <div className="admin-stat-lbl">Total Recipes</div>
                </div>
              </div>
            </div>
            <div className="tbl-card">
              <div className="tbl-head">
                <span>Manage Users and Chefs</span>
                <div className="search-box" style={{ minWidth: 180, padding: "0.38rem 0.9rem" }}>
                  <span className="search-icon">🔍</span>
                  <input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Role</th><th>Recipes</th><th>Action</th></tr></thead>
                  <tbody>
                    {filteredUsers.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td><span className={`badge ${u.role === "Chef" ? "badge-green" : "badge-orange"}`}>{u.role}</span></td>
                        <td>{u.recipes}</td>
                        <td><button className="icon-btn del" onClick={() => deleteUser(u.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

          {/* Users */}
          {view === "users" && <>
            <div className="dash-header"><h1 className="dash-title">Users and Chefs</h1></div>
            <div className="tbl-card">
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Name</th><th>Role</th><th>Recipes</th><th>Action</th></tr></thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td><span className={`badge ${u.role === "Chef" ? "badge-green" : "badge-orange"}`}>{u.role}</span></td>
                        <td>{u.recipes}</td>
                        <td><button className="icon-btn del" onClick={() => deleteUser(u.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

          {/* Recipes */}
          {view === "recipes" && <>
            <div className="dash-header"><h1 className="dash-title">All Recipes</h1></div>
            <div className="tbl-card">
              <div className="tbl-wrap">
                <table>
                  <thead><tr><th>Recipe</th><th>Chef</th><th>Category</th><th>Rating</th><th>Action</th></tr></thead>
                  <tbody>
                    {recipes.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <div className="tbl-name-cell">
                            {r.image
                              ? <img src={r.image} className="tbl-img" alt="" />
                              : <div className="tbl-img-ph">🍽</div>}
                            <span style={{ fontWeight: 500 }}>{r.title}</span>
                          </div>
                        </td>
                        <td>{r.chef}</td>
                        <td>{r.category}</td>
                        <td><span className="rating-badge">⭐ {r.rating}</span></td>
                        <td><button className="icon-btn del" onClick={() => deleteRecipe(r.id)}>🗑</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
