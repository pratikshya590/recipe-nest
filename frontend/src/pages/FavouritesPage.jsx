import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { RecipeCard } from "../components/Shared";
import { getFavourites } from "../services/api";

const IMAGE_BASE = "http://localhost:5000";

export default function FavouritesPage() {
  const { favourites, toggleFav } = useAuth();
  const navigate = useNavigate();
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFavourites();
  }, []);

  const fetchFavourites = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFavourites();
      if (res.success) {
        // Service returns { data: { recipes: [] } }
        const list = res.data?.recipes ?? res.data;
        setRecipes(Array.isArray(list) ? list : []);
      } else {
        setError(res.message || "Failed to load favourites");
      }
    } catch (err) {
      setError("Could not connect to server");
    } finally {
      setLoading(false);
    }
  };

  const normalize = (r) => ({
    ...r,
    id: r._id,
    chef: r.chef?.name || r.chef || "Unknown Chef",
    image: r.image
      ? r.image.startsWith("http") ? r.image : `${IMAGE_BASE}${r.image}`
      : null,
  });

  const handleToggle = async (id) => {
    await toggleFav(id);
    setRecipes((prev) => prev.filter((r) => r._id !== id));
  };

  return (
    <div className="page">
      <div className="page-wrap">
        <h1 className="page-heading">My Favourites</h1>

        {loading ? (
          <div className="empty-state"><div className="ei">⏳</div><p>Loading…</p></div>
        ) : error ? (
          <div className="empty-state"><div className="ei">⚠️</div><h3>{error}</h3></div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🤍</div>
            <h3>No favourites yet</h3>
            <p>Browse recipes and tap the heart icon to save them here.</p>
            <button className="btn btn-primary" onClick={() => navigate("/home")}>Browse Recipes</button>
          </div>
        ) : (
          <div className="recipes-grid">
            {recipes.map((r) => {
              const recipe = normalize(r);
              return (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  favourites={favourites}
                  toggleFav={handleToggle}
                  onClick={() => navigate(`/recipe/${recipe.id}`)}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}