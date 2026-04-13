import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { Toast } from "../components/Shared";
import { DeleteIcon } from "../components/Icons";
import {
  getChefRecipes, createRecipe, updateRecipe, deleteRecipe,
  toggleRecipeStatus, updateProfile, uploadAvatar, changePassword,
  getComments, deleteComment, addReply, deleteReply,
} from "../services/api";

const CATEGORIES = ["Desserts", "Italian", "Newari", "Drinks", "Other"];
const EMPTY = { title: "", category: "Desserts", time: "", description: "", ingredients: "", instructions: "" };
const IMAGE_BASE = "http://localhost:5000";

export default function ChefDashboard() {
  const { user, logout, login } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState("recipes");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(EMPTY);
  const [editingId, setEditingId] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);
  const [profileForm, setProfileForm] = useState({ name: user?.name || "", bio: user?.bio || "" });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [passForm, setPassForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });

  // Comments state
  const [allComments, setAllComments] = useState([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState({});
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => { fetchRecipesAndComments(); }, []);

  const fetchRecipesAndComments = async () => {
    setLoading(true);
    try {
      const res = await getChefRecipes();
      if (res.success) {
        const list = res.data?.recipes ?? res.data;
        const recipeList = Array.isArray(list) ? list : [];
        setRecipes(recipeList);
        // Fetch comments for all recipes in parallel
        fetchAllComments(recipeList);
      }
    } catch { setToast({ msg: "Failed to load recipes", type: "error" }); }
    finally { setLoading(false); }
  };

  const fetchAllComments = async (recipeList) => {
    setCommentsLoading(true);
    try {
      const results = await Promise.all(
        recipeList.map(async (r) => {
          const res = await getComments(r._id);
          const list = res.success ? (res.data?.comments ?? res.data) : [];
          return { recipe: r, comments: Array.isArray(list) ? list : [] };
        })
      );
      // Only show recipes that have at least one comment
      setAllComments(results.filter((item) => item.comments.length > 0));
    } catch { /* silently fail */ }
    finally { setCommentsLoading(false); }
  };

  const published = recipes.filter((r) => r.status === "published" || !r.status);
  const drafts = recipes.filter((r) => r.status === "draft");
  const avgRating = published.length
    ? (published.reduce((a, r) => a + (r.rating || 0), 0) / published.length).toFixed(1) : "0.0";
  const totalFavs = recipes.reduce((a, r) => a + (r.favouritedBy?.length || 0), 0);

  const handleEditClick = (r) => {
    setEditingId(r._id);
    setForm({
      title: r.title, category: r.category, time: r.time,
      description: r.description || "",
      ingredients: Array.isArray(r.ingredients) ? r.ingredients.join("\n") : r.ingredients || "",
      instructions: Array.isArray(r.instructions) ? r.instructions.join("\n") : r.instructions || "",
    });
    setImageFile(null);
    setView("add");
  };

  const handleSubmit = async (e, saveDraft = false) => {
    e.preventDefault();
    if (!form.title) { setToast({ msg: "Please enter a title", type: "error" }); return; }
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        ingredients: form.ingredients.split("\n").filter(Boolean),
        instructions: form.instructions.split("\n").filter(Boolean),
        status: saveDraft ? "draft" : "published",
      };
      let recipeId = editingId;

      if (editingId) {
        const res = await updateRecipe(editingId, payload);
        if (!res.success) { setToast({ msg: res.message || "Update failed", type: "error" }); return; }
        setToast({ msg: saveDraft ? "Saved as draft ✓" : "Recipe updated! ✓", type: "success" });
      } else {
        const res = await createRecipe(payload);
        if (!res.success) { setToast({ msg: res.message || "Failed to create recipe", type: "error" }); return; }
        const newRecipe = res.data?.recipe ?? res.data;
        recipeId = newRecipe?._id;
        setToast({ msg: saveDraft ? "Draft saved! 📝" : "Recipe published! 🎉", type: "success" });
      }

      if (imageFile && recipeId) {
        const fd = new FormData();
        fd.append("recipeImage", imageFile);
        await fetch(`${IMAGE_BASE}/api/recipes/${recipeId}/image`, {
          method: "PATCH",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
          body: fd,
        });
      }

      setForm(EMPTY); setImageFile(null); setEditingId(null); setView("recipes");
      fetchRecipesAndComments();
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setSubmitting(false); }
  };

  const handleToggleStatus = async (r) => {
    try {
      const res = await toggleRecipeStatus(r._id);
      if (res.success) { setToast({ msg: res.message, type: "success" }); fetchRecipesAndComments(); }
      else setToast({ msg: res.message || "Failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleDelete = async (id) => {
    try {
      const res = await deleteRecipe(id);
      if (res.success) { setRecipes(recipes.filter((r) => r._id !== id)); setToast({ msg: "Recipe deleted", type: "success" }); }
      else setToast({ msg: res.message || "Delete failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await updateProfile(profileForm);
      if (res.success) { login(res.data.user, localStorage.getItem("token")); setToast({ msg: "Profile updated! ✓", type: "success" }); }
      else setToast({ msg: res.message || "Update failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) { setToast({ msg: "Please select an image first", type: "error" }); return; }
    try {
      const fd = new FormData(); fd.append("avatar", avatarFile);
      const res = await uploadAvatar(fd);
      if (res.success) { login(res.data.user, localStorage.getItem("token")); setAvatarPreview(null); setAvatarFile(null); setToast({ msg: "Photo updated! ✓", type: "success" }); }
      else setToast({ msg: res.message || "Upload failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) { setToast({ msg: "Passwords do not match!", type: "error" }); return; }
    try {
      const res = await changePassword(passForm.currentPassword, passForm.newPassword);
      if (res.success) { setToast({ msg: "Password changed! ✓", type: "success" }); setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" }); }
      else setToast({ msg: res.message || "Failed", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const getImageSrc = (r) => r.image ? (r.image.startsWith("http") ? r.image : `${IMAGE_BASE}${r.image}`) : null;
  const avatarSrc = avatarPreview || (user?.avatar ? (user.avatar.startsWith("http") ? user.avatar : `${IMAGE_BASE}${user.avatar}`) : null);

  const handleAddReply = async (commentId, recipeId) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    setSubmittingReply(true);
    try {
      const res = await addReply(commentId, text);
      if (res.success) {
        setAllComments((prev) => prev.map((item) =>
          item.recipe._id === recipeId
            ? { ...item, comments: item.comments.map((c) => c._id === commentId ? res.data.comment : c) }
            : item
        ));
        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
        setReplyingTo(null);
      } else {
        setToast({ msg: res.message || "Failed to add reply", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setSubmittingReply(false); }
  };

  const handleDeleteReply = async (commentId, replyId, recipeId) => {
    try {
      const res = await deleteReply(commentId, replyId);
      if (res.success) {
        setAllComments((prev) => prev.map((item) =>
          item.recipe._id === recipeId
            ? {
                ...item,
                comments: item.comments.map((c) =>
                  c._id === commentId
                    ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
                    : c
                )
              }
            : item
        ));
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const RecipeTable = ({ list }) => (
    <table>
      <thead><tr><th>Recipe</th><th>Category</th><th>Rating</th><th>Favourites</th><th>Status</th><th>Action</th></tr></thead>
      <tbody>
        {list.map((r) => {
          const imgSrc = getImageSrc(r);
          const isDraft = r.status === "draft";
          return (
            <tr key={r._id}>
              <td>
                <div className="tbl-name-cell">
                  {imgSrc ? <img src={imgSrc} className="tbl-img" alt="" /> : <div className="tbl-img-ph">🍽</div>}
                  <span style={{ fontWeight: 500 }}>{r.title}</span>
                </div>
              </td>
              <td>{r.category}</td>
              <td><span className="rating-badge">⭐ {r.rating ? r.rating.toFixed(1) : "—"}</span></td>
              <td>🤍 {r.favouritedBy?.length || 0}</td>
              <td><span className={`badge ${isDraft ? "badge-orange" : "badge-green"}`}>{isDraft ? "Draft" : "Published"}</span></td>
              <td>
                <div className="action-cell">
                  <button className="icon-btn" title={isDraft ? "Publish now" : "Move to Draft"} onClick={() => handleToggleStatus(r)} style={{ fontSize: 14 }}>
                    {isDraft ? "🚀" : "📝"}
                  </button>
                  <button className="icon-btn" title="Edit" onClick={() => handleEditClick(r)}>✏️</button>
                  <button className="icon-btn del" onClick={() => handleDelete(r._id)} title="Delete"><DeleteIcon /></button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );

  return (
    <div className="page">
      <div className="dash-layout">
        <aside className="sidebar">
          <div className="sb-logo">👨‍🍳 Chef Portal</div>
          <div className="sb-sec">Menu</div>
          <button className={`sb-item ${view === "recipes" ? "on" : ""}`} onClick={() => { setView("recipes"); setEditingId(null); setForm(EMPTY); }}>📋 My Recipes</button>
          <button className={`sb-item ${view === "add" && !editingId ? "on" : ""}`} onClick={() => { setEditingId(null); setForm(EMPTY); setView("add"); }}>➕ Add Recipe</button>
          <button className={`sb-item ${view === "comments" ? "on" : ""}`} onClick={() => setView("comments")} style={{ position: "relative" }}>
            💬 Comments
            {allComments.reduce((a, i) => a + i.comments.length, 0) > 0 && (
              <span style={{ marginLeft: "auto", background: "var(--olive)", color: "#fff", borderRadius: 10, padding: "1px 7px", fontSize: 11, fontWeight: 700 }}>
                {allComments.reduce((a, i) => a + i.comments.length, 0)}
              </span>
            )}
          </button>
          <button className={`sb-item ${view === "profile" ? "on" : ""}`} onClick={() => setView("profile")}>👤 Profile</button>
          <button className="sb-item sb-logout" onClick={() => { logout(); navigate("/"); }}>⏻ Logout</button>
        </aside>

        <main className="dash-main">

          {view === "recipes" && <>
            <div className="dash-header">
              <h1 className="dash-title">My Recipes</h1>
              <button className="btn btn-primary" onClick={() => { setEditingId(null); setForm(EMPTY); setView("add"); }}>➕ Create New Recipe</button>
            </div>
            <div className="stats-row" style={{ gridTemplateColumns: "repeat(5, 1fr)" }}>
              <div className="stat-card"><div className="stat-icon">📋</div><div className="stat-val">{recipes.length}</div><div className="stat-lbl">Total</div></div>
              <div className="stat-card"><div className="stat-icon">🚀</div><div className="stat-val">{published.length}</div><div className="stat-lbl">Published</div></div>
              <div className="stat-card"><div className="stat-icon">📝</div><div className="stat-val">{drafts.length}</div><div className="stat-lbl">Drafts</div></div>
              <div className="stat-card"><div className="stat-icon">⭐</div><div className="stat-val">{avgRating}</div><div className="stat-lbl">Avg. Rating</div></div>
              <div className="stat-card"><div className="stat-icon">❤️</div><div className="stat-val">{totalFavs}</div><div className="stat-lbl">Favourites</div></div>
            </div>

            <div className="tbl-card" style={{ marginBottom: "1.5rem" }}>
              <div className="tbl-head"><span>Published ({published.length})</span></div>
              <div className="tbl-wrap">
                {loading ? <p style={{ padding: "1rem" }}>Loading…</p>
                  : published.length === 0 ? <p style={{ padding: "1rem", color: "var(--text-muted)" }}>No published recipes yet.</p>
                  : <RecipeTable list={published} />}
              </div>
            </div>

            <div className="tbl-card">
              <div className="tbl-head">
                <span>Drafts ({drafts.length})</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 400 }}>Not visible to food lovers</span>
              </div>
              <div className="tbl-wrap">
                {drafts.length === 0
                  ? <p style={{ padding: "1rem", color: "var(--text-muted)" }}>No drafts. Click "Save as Draft" when creating a recipe.</p>
                  : <RecipeTable list={drafts} />}
              </div>
            </div>
          </>}

          {view === "add" && <>
            <div className="dash-header">
              <h1 className="dash-title">{editingId ? "Edit Recipe" : "Add New Recipe"}</h1>
              <button className="btn btn-ghost btn-sm" onClick={() => { setEditingId(null); setForm(EMPTY); setView("recipes"); }}>← Back</button>
            </div>
            <div className="form-card">
              <form onSubmit={(e) => handleSubmit(e, false)}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Recipe Title</label>
                    <input className="form-input" placeholder="e.g. Chocolate Lava Cake" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <select className="form-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preparation Time</label>
                    <input className="form-input" placeholder="e.g. 45 mins" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Recipe Image {editingId && <span style={{ fontWeight: 400, fontSize: 12, color: "var(--text-muted)" }}>(leave empty to keep current)</span>}</label>
                    <input className="form-input" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files[0])} />
                  </div>
                  <div className="form-group span-2">
                    <label className="form-label">Description</label>
                    <textarea className="form-input" placeholder="Brief description…" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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
                <div style={{ display: "flex", gap: "0.8rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                  <button type="submit" className="btn btn-primary" disabled={submitting}>
                    {submitting ? "Saving…" : editingId ? "Save Changes" : "🚀 Publish Recipe"}
                  </button>
                  <button type="button" className="btn btn-ghost" disabled={submitting} onClick={(e) => handleSubmit(e, true)}>
                    📝 Save as Draft
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => { setForm(EMPTY); setEditingId(null); setView("recipes"); }}>Cancel</button>
                </div>
              </form>
            </div>
          </>}

          {/* Comments View */}
          {view === "comments" && <>
            <div className="dash-header"><h1 className="dash-title">Recipe Comments</h1></div>
            {commentsLoading ? (
              <div className="empty-state"><div className="ei">⏳</div><p>Loading comments…</p></div>
            ) : allComments.length === 0 ? (
              <div className="empty-state">
                <div className="ei">💬</div>
                <h3>No comments yet</h3>
                <p>Comments from food lovers will appear here once they interact with your recipes.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                {allComments.map(({ recipe, comments }) => {
                  const imgSrc = getImageSrc(recipe);
                  return (
                    <div key={recipe._id} className="tbl-card">
                      <div className="tbl-head">
                        <div style={{ display: "flex", alignItems: "center", gap: "0.7rem" }}>
                          {imgSrc ? <img src={imgSrc} className="tbl-img" alt="" /> : <div className="tbl-img-ph">🍽</div>}
                          <div>
                            <div style={{ fontWeight: 600 }}>{recipe.title}</div>
                            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{comments.length} comment{comments.length !== 1 ? "s" : ""}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ padding: "0.8rem 1.2rem", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
                        {comments.map((c) => {
                          const avatarSrc = c.user?.avatar
                            ? (c.user.avatar.startsWith("http") ? c.user.avatar : `${IMAGE_BASE}${c.user.avatar}`)
                            : null;
                          return (
                            <div key={c._id}>
                              {/* Comment */}
                              <div style={{ display: "flex", gap: "0.7rem", alignItems: "flex-start" }}>
                                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "var(--olive)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>
                                  {avatarSrc
                                    ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                    : c.user?.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div style={{ flex: 1, background: "var(--cream)", borderRadius: 9, padding: "0.6rem 0.9rem" }}>
                                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
                                    <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                      <span style={{ fontWeight: 600, fontSize: 13 }}>{c.user?.name || "User"}</span>
                                      {c.user?.role === "foodlover" && <span className="badge badge-orange" style={{ fontSize: 10 }}>Food Lover</span>}
                                      {c.user?.role === "chef" && <span className="badge badge-green" style={{ fontSize: 10 }}>Chef</span>}
                                    </div>
                                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                                      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                                      <button
                                        onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--olive)", fontSize: 12, padding: 0, fontWeight: 600 }}>
                                        {replyingTo === c._id ? "Cancel" : "Reply"}
                                      </button>
                                      <button
                                        onClick={async () => {
                                          const res = await deleteComment(c._id);
                                          if (res.success) {
                                            setAllComments((prev) =>
                                              prev.map((item) =>
                                                item.recipe._id === recipe._id
                                                  ? { ...item, comments: item.comments.filter((x) => x._id !== c._id) }
                                                  : item
                                              ).filter((item) => item.comments.length > 0)
                                            );
                                            setToast({ msg: "Comment deleted", type: "success" });
                                          }
                                        }}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 13, padding: 0, lineHeight: 1 }}
                                        title="Delete comment"
                                      >✕</button>
                                    </div>
                                  </div>
                                  <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "var(--text)" }}>{c.text}</p>
                                </div>
                              </div>

                              {/* Existing replies */}
                              {c.replies?.length > 0 && (
                                <div style={{ marginLeft: 42, marginTop: "0.4rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                                  {c.replies.map((r) => {
                                    const rAvatar = r.user?.avatar
                                      ? (r.user.avatar.startsWith("http") ? r.user.avatar : `${IMAGE_BASE}${r.user.avatar}`)
                                      : null;
                                    return (
                                      <div key={r._id} style={{ display: "flex", gap: "0.6rem" }}>
                                        <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--olive-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>
                                          {rAvatar ? <img src={rAvatar} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : r.user?.name?.[0]?.toUpperCase() || "?"}
                                        </div>
                                        <div style={{ flex: 1, background: "#f0f4e8", border: "1px solid #d8e4b0", borderRadius: 8, padding: "0.5rem 0.8rem" }}>
                                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                                            <div style={{ display: "flex", gap: "0.3rem", alignItems: "center" }}>
                                              <span style={{ fontWeight: 600, fontSize: 12 }}>{r.user?.name || "Chef"}</span>
                                              <span className="badge badge-green" style={{ fontSize: 9 }}>Chef</span>
                                            </div>
                                            <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                              <span style={{ fontSize: 10, color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                                              <button onClick={() => handleDeleteReply(c._id, r._id, recipe._id)}
                                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                                            </div>
                                          </div>
                                          <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: "var(--text)" }}>{r.text}</p>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}

                              {/* Reply input */}
                              {replyingTo === c._id && (
                                <div style={{ marginLeft: 42, marginTop: "0.4rem", display: "flex", gap: "0.5rem", alignItems: "flex-start" }}>
                                  <div style={{ width: 28, height: 28, borderRadius: "50%", background: "var(--olive-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                                    {user?.name?.[0]?.toUpperCase()}
                                  </div>
                                  <div style={{ flex: 1 }}>
                                    <textarea
                                      className="form-input"
                                      placeholder="Write your reply…"
                                      value={replyText[c._id] || ""}
                                      onChange={(e) => setReplyText((prev) => ({ ...prev, [c._id]: e.target.value }))}
                                      style={{ minHeight: 55, marginBottom: "0.4rem", fontSize: 13 }}
                                      maxLength={500}
                                    />
                                    <button
                                      className="btn btn-primary btn-sm"
                                      onClick={() => handleAddReply(c._id, recipe._id)}
                                      disabled={submittingReply || !replyText[c._id]?.trim()}
                                    >
                                      {submittingReply ? "Posting…" : "Post Reply"}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>}

          {view === "profile" && <>
            <div className="dash-header"><h1 className="dash-title">My Profile</h1></div>
            <div className="profile-hero" style={{ borderRadius: 14, marginBottom: "1.5rem" }}>
              <div className="profile-av">
                {avatarSrc ? <img src={avatarSrc} alt="avatar" style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} /> : "👨‍🍳"}
              </div>
              <div className="profile-name">{user?.name}</div>
              <div className="profile-badge">Chef</div>
            </div>
            <div className="form-card" style={{ marginBottom: "1rem" }}>
              <div className="form-card-title">Update Profile Photo</div>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <input className="form-input" type="file" accept="image/*" style={{ flex: 1 }}
                  onChange={(e) => { const f = e.target.files[0]; if (f) { setAvatarFile(f); setAvatarPreview(URL.createObjectURL(f)); } }} />
                <button className="btn btn-primary" onClick={handleAvatarUpload} disabled={!avatarFile}>Upload Photo</button>
              </div>
            </div>
            <div className="form-card" style={{ marginBottom: "1rem" }}>
              <div className="form-card-title">Edit Profile</div>
              <form onSubmit={handleProfileUpdate}>
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Full Name</label>
                    <input className="form-input" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input className="form-input" value={user?.email} disabled style={{ opacity: 0.6 }} />
                  </div>
                  <div className="form-group span-2">
                    <label className="form-label">Bio</label>
                    <textarea className="form-input" placeholder="Tell people about yourself…" value={profileForm.bio} onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })} />
                  </div>
                </div>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </form>
            </div>
            <div className="form-card">
              <div className="form-card-title">Change Password</div>
              <form onSubmit={handleChangePassword}>
                <div className="form-group">
                  <label className="form-label">Current Password</label>
                  <input className="form-input" type="password" value={passForm.currentPassword} onChange={(e) => setPassForm({ ...passForm, currentPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <input className="form-input" type="password" value={passForm.newPassword} onChange={(e) => setPassForm({ ...passForm, newPassword: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Confirm New Password</label>
                  <input className="form-input" type="password" value={passForm.confirmPassword} onChange={(e) => setPassForm({ ...passForm, confirmPassword: e.target.value })} />
                </div>
                <button type="submit" className="btn btn-primary">Change Password</button>
              </form>
            </div>
          </>}

        </main>
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}