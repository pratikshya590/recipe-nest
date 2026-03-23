import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { StarRating, Toast } from "../components/Shared";
import { RECIPES } from "../services/mockData";

export default function RecipeDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { favourites, toggleFav } = useAuth();
  const [userRating, setUserRating] = useState(0);
  const [rated, setRated] = useState(false);
  const [toast, setToast] = useState(null);

  // TODO: GET /api/recipes/:id
  const recipe = RECIPES.find((r) => r.id === parseInt(id));

  if (!recipe) return (
    <div className="page">
      <div className="page-wrap">
        <button className="back-btn" onClick={() => navigate("/home")}>← Back</button>
        <p>Recipe not found.</p>
      </div>
    </div>
  );

  const isFav = favourites.includes(recipe.id);

  const handleRate = (val) => {
    setUserRating(val); setRated(true);
    setToast({ msg: `Rated ${val} stars! ⭐`, type: "success" });
    // TODO: POST /api/recipes/:id/rate  { rating: val }
  };

  const handleFav = () => {
    toggleFav(recipe.id);
    setToast({ msg: isFav ? "Removed from favourites" : "Added to favourites! ❤️", type: "success" });
    // TODO: POST /api/recipes/:id/favourite
  };

  return (
    <div className="page">
      <div className="detail-wrap">
        <button className="back-btn" onClick={() => navigate("/home")}>← Back to recipes</button>

        {/* Image + Info */}
        <div className="detail-grid">
          {recipe.image
            ? <img src={recipe.image} alt={recipe.title} className="detail-img" />
            : <div className="detail-img-ph">🍽</div>
          }
          <div className="detail-info">
            <div className="detail-cat">{recipe.category}</div>
            <h1 className="detail-title">{recipe.description || recipe.title}</h1>
            <div className="detail-meta">⏱ {recipe.time}</div>
            <div className="detail-chef">Recipe by <strong>{recipe.chef}</strong></div>

            <div>
              <StarRating value={rated ? userRating : Math.round(recipe.rating)} onChange={handleRate} />
              <div className="rating-note">
                {rated ? "Thanks for rating!" : `${recipe.rating} average rating`}
              </div>
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
              <div key={i} className="ing-item">
                <div className="ing-dot" />
                <span>{ing}</span>
              </div>
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
      </div>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
