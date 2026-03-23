import { useEffect, useState } from "react";

/* ── Toast notification ── */
export function Toast({ msg, type = "info", onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2600);
    return () => clearTimeout(t);
  }, [onClose]);
  return <div className={`toast toast-${type}`}>{msg}</div>;
}

/* ── Star Rating ── */
export function StarRating({ value = 0, onChange, readonly = false }) {
  const [hov, setHov] = useState(0);
  return (
    <div className="star-row">
      {[1, 2, 3, 4, 5].map((s) => (
        <span
          key={s}
          className={`star ${(hov || value) >= s ? "lit" : ""}`}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHov(s)}
          onMouseLeave={() => !readonly && setHov(0)}
        >★</span>
      ))}
    </div>
  );
}

/* ── Recipe Card ── */
export function RecipeCard({ recipe, favourites = [], toggleFav, onClick }) {
  const isFav = favourites.includes(recipe.id);
  return (
    <div className="recipe-card" onClick={onClick}>
      {recipe.image
        ? <img src={recipe.image} alt={recipe.title} className="rc-img" loading="lazy" />
        : <div className="rc-img-ph">🍽</div>}
      <div className="rc-body">
        <div className="rc-cat">{recipe.category}</div>
        <div className="rc-title">{recipe.title}</div>
        <div className="rc-chef">by {recipe.chef}</div>
        <div className="rc-footer">
          <div className="rating-badge">⭐ {recipe.rating}</div>
          <button
            className="heart-btn"
            onClick={(e) => { e.stopPropagation(); toggleFav?.(recipe.id); }}
            aria-label={isFav ? "Remove favourite" : "Add favourite"}
          >
            {isFav ? "❤️" : "🤍"}
          </button>
        </div>
      </div>
    </div>
  );
}
