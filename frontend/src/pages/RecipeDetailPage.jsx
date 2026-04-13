import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { StarRating, Toast } from "../components/Shared";
import { getRecipeById, rateRecipe, getComments, addComment, deleteComment, addReply, deleteReply, createReport } from "../services/api";

const IMAGE_BASE = "http://localhost:5000";
const REPORT_REASONS = [
  { value: "spam", label: "Spam" },
  { value: "offensive", label: "Offensive content" },
  { value: "inappropriate", label: "Inappropriate" },
  { value: "wrong_info", label: "Wrong information" },
  { value: "other", label: "Other" },
];

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favourites, toggleFav, user } = useAuth();
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [toast, setToast] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportReason, setReportReason] = useState("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);
  // Reply state: { [commentId]: text }
  const [replyText, setReplyText] = useState({});
  const [replyingTo, setReplyingTo] = useState(null); // commentId being replied to
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => { fetchRecipe(); fetchComments(); }, [id]);

  const fetchRecipe = async () => {
    setLoading(true); setError(null);
    try {
      const res = await getRecipeById(id);
      if (res.success) setRecipe(res.data?.recipe ?? res.data);
      else setError(res.message || "Recipe not found");
    } catch { setError("Could not connect to server"); }
    finally { setLoading(false); }
  };

  const fetchComments = async () => {
    setCommentLoading(true);
    try {
      const res = await getComments(id);
      if (res.success) {
        const list = res.data?.comments ?? res.data;
        setComments(Array.isArray(list) ? list : []);
      }
    } catch { /* silently fail */ }
    finally { setCommentLoading(false); }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!user) { setToast({ msg: "Please login to comment", type: "error" }); return; }
    if (!commentText.trim()) return;
    setSubmittingComment(true);
    try {
      const res = await addComment(id, commentText.trim());
      if (res.success) {
        setComments([res.data.comment, ...comments]);
        setCommentText("");
      } else {
        setToast({ msg: res.message || "Failed to add comment", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setSubmittingComment(false); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await deleteComment(commentId);
      if (res.success) setComments(comments.filter((c) => c._id !== commentId));
      else setToast({ msg: "Failed to delete comment", type: "error" });
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleAddReply = async (commentId) => {
    const text = replyText[commentId]?.trim();
    if (!text) return;
    setSubmittingReply(true);
    try {
      const res = await addReply(commentId, text);
      if (res.success) {
        setComments(comments.map((c) =>
          c._id === commentId ? res.data.comment : c
        ));
        setReplyText((prev) => ({ ...prev, [commentId]: "" }));
        setReplyingTo(null);
      } else {
        setToast({ msg: res.message || "Failed to add reply", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setSubmittingReply(false); }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    try {
      const res = await deleteReply(commentId, replyId);
      if (res.success) {
        setComments(comments.map((c) =>
          c._id === commentId
            ? { ...c, replies: c.replies.filter((r) => r._id !== replyId) }
            : c
        ));
      } else {
        setToast({ msg: "Failed to delete reply", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
  };

  const handleReport = async () => {
    setSubmittingReport(true);
    try {
      const res = await createReport({ targetType: "recipe", targetRecipe: recipe._id, reason: reportReason, details: reportDetails });
      if (res.success) {
        setToast({ msg: "Report submitted. Thank you!", type: "success" });
        setShowReport(false); setReportDetails("");
      } else {
        setToast({ msg: res.message || "Failed to submit report", type: "error" });
      }
    } catch { setToast({ msg: "Something went wrong!", type: "error" }); }
    finally { setSubmittingReport(false); }
  };

  if (loading) return (
    <div className="page"><div className="page-wrap">
      <div className="empty-state"><div className="ei">⏳</div><p>Loading recipe…</p></div>
    </div></div>
  );
  if (error || !recipe) return (
    <div className="page"><div className="page-wrap">
      <button className="back-btn" onClick={() => navigate("/home")}>← Back</button>
      <p>{error || "Recipe not found."}</p>
    </div></div>
  );

  const isFav = favourites.includes(recipe._id);
  const chefName = recipe.chef?.name || "Unknown Chef";
  const imageSrc = recipe.image ? (recipe.image.startsWith("http") ? recipe.image : `${IMAGE_BASE}${recipe.image}`) : null;
  const getAvatarSrc = (u) => u?.avatar ? (u.avatar.startsWith("http") ? u.avatar : `${IMAGE_BASE}${u.avatar}`) : null;

  const requireLogin = (action) => {
    if (!user) { setToast({ msg: "Please login to " + action, type: "error" }); return false; }
    return true;
  };

  const handleRate = async (val) => {
    if (!requireLogin("rate recipes")) return;
    setUserRating(val); setRated(true);
    try {
      await rateRecipe(recipe._id, val);
      setToast({ msg: `Rated ${val} stars! ⭐`, type: "success" });
      fetchRecipe();
    } catch { setToast({ msg: "Failed to submit rating", type: "error" }); setRated(false); }
  };

  const handleFav = () => {
    if (!requireLogin("save favourites")) return;
    toggleFav(recipe._id);
    setToast({ msg: isFav ? "Removed from favourites" : "Added to favourites! ❤️", type: "success" });
  };

  return (
    <div className="page">
      <div className="detail-wrap">

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.6rem" }}>
          <button className="back-btn" style={{ margin: 0 }} onClick={() => navigate("/home")}>← Back to recipes</button>
          {user && (
            <button onClick={() => setShowReport(!showReport)}
              style={{ background: "none", border: "1px solid var(--border)", borderRadius: 7, padding: "0.35rem 0.8rem", fontSize: 13, color: "var(--text-muted)", cursor: "pointer" }}>
              🚩 Report
            </button>
          )}
        </div>

        {/* Report form */}
        {showReport && (
          <div className="form-card" style={{ marginBottom: "1.5rem", borderColor: "#f5c0bb" }}>
            <div className="form-card-title" style={{ color: "#c0392b" }}>🚩 Report this Recipe</div>
            <div className="form-group">
              <label className="form-label">Reason</label>
              <select className="form-input" value={reportReason} onChange={(e) => setReportReason(e.target.value)}>
                {REPORT_REASONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Additional details (optional)</label>
              <textarea className="form-input" placeholder="Describe the issue…" value={reportDetails} onChange={(e) => setReportDetails(e.target.value)} style={{ minHeight: 70 }} />
            </div>
            <div style={{ display: "flex", gap: "0.7rem" }}>
              <button className="btn btn-danger" onClick={handleReport} disabled={submittingReport}>
                {submittingReport ? "Submitting…" : "Submit Report"}
              </button>
              <button className="btn btn-ghost" onClick={() => setShowReport(false)}>Cancel</button>
            </div>
          </div>
        )}

        {/* Recipe image + info */}
        <div className="detail-grid">
          {imageSrc ? <img src={imageSrc} alt={recipe.title} className="detail-img" /> : <div className="detail-img-ph">🍽</div>}
          <div className="detail-info">
            <div className="detail-cat">{recipe.category}</div>
            <h1 className="detail-title">{recipe.title}</h1>
            {recipe.description && <p style={{ color: "var(--text-muted)", marginBottom: "0.8rem" }}>{recipe.description}</p>}
            <div className="detail-meta">⏱ {recipe.time}</div>
            <div className="detail-chef">Recipe by <strong>{chefName}</strong></div>
            <div>
              <StarRating value={rated ? userRating : Math.round(recipe.rating || 0)} onChange={handleRate} />
              <div className="rating-note">
                {rated ? "Thanks for rating!" : `${(recipe.rating || 0).toFixed(1)} average · ${recipe.ratingCount || 0} ratings`}
              </div>
              {!user && (
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>
                  <button style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline" }} onClick={() => navigate("/login")}>Login</button>
                  {" "}to rate or favourite this recipe
                </div>
              )}
            </div>
            <button className={`btn ${isFav ? "btn-fav-active" : "btn-fav"}`} onClick={handleFav}>
              {isFav ? "❤️ Remove Favourite" : "🤍 Add to Favourites"}
            </button>
          </div>
        </div>

        {/* Ingredients + Instructions */}
        <div className="body-grid">
          <div>
            <h2 className="section-heading">Ingredients</h2>
            {recipe.ingredients.map((ing, i) => (
              <div key={i} className="ing-item"><div className="ing-dot" /><span>{ing}</span></div>
            ))}
          </div>
          <div>
            <h2 className="section-heading">Instructions</h2>
            {recipe.instructions.map((step, i) => (
              <div key={i} className="step">
                <div className="step-num">{i + 1}</div>
                <div className="step-text">{step}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Comments ── */}
        <div style={{ marginTop: "3rem" }}>
          <h2 className="section-heading">Comments ({comments.length})</h2>

          {user ? (
            <form onSubmit={handleAddComment} style={{ marginBottom: "1.5rem" }}>
              <div style={{ display: "flex", gap: "0.8rem", alignItems: "flex-start" }}>
                <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--olive)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0 }}>
                  {user.name?.[0]?.toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <textarea
                    className="form-input"
                    placeholder="Share your thoughts, tips or questions…"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    style={{ minHeight: 70, marginBottom: "0.5rem" }}
                    maxLength={500}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{commentText.length}/500</span>
                    <button type="submit" className="btn btn-primary btn-sm" disabled={submittingComment || !commentText.trim()}>
                      {submittingComment ? "Posting…" : "Post Comment"}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          ) : (
            <div style={{ background: "#f5f0e8", borderRadius: 10, padding: "1rem", marginBottom: "1.5rem", textAlign: "center", fontSize: 14, color: "var(--text-muted)" }}>
              <button style={{ background: "none", border: "none", color: "var(--olive)", cursor: "pointer", fontWeight: 600, fontSize: 14 }} onClick={() => navigate("/login")}>Login</button>
              {" "}to leave a comment
            </div>
          )}

          {commentLoading ? (
            <p style={{ color: "var(--text-muted)" }}>Loading comments…</p>
          ) : comments.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No comments yet. Be the first!</p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              {comments.map((c) => {
                const avatarSrc = getAvatarSrc(c.user);
                const canDelete = user && (user._id === c.user?._id || user.id === c.user?._id || user.role === "admin" || user.role === "chef");
                const isChef = user?.role === "chef" || user?.role === "admin";
                return (
                  <div key={c._id}>
                    {/* Main comment */}
                    <div style={{ display: "flex", gap: "0.8rem" }}>
                      <div style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--olive)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>
                        {avatarSrc
                          ? <img src={avatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          : c.user?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div style={{ flex: 1, background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.3rem" }}>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ fontWeight: 600, fontSize: 14 }}>{c.user?.name || "User"}</span>
                            {c.user?.role === "chef" && <span className="badge badge-green" style={{ fontSize: 10 }}>Chef</span>}
                          </div>
                          <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                            <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(c.createdAt).toLocaleDateString()}</span>
                            {isChef && (
                              <button onClick={() => setReplyingTo(replyingTo === c._id ? null : c._id)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--olive)", fontSize: 12, padding: 0, fontWeight: 600 }}>
                                {replyingTo === c._id ? "Cancel" : "Reply"}
                              </button>
                            )}
                            {canDelete && (
                              <button onClick={() => handleDeleteComment(c._id)}
                                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 13, padding: 0, lineHeight: 1 }}>✕</button>
                            )}
                          </div>
                        </div>
                        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6 }}>{c.text}</p>
                      </div>
                    </div>

                    {/* Replies */}
                    {c.replies?.length > 0 && (
                      <div style={{ marginLeft: 46, marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                        {c.replies.map((r) => {
                          const rAvatarSrc = getAvatarSrc(r.user);
                          const canDeleteReply = user && (user._id === r.user?._id || user.id === r.user?._id || user.role === "admin");
                          return (
                            <div key={r._id} style={{ display: "flex", gap: "0.6rem" }}>
                              <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--olive-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0, overflow: "hidden" }}>
                                {rAvatarSrc
                                  ? <img src={rAvatarSrc} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                  : r.user?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                              <div style={{ flex: 1, background: "#f0f4e8", border: "1px solid #d8e4b0", borderRadius: 9, padding: "0.55rem 0.85rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                    <span style={{ fontWeight: 600, fontSize: 13 }}>{r.user?.name || "Chef"}</span>
                                    <span className="badge badge-green" style={{ fontSize: 10 }}>Chef</span>
                                  </div>
                                  <div style={{ display: "flex", gap: "0.4rem", alignItems: "center" }}>
                                    <span style={{ fontSize: 11, color: "var(--text-muted)" }}>{new Date(r.createdAt).toLocaleDateString()}</span>
                                    {canDeleteReply && (
                                      <button onClick={() => handleDeleteReply(c._id, r._id)}
                                        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontSize: 12, padding: 0, lineHeight: 1 }}>✕</button>
                                    )}
                                  </div>
                                </div>
                                <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6 }}>{r.text}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Reply input box — only shown for chef/admin when Reply clicked */}
                    {replyingTo === c._id && isChef && (
                      <div style={{ marginLeft: 46, marginTop: "0.5rem", display: "flex", gap: "0.6rem", alignItems: "flex-start" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--olive-dark)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                          {user?.name?.[0]?.toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <textarea
                            className="form-input"
                            placeholder="Write your reply…"
                            value={replyText[c._id] || ""}
                            onChange={(e) => setReplyText((prev) => ({ ...prev, [c._id]: e.target.value }))}
                            style={{ minHeight: 60, marginBottom: "0.4rem", fontSize: 13 }}
                            maxLength={500}
                          />
                          <button
                            className="btn btn-primary btn-sm"
                            onClick={() => handleAddReply(c._id)}
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
          )}
        </div>

      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}