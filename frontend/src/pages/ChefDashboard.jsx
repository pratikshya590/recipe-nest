import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { RECIPES, CATEGORIES } from "../services/mockData";

const EMPTY = { title: "", category: "Desserts", time: "", description: "", ingredients: "", instructions: "" };

export default function ChefDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("recipes");
  const [recipes, setRecipes] = useState(RECIPES);
  const [form, setForm] = useState(EMPTY);
  const [toast, setToast] = useState(null);

  const avgRating = recipes.length
    ? (recipes.reduce((a, r) => a + (r.rating || 4.5), 0) / recipes.length).toFixed(1) : 0;
  const totalFavs = recipes.reduce((a, r) => a + (r.id % 3 === 0 ? 300 : r.id % 2 === 0 ? 200 : 100), 0);

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.title) { setToast({ msg: "Please enter a title", type: "error" }); return; }
    // TODO: POST /api/recipes
    setRecipes([...recipes, {
      id: Date.now(), ...form, chef: user.name, rating: 0,
      ingredients: form.ingredients.split("\n").filter(Boolean),
      instructions: form.instructions.split("\n").filter(Boolean),
    }]);
    setForm(EMPTY); setView("recipes");
    setToast({ msg: "Recipe published! 🎉", type: "success" });
  };

  const handleDelete = (id) => {
    // TODO: DELETE /api/recipes/:id
    setRecipes(recipes.filter((r) => r.id !== id));
    setToast({ msg: "Recipe deleted", type: "success" });
  };

  return (
    <div className="page">
      <div className="dash-layout">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sb-logo">🍳 Chef Portal</div>
          <div className="sb-sec">Menu</div>
          <button className={`sb-item ${view === "recipes" ? "on" : ""}`} onClick={() => setView("recipes")}>📋 My Recipes</button>
          <button className={`sb-item ${view === "add"     ? "on" : ""}`} onClick={() => setView("add")}>➕ Add Recipe</button>
          <button className={`sb-item ${view === "profile" ? "on" : ""}`} onClick={() => setView("profile")}>👤 Profile</button>
          <button className="sb-item sb-logout" onClick={() => { logout(); navigate("/"); }}>⏻ Logout</button>
        </aside>

        {/* ── Main ── */}
        <main className="dash-main">

          {/* My Recipes view */}
          {view === "recipes" && <>
            <div className="dash-header">
              <h1 className="dash-title">My Recipes</h1>
              <button className="btn btn-primary" onClick={() => setView("add")}>➕ Create New Recipe</button>
            </div>
            <div className="stats-row">
              <div className="stat-card">
                <div className="stat-icon">📋</div>
                <div className="stat-val">{recipes.length}</div>
                <div className="stat-lbl">Total Recipes</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">⭐</div>
                <div className="stat-val">{avgRating}</div>
                <div className="stat-lbl">Avg. Rating</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">❤️</div>
                <div className="stat-val">{totalFavs}</div>
                <div className="stat-lbl">Total Favourites</div>
              </div>
            </div>
            <div className="tbl-card">
              <div className="tbl-head">All Recipes</div>
              <div className="tbl-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Recipe</th><th>Category</th><th>Rating</th>
                      <th>Favourites</th><th>Status</th><th>Action</th>
                    </tr>
                  </thead>
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
                        <td>{r.category}</td>
                        <td><span className="rating-badge">⭐ {r.rating || "—"}</span></td>
                        <td>🤍 {r.id % 3 === 0 ? 300 : r.id % 2 === 0 ? 200 : 100}</td>
                        <td>
                          <span className={`badge ${r.rating && r.rating < 4 ? "badge-orange" : "badge-green"}`}>
                            {r.rating && r.rating < 4 ? "Reported" : "Published"}
                          </span>
                        </td>
                        <td>
                          <div className="action-cell">
                            <button className="icon-btn" title="Edit">✏️</button>
                            <button className="icon-btn del" onClick={() => handleDelete(r.id)} title="Delete">🗑</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>}

          {/* Add Recipe view */}
          {view === "add" && <>
            <div className="dash-header">
              <h1 className="dash-title">Add New Recipe</h1>
              <button className="btn btn-ghost btn-sm" onClick={() => setView("recipes")}>← Back</button>
            </div>
            <div className="form-card">
              <form onSubmit={handleAdd}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Recipe Title</label>
                    <input className="form-input" placeholder="e.g. Chocolate Lava Cake" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.filter((c) => c !== "All").map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preparation Time</label>
                    <input className="form-input" placeholder="e.g. 45 mins" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipe Image</label>
                    <input className="form-input" type="file" accept="image/*" />
                  </div>
                  <div className="form-group span-2">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" placeholder="Brief description of the recipe…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Ingredients (one per line)</label>
                    <textarea className="form-input" style={{ minHeight: 120 }} placeholder={"2 cups flour\n1 egg\n½ cup sugar"} value={form.ingredients} onChange={(e) => setForm({ ...form, ingredients: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instructions (one step per line)</label>
                    <textarea className="form-input" style={{ minHeight: 120 }} placeholder={"Preheat oven to 180°C\nMix dry ingredients\nBake for 30 mins"} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap" }}>
                  <button type="submit" className="btn btn-primary">Publish Recipe</button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setForm(EMPTY); setView("recipes"); }}>Cancel</button>
                </div>
              </form>
            </div>
          </>}

          {/* Profile view */}
          {view === "profile" && <>
            <div className="dash-header"><h1 className="dash-title">My Profile</h1></div>
            <div className="profile-hero" style={{ borderRadius: 14, marginBottom: "1.5rem" }}>
              <div className="profile-av">👨‍🍳</div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-badge">Chef</div>
            </div>
            <div className="form-card">
              <div className="form-card-title">Edit Profile</div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input className="form-input" defaultValue={user?.name} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-input" defaultValue={user?.email} />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Bio</label>
                  <textarea className="form-input" placeholder="Tell people about yourself…" />
                </div>
              </div>
              <button className="btn btn-primary" onClick={() => setToast({ msg: "Profile updated! ✓", type: "success" })}>Save Changes</button>
            </div>
          </>}

        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
