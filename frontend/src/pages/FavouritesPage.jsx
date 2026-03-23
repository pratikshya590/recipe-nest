import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { RecipeCard } from "../components/Shared";
import { RECIPES } from "../services/mockData";

export default function FavouritesPage() {
  const { favourites, toggleFav } = useAuth();
  const navigate = useNavigate();

  // TODO: GET /api/users/me/favourites
  const favRecipes = RECIPES.filter((r) => favourites.includes(r.id));

  return (
    <div className="page">
      <div className="page-wrap">
        <h1 className="page-heading">My Favourites</h1>

        {favRecipes.length === 0 ? (
          <div className="empty-state">
            <div className="ei">🤍</div>
            <h3>No favourites yet</h3>
            <p>Browse recipes and tap the heart icon to save them here.</p>
            <button className="btn btn-primary" onClick={() => navigate("/home")}>
              Browse Recipes
            </button>
          </div>
        ) : (
          <div className="recipes-grid">
            {favRecipes.map((r) => (
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
