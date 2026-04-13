import { useState, useEffect } from "react";
import { getChefs } from "../services/api";

const IMAGE_BASE = "http://localhost:5000";

export default function ChefsPage() {
  const [chefs, setChefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selected, setSelected] = useState(null); // selected chef for detail view

  useEffect(() => {
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getChefs();
      if (res.success) {
        setChefs(res.data);
      } else {
        setError(res.message || "Failed to load chefs");
      }
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  const getAvatarSrc = (chef) => {
    if (!chef.avatar) return null;
    return chef.avatar.startsWith("http") ? chef.avatar : `${IMAGE_BASE}${chef.avatar}`;
  };

  // ── Chef detail modal ──────────────────────────────────────────────────────
  if (selected) {
    const avatarSrc = getAvatarSrc(selected);
    return (
      <div className="page">
        <div className="page-wrap" style={{ maxWidth: 520 }}>
          <button className="back-btn" onClick={() => setSelected(null)}>← Back to Chefs</button>

          <div className="profile-hero" style={{ marginTop: "1.5rem" }}>
            <div className="profile-av">
              {avatarSrc
                ? <img src={avatarSrc} alt={selected.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                : "👨‍🍳"}
            </div>
            <div className="profile-name">{selected.name}</div>
            <div className="profile-badge">Chef</div>
          </div>

          <div className="form-card" style={{ marginTop: "1.5rem" }}>
            <div className="form-card-title">About</div>
            <p style={{ color: "var(--text-muted)", lineHeight: 1.7, margin: 0 }}>
              {selected.bio || "This chef hasn't written a bio yet."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Chef grid ──────────────────────────────────────────────────────────────
  return (
    <div className="page">
      <div className="page-wrap">
        <h1 className="page-heading">Browse Chefs</h1>

        {loading ? (
          <div className="empty-state"><div className="ei">⏳</div><p>Loading chefs…</p></div>
        ) : error ? (
          <div className="empty-state"><div className="ei">⚠️</div><h3>{error}</h3></div>
        ) : chefs.length === 0 ? (
          <div className="empty-state"><div className="ei">👨‍🍳</div><h3>No chefs found</h3></div>
        ) : (
          <div className="chefs-grid">
            {chefs.map((c) => {
              const avatarSrc = getAvatarSrc(c);
              return (
                <div
                  key={c._id}
                  className="chef-card"
                  onClick={() => setSelected(c)}
                  style={{ cursor: "pointer" }}
                >
                  <div className="chef-av">
                    {avatarSrc
                      ? <img src={avatarSrc} alt={c.name} style={{ width: "100%", height: "100%", borderRadius: "50%", objectFit: "cover" }} />
                      : "👨‍🍳"}
                  </div>
                  <div className="chef-name">{c.name}</div>
                  <div className="chef-bio" style={{ WebkitLineClamp: 2, display: "-webkit-box", WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                    {c.bio || "No bio yet"}
                  </div>
                  <div style={{ marginTop: "0.8rem", fontSize: 13, color: "var(--color-primary, #e85d04)" }}>
                    View profile →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}