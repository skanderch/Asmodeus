import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Offres.css";

function Offres() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const isCandidate = user?.role_id === 4; // 4 = Candidat
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

  const handleApply = async (offerId) => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    if (!isCandidate) {
      setMessage("Seuls les candidats peuvent postuler à une offre.");
      return;
    }
    // Backend enforcement: only candidates can apply
    try {
      const response = await fetch("http://localhost:5000/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ offerId }),
      });
      if (response.status === 401) {
        navigate("/login");
        return;
      }
      if (response.status === 403) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message || "Seuls les candidats peuvent postuler.");
        return;
      }
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        setMessage(data.message || "Erreur lors de l'envoi de la candidature.");
        return;
      }
    } catch (e) {
      // Network or server error
      setMessage("Impossible de contacter le serveur. Réessayez plus tard.");
      return;
    }

    // persist application per-user in localStorage (client-side history)
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
      <p>
        Consultez nos opportunités. Vous devez être connecté pour postuler.
        {!isCandidate && (
          <span className="role-note"> — Seuls les candidats peuvent postuler.</span>
        )}
      </p>
      {message && <div className="role-warning">{message}</div>}
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
              <button
                className={`btn-primary ${!isCandidate ? "btn-disabled" : ""}`}
                onClick={() => handleApply(offer.id)}
                disabled={!isCandidate}
                title={!isCandidate ? "Seuls les candidats peuvent postuler" : "Postuler"}
              >
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


