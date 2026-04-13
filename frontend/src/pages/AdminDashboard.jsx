import { useState, useEffect } from "react";
import { DeleteIcon, ViewIcon } from "../components/Icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { getAllUsers, deleteUser, getRecipes, deleteRecipe, getAllReports, updateReportStatus } from "../services/api";

const IMAGE_BASE = "http://localhost:5000";

export default function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("overview");
  const [users, setUsers] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [reports, setReports] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [reportFilter, setReportFilter] = useState("pending");

  useEffect(() => { fetchUsers(); fetchRecipes(); fetchReports(); }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const res = await getAllUsers();
      if (res.success) {
        const list = res.data?.users ?? res.data;
        setUsers(Array.isArray(list) ? list.filter((u) => u.role !== "admin") : []);
      }
    } catch { setToast({ msg: "Failed to load users", type: "error" }); }
    finally { setLoadingUsers(false); }
  };

  const fetchRecipes = async () => {
    setLoadingRecipes(true);
    try {
      const res = await getRecipes();
      if (res.success) {
        const list = res.data?.recipes ?? res.data;
        setRecipes(Array.isArray(list) ? list : []);
      }
    } catch { setToast({ msg: "Failed to load recipes", type: "error" }); }
    finally { setLoadingRecipes(false); }
  };

  const fetchReports = async () => {
    setLoadingReports(true);
    try {
      const res = await getAllReports();
      if (res.success) {
        const list = res.data?.reports ?? res.data;
        setReports(Array.isArray(list) ? list : []);
      }
    } catch { setToast({ msg: "Failed to load reports", type: "error" }); }
    finally { setLoadingReports(false); }
  };

  const handleDeleteUser = async (id) => {
    try {
      const res = await deleteUser(id);
      if (res.success) {
        setUsers(users.filter((u) => u._id !== id));
        if (selectedUser?._id === id) setSelectedUser(null);
        setToast({ msg: "User removed", type: "success" });
      } else setToast({ msg: res.message || "Delete failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleDeleteRecipe = async (id) => {
    try {
      const res = await deleteRecipe(id);
      if (res.success) {
        setRecipes(recipes.filter((r) => r._id !== id));
        if (selectedRecipe?._id === id) setSelectedRecipe(null);
        setToast({ msg: "Recipe removed", type: "success" });
      } else setToast({ msg: res.message || "Delete failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleUpdateReport = async (reportId, status) => {
    try {
      const res = await updateReportStatus(reportId, status);
      if (res.success) {
        setReports(reports.map((r) => r._id === reportId ? { ...r, status } : r));
        setToast({ msg: `Report marked as ${status}`, type: "success" });
      } else setToast({ msg: res.message || "Failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const filteredUsers = users.filter((u) => u.name?.toLowerCase().includes(search.toLowerCase()));
  const chefCount = users.filter((u) => u.role === "chef").length;
  const pendingReports = reports.filter((r) => r.status === "pending").length;
  const filteredReports = reportFilter === "all" ? reports : reports.filter((r) => r.status === reportFilter);
  const getImageSrc = (img) => img ? (img.startsWith("http") ? img : `${IMAGE_BASE}${img}`) : null;

  const Sidebar = () => (
    <aside className="sidebar">
      <div className="sb-logo"><span style={{ fontSize: 20 }}>⚙️</span> Admin Portal</div>
      <div className="sb-sec">Management</div>
      <button className={`sb-item ${view === "overview" && !selectedRecipe && !selectedUser ? "on" : ""}`}
        onClick={() => { setSelectedRecipe(null); setSelectedUser(null); setView("overview"); }}>
        👤 System Overview
      </button>
      <button className={`sb-item ${view === "users" && !selectedUser ? "on" : ""}`}
        onClick={() => { setSelectedRecipe(null); setSelectedUser(null); setView("users"); }}>
        👥 Users &amp; Chefs
      </button>
      <button className={`sb-item ${view === "recipes" && !selectedRecipe ? "on" : ""}`}
        onClick={() => { setSelectedRecipe(null); setSelectedUser(null); setView("recipes"); }}>
        📋 All Recipes
      </button>
      <button className={`sb-item ${view === "reports" ? "on" : ""}`}
        onClick={() => { setSelectedRecipe(null); setSelectedUser(null); setView("reports"); }}
        style={{ position: "relative" }}>
        🚩 Reports
        {pendingReports > 0 && (
          <span style={{ marginLeft: "auto", background: "#c0392b", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
            {pendingReports}
          </span>
        )}
      </button>
      <button className="sb-item sb-logout" onClick={() => { logout(); navigate("/"); }}>⏻ Logout</button>
    </aside>
  );

  const UserTable = ({ list }) => (
    <table>
      <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Action</th></tr></thead>
      <tbody>
        {list.map((u) => (
          <tr key={u._id}>
            <td style={{ fontWeight: 500 }}>{u.name}</td>
            <td style={{ color: "var(--text-muted)", fontSize: 13 }}>{u.email}</td>
            <td>
              <span className={`badge ${u.role === "chef" ? "badge-green" : "badge-orange"}`}>
                {u.role === "foodlover" ? "Food Lover" : "Chef"}
              </span>
            </td>
            <td>
              <div className="action-cell">
                <button className="icon-btn" title="View profile" onClick={() => setSelectedUser(u)}><ViewIcon /></button>
                <button className="icon-btn del" title="Remove user" onClick={() => handleDeleteUser(u._id)}><DeleteIcon /></button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const RecipeDetailPanel = ({ r, onBack }) => {
    const imgSrc = getImageSrc(r.image);
    const chef = r.chef || {};
    const chefAvatarSrc = getImageSrc(chef.avatar);
    return (
      <>
        <div className="dash-header">
          <h1 className="dash-title">Recipe Detail</h1>
          <button className="btn btn-ghost btn-sm" onClick={onBack}>← Back</button>
        </div>
        <div className="form-card" style={{ marginBottom: "1rem" }}>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "flex-start" }}>
            {imgSrc
              ? <img src={imgSrc} alt={r.title} style={{ width: 200, height: 150, objectFit: "cover", borderRadius: 10, flexShrink: 0 }} />
              : <div style={{ width: 200, height: 150, background: "var(--cream)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 48, flexShrink: 0 }}>🍽</div>
            }
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                <span className="badge badge-green">{r.category}</span>
                <span className={`badge ${r.status === "draft" ? "badge-orange" : "badge-green"}`}>{r.status === "draft" ? "Draft" : "Published"}</span>
              </div>
              <h2 style={{ margin: "0 0 0.4rem", fontSize: "1.3rem", fontWeight: 600 }}>{r.title}</h2>
              {r.description && <p style={{ color: "var(--text-muted)", margin: "0 0 0.8rem", fontSize: 14, lineHeight: 1.6 }}>{r.description}</p>}
              <div style={{ fontSize: 13, color: "var(--text-muted)", display: "flex", gap: "1.2rem", flexWrap: "wrap" }}>
                <span>⏱ {r.time}</span>
                <span>⭐ {r.rating ? r.rating.toFixed(1) : "—"} ({r.ratingCount || 0} ratings)</span>
                <span>🤍 {r.favouritedBy?.length || 0} favourites</span>
              </div>
            </div>
          </div>
        </div>
        <div className="form-card" style={{ marginBottom: "1rem" }}>
          <div className="form-card-title">Chef Information</div>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, flexShrink: 0, overflow: "hidden" }}>
              {chefAvatarSrc ? <img src={chefAvatarSrc} alt={chef.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👨‍🍳"}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 15 }}>{chef.name || "Unknown Chef"}</div>
              {chef.email && <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{chef.email}</div>}
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{chef.bio || "No bio provided"}</div>
            </div>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
          <div className="form-card">
            <div className="form-card-title">Ingredients</div>
            {r.ingredients?.map((ing, i) => <div key={i} className="ing-item"><div className="ing-dot" /><span>{ing}</span></div>)}
          </div>
          <div className="form-card">
            <div className="form-card-title">Instructions</div>
            {r.instructions?.map((step, i) => <div key={i} className="step"><div className="step-num">{i + 1}</div><div className="step-text">{step}</div></div>)}
          </div>
        </div>
        <button className="btn" style={{ color: "crimson", borderColor: "crimson" }} onClick={() => { handleDeleteRecipe(r._id); onBack(); }}>
          🗑 Delete This Recipe
        </button>
      </>
    );
  };

  // User detail with recipe list
  if (selectedUser) {
    const u = selectedUser;
    const avatarSrc = getImageSrc(u.avatar);
    const userRecipes = recipes.filter((r) => { const chefId = r.chef?._id ?? r.chef; return chefId === u._id; });

    if (selectedRecipe) {
      return (
        <div className="page"><div className="dash-layout"><Sidebar /><main className="dash-main">
          <RecipeDetailPanel r={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
        </main></div>{toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</div>
      );
    }

    return (
      <div className="page"><div className="dash-layout"><Sidebar />
        <main className="dash-main">
          <div className="dash-header">
            <h1 className="dash-title">{u.role === "chef" ? "Chef Profile" : "User Profile"}</h1>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelectedUser(null)}>← Back</button>
          </div>
          <div className="profile-hero" style={{ borderRadius: 14, marginBottom: "1.5rem" }}>
            <div className="profile-av">
              {avatarSrc ? <img src={avatarSrc} alt={u.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : "👤"}
            </div>
            <div className="profile-name">{u.name}</div>
            <div className="profile-badge">{u.role === "foodlover" ? "Food Lover" : "Chef"}</div>
          </div>
          <div className="form-card" style={{ marginBottom: "1rem" }}>
            <div className="form-card-title">Account Information</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div><div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Full Name</div><div style={{ fontWeight: 500 }}>{u.name}</div></div>
              <div><div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Email</div><div style={{ fontWeight: 500 }}>{u.email}</div></div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Role</div>
                <span className={`badge ${u.role === "chef" ? "badge-green" : "badge-orange"}`}>{u.role === "foodlover" ? "Food Lover" : "Chef"}</span>
              </div>
              <div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginBottom: 4 }}>Status</div>
                <span className={`badge ${u.isActive ? "badge-green" : "badge-orange"}`}>{u.isActive ? "Active" : "Inactive"}</span>
              </div>
            </div>
          </div>
          {u.role === "chef" && (
            <div className="form-card" style={{ marginBottom: "1rem" }}>
              <div className="form-card-title">Chef Bio</div>
              <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>{u.bio || "This chef has not written a bio yet."}</p>
            </div>
          )}
          {u.role === "chef" && (
            <div className="tbl-card" style={{ marginBottom: "1rem" }}>
              <div className="tbl-head">Recipes by {u.name} ({userRecipes.length})</div>
              <div className="tbl-wrap">
                {userRecipes.length === 0 ? <p style={{ padding: "1rem", color: "var(--text-muted)" }}>No recipes yet.</p> : (
                  <table>
                    <thead><tr><th>Recipe</th><th>Category</th><th>Status</th><th>Rating</th></tr></thead>
                    <tbody>
                      {userRecipes.map((r) => {
                        const imgSrc = getImageSrc(r.image);
                        return (
                          <tr key={r._id} onClick={() => setSelectedRecipe(r)} style={{ cursor: "pointer" }}>
                            <td><div className="tbl-name-cell">
                              {imgSrc ? <img src={imgSrc} className="tbl-img" alt="" /> : <div className="tbl-img-ph">🍽</div>}
                              <span style={{ fontWeight: 500 }}>{r.title}</span>
                            </div></td>
                            <td>{r.category}</td>
                            <td><span className={`badge ${r.status === "draft" ? "badge-orange" : "badge-green"}`}>{r.status === "draft" ? "Draft" : "Published"}</span></td>
                            <td><span className="rating-badge">⭐ {r.rating ? r.rating.toFixed(1) : "—"}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
          <button className="btn" style={{ color: "crimson", borderColor: "crimson" }} onClick={() => handleDeleteUser(u._id)}>🗑 Remove This User</button>
        </main>
      </div>{toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</div>
    );
  }

  // Recipe detail from All Recipes
  if (selectedRecipe) {
    return (
      <div className="page"><div className="dash-layout"><Sidebar /><main className="dash-main">
        <RecipeDetailPanel r={selectedRecipe} onBack={() => setSelectedRecipe(null)} />
      </main></div>{toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}</div>
    );
  }

  return (
    <div className="page">
      <div className="dash-layout">
        <Sidebar />
        <main className="dash-main">

          {/* Overview */}
          {view === "overview" && <>
            <div className="dash-header"><h1 className="dash-title">System Overview</h1></div>
            <div className="admin-stats">
              <div className="admin-stat"><div className="admin-stat-icon">👥</div><div><div className="admin-stat-val">{loadingUsers ? "…" : users.length}</div><div className="admin-stat-lbl">Total Users</div></div></div>
              <div className="admin-stat"><div className="admin-stat-icon">👨‍🍳</div><div><div className="admin-stat-val">{loadingUsers ? "…" : chefCount}</div><div className="admin-stat-lbl">Total Chefs</div></div></div>
              <div className="admin-stat"><div className="admin-stat-icon">📋</div><div><div className="admin-stat-val">{loadingRecipes ? "…" : recipes.length}</div><div className="admin-stat-lbl">Total Recipes</div></div></div>
              <div className="admin-stat" style={{ cursor: "pointer" }} onClick={() => setView("reports")}>
                <div className="admin-stat-icon">🚩</div>
                <div>
                  <div className="admin-stat-val" style={{ color: pendingReports > 0 ? "#c0392b" : "inherit" }}>{loadingReports ? "…" : pendingReports}</div>
                  <div className="admin-stat-lbl">Pending Reports</div>
                </div>
              </div>
            </div>
            <div className="tbl-card">
              <div className="tbl-head">
                <span>Manage Users</span>
                <div className="search-box" style={{ minWidth: 180, padding: "0.38rem 0.9rem" }}>
                  <span className="search-icon">🔍</span>
                  <input placeholder="Search users…" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
              </div>
              <div className="tbl-wrap">
                {loadingUsers ? <p style={{ padding: "1rem" }}>Loading…</p> : <UserTable list={filteredUsers} />}
              </div>
            </div>
          </>}

          {/* Users */}
          {view === "users" && <>
            <div className="dash-header"><h1 className="dash-title">Users &amp; Chefs</h1></div>
            <div className="tbl-card">
              <div className="tbl-wrap">
                {loadingUsers ? <p style={{ padding: "1rem" }}>Loading…</p> : <UserTable list={users} />}
              </div>
            </div>
          </>}

          {/* Recipes */}
          {view === "recipes" && <>
            <div className="dash-header"><h1 className="dash-title">All Recipes</h1></div>
            <div className="tbl-card">
              <div className="tbl-wrap">
                {loadingRecipes ? <p style={{ padding: "1rem" }}>Loading…</p> : (
                  <table>
                    <thead><tr><th>Recipe</th><th>Chef</th><th>Category</th><th>Status</th><th>Rating</th><th>Action</th></tr></thead>
                    <tbody>
                      {recipes.map((r) => {
                        const imgSrc = getImageSrc(r.image);
                        return (
                          <tr key={r._id}>
                            <td><div className="tbl-name-cell">
                              {imgSrc ? <img src={imgSrc} className="tbl-img" alt="" /> : <div className="tbl-img-ph">🍽</div>}
                              <span style={{ fontWeight: 500 }}>{r.title}</span>
                            </div></td>
                            <td>{r.chef?.name || "—"}</td>
                            <td>{r.category}</td>
                            <td><span className={`badge ${r.status === "draft" ? "badge-orange" : "badge-green"}`}>{r.status === "draft" ? "Draft" : "Published"}</span></td>
                            <td><span className="rating-badge">⭐ {r.rating ? r.rating.toFixed(1) : "—"}</span></td>
                            <td>
                              <div className="action-cell">
                                <button className="icon-btn" title="View details" onClick={() => setSelectedRecipe(r)}><ViewIcon /></button>
                                <button className="icon-btn del" title="Delete" onClick={() => handleDeleteRecipe(r._id)}><DeleteIcon /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </>}

          {/* Reports */}
          {view === "reports" && <>
            <div className="dash-header">
              <h1 className="dash-title">Reports</h1>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                {["pending", "reviewed", "resolved", "ignored", "all"].map((s) => (
                  <button key={s} onClick={() => setReportFilter(s)}
                    style={{
                      padding: "0.35rem 0.8rem", borderRadius: 7, border: "1px solid var(--border)",
                      background: reportFilter === s ? "var(--olive)" : "#fff",
                      color: reportFilter === s ? "#fff" : "var(--text-muted)",
                      fontSize: 13, cursor: "pointer", fontWeight: reportFilter === s ? 600 : 400,
                    }}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                    {s === "pending" && pendingReports > 0 && ` (${pendingReports})`}
                  </button>
                ))}
              </div>
            </div>
            <div className="tbl-card">
              <div className="tbl-wrap">
                {loadingReports ? <p style={{ padding: "1rem" }}>Loading…</p>
                  : filteredReports.length === 0 ? <p style={{ padding: "1rem", color: "var(--text-muted)" }}>No {reportFilter} reports.</p>
                  : (
                    <table>
                      <thead><tr><th>Type</th><th>Target</th><th>Reason</th><th>Reporter</th><th>Details</th><th>Status</th><th>Action</th></tr></thead>
                      <tbody>
                        {filteredReports.map((rp) => (
                          <tr key={rp._id}>
                            <td><span className={`badge ${rp.targetType === "recipe" ? "badge-green" : "badge-orange"}`}>{rp.targetType}</span></td>
                            <td style={{ fontWeight: 500, fontSize: 13 }}>
                              {rp.targetType === "recipe"
                                ? (rp.targetRecipe?.title || "Deleted recipe")
                                : (rp.targetUser?.name || "Deleted user")}
                            </td>
                            <td style={{ fontSize: 13 }}>{rp.reason.replace("_", " ")}</td>
                            <td style={{ fontSize: 13, color: "var(--text-muted)" }}>{rp.reporter?.name || "—"}</td>
                            <td style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 150 }}>{rp.details || "—"}</td>
                            <td>
                              <span className={`badge ${
                                rp.status === "pending" ? "badge-orange"
                                : rp.status === "resolved" ? "badge-green"
                                : "badge-orange"
                              }`}>{rp.status}</span>
                            </td>
                            <td>
                              {rp.status === "pending" && (
                                <div className="action-cell">
                                  <button onClick={() => handleUpdateReport(rp._id, "resolved")}
                                    style={{ padding: "0.25rem 0.6rem", borderRadius: 6, border: "1px solid #27ae60", background: "#e8f5e9", color: "#27ae60", fontSize: 12, cursor: "pointer" }}>
                                    Resolve
                                  </button>
                                  <button onClick={() => handleUpdateReport(rp._id, "ignored")}
                                    style={{ padding: "0.25rem 0.6rem", borderRadius: 6, border: "1px solid var(--border)", background: "#fff", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
                                    Ignore
                                  </button>
                                  {rp.targetType === "recipe" && rp.targetRecipe?._id && (
                                    <button onClick={() => { const r = recipes.find((x) => x._id === rp.targetRecipe._id); if (r) setSelectedRecipe(r); }}
                                      style={{ padding: "0.25rem 0.6rem", borderRadius: 6, border: "1px solid var(--border)", background: "#fff", color: "var(--text-muted)", fontSize: 12, cursor: "pointer" }}>
                                      View
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
              </div>
            </div>
          </>}

        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}