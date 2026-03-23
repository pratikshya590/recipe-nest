import { CHEFS } from "../services/mockData";

export default function ChefsPage() {
  // TODO: GET /api/chefs
  return (
    <div className="page">
      <div className="page-wrap">
        <h1 className="page-heading">Browse Chefs</h1>
        <div className="chefs-grid">
          {CHEFS.map((c) => (
            <div key={c.id} className="chef-card">
              <div className="chef-av">{c.avatar}</div>
              <div className="chef-name">{c.name}</div>
              <div className="chef-count">{c.recipes} recipes</div>
              <div className="chef-bio">{c.bio}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
