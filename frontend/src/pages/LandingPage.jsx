import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-hero">
      <div className="hero-inner">
       
        <h1 className="hero-h1">
          Discover and Share <em>Amazing Recipes</em>
        </h1>
        <p className="hero-sub">
          Join thousands of food lovers and chefs. Explore curated recipes,
          save your favourites, and share your own culinary creations.
        </p>
        <div className="hero-btns">
          <Link to="/register" className="btn btn-primary">Register</Link>
          <Link to="/login"    className="btn btn-outline-white">Login</Link>
        </div>
      </div>
    </div>
  );
}
