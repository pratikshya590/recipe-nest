import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { RecipeCard } from "../components/Shared";
import { RECIPES, CATEGORIES } from "../services/mockData";

export default function HomePage() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const { favourites, toggleFav } = useAuth();
  const navigate = useNavigate();

  // TODO: GET /api/recipes?category=&search=
  const filtered = RECIPES.filter((r) => {
    const matchCat = category === "All" || r.category === category;
    const q = search.toLowerCase();
    return matchCat && (
      r.title.toLowerCase().includes(q) ||
      r.category.toLowerCase().includes(q) ||
      r.chef.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page">
      {/* Hero */}
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

      {/* Category pills */}
      <div className="cat-bar">
        {CATEGORIES.map((c) => (
          <button key={c} className={`cat-pill ${category === c ? "on" : ""}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
      </div>

      {/* Recipe grid */}
      <div className="recipes-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🔍</div>
            <h3>No recipes found</h3>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="recipes-grid">
            {filtered.map((r) => (
              <RecipeCard
                key={r.id}
                recipe={r}
                favourites={favourites}
                toggleFav={toggleFav}
                onClick={() => navigate(`/recipe/${r.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
