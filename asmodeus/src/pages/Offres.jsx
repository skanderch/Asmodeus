import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./Offres.css";

function Offres() {
  const navigate = useNavigate();
  const offers = useMemo(
    () => [
      {
        id: 1,
        title: "Développeur Full-Stack",
        company: "Asmodeus",
        location: "Tunis, Remote",
        description: "React, Node.js, PostgreSQL, microservices.",
      },
      {
        id: 2,
        title: "Ingénieur DevOps",
        company: "Asmodeus",
        location: "Sousse",
        description: "CI/CD, Docker, Kubernetes, monitoring.",
      },
    ],
    []
  );

  const handleApply = (offerId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    // persist application per-user in localStorage
    try {
      const parsedUser = JSON.parse(storedUser);
      const key = `applications:${parsedUser.username || parsedUser.id || "anon"}`;
      const raw = localStorage.getItem(key);
      const existing = raw ? JSON.parse(raw) : [];
      const offer = offers.find((o) => o.id === offerId);
      const already = existing.some((e) => e.id === offerId);
      const next = already || !offer ? existing : [...existing, offer];
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore storage errors and still navigate
    }
    navigate("/espace");
  };

  return (
    <div className="offres-page">
      <h1>Offres d'emploi</h1>
      <p>Consultez nos opportunités. Vous devez être connecté pour postuler.</p>
      <div className="offers-grid">
        {offers.map((offer) => (
          <div key={offer.id} className="offer-card">
            <h3>{offer.title}</h3>
            <div className="offer-meta">
              <span>{offer.company}</span>
              <span>•</span>
              <span>{offer.location}</span>
            </div>
            <p className="offer-description">{offer.description}</p>
            <div className="offer-actions">
              <button className="btn-secondary" onClick={() => navigate(`/offres/${offer.id}`)}>
                Détails
              </button>
              <button className="btn-primary" onClick={() => handleApply(offer.id)}>
                Postuler
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Offres;


