import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { RecipeCard } from "../components/Shared";
import { getRecipes } from "../services/api";

const CATEGORIES = ["All", "Desserts", "Italian", "Newari", "Drinks"];
const IMAGE_BASE = "http://localhost:5000";

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { favourites, toggleFav } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const delay = setTimeout(() => fetchRecipes(), 300);
    return () => clearTimeout(delay);
  }, [category, search]);

  const fetchRecipes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getRecipes(category, search);
      if (res.success) {
        // Service returns { data: { recipes: [], pagination: {} } }
        const list = res.data?.recipes ?? res.data;
        setRecipes(Array.isArray(list) ? list : []);
      } else {
        setRecipes([]);
        setError(res.message || "Failed to load recipes");
      }
    } catch (err) {
      setRecipes([]);
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

  return (
    <div className="page">
      <div className="home-hero">
        <div className="home-hero-row">
          <div>
            <h1>What are you craving?</h1>
            <p>Find the perfect recipe for any occasion.</p>
          </div>
          <div className="search-box">
            <span className="search-icon">🔍</span>
            <input
              placeholder="Search recipes, ingredients…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="cat-bar">
        {CATEGORIES.map((c) => (
          <button key={c} className={`cat-pill ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      <div className="recipes-wrap">
        {loading ? (
          <div className="empty-state"><div className="ei">⏳</div><p>Loading recipes…</p></div>
        ) : error ? (
          <div className="empty-state">
            <div className="ei">⚠️</div><h3>{error}</h3>
            <button className="btn btn-primary" onClick={fetchRecipes}>Try Again</button>
          </div>
        ) : recipes.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🔍</div><h3>No recipes found</h3>
            <p>Try a different search or category.</p>
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
                  toggleFav={toggleFav}
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