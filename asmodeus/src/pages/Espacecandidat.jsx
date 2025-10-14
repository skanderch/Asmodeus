import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EspaceCanddiat.css";

function Espacecandidat() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);

  const storageKey = useMemo(() => {
    const stored = localStorage.getItem("user");
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored);
      return `applications:${parsed.username || parsed.id || "anon"}`;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    try {
      const parsed = JSON.parse(storedUser);
      setUser(parsed);
      if (storageKey) {
        const rawApps = localStorage.getItem(storageKey);
        setApplications(rawApps ? JSON.parse(rawApps) : []);
      }
    } catch {
      navigate("/login");
    }
  }, [navigate, storageKey]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Espace candidat</h1>
      <p className="dashboard-welcome">Bienvenue {user?.full_name || user?.username}</p>

      <h2 className="section-title">Vos candidatures</h2>
      {applications.length === 0 ? (
        <div className="empty-state">
          <p>Aucune candidature pour le moment.</p>
          <button className="btn-primary" onClick={() => navigate("/offres")}>Voir les offres</button>
        </div>
      ) : (
        <div className="applications-list">
          {applications.map((offer) => (
            <div key={offer.id} className="application-item">
              <div>
                <h3 className="offer-title">{offer.title}</h3>
                <div className="offer-meta">
                  <span>{offer.company}</span>
                  <span>•</span>
                  <span>{offer.location}</span>
                </div>
              </div>
              <div className="application-actions">
                <button className="btn-secondary" onClick={() => navigate(`/offres/${offer.id}`)}>Détails</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Espacecandidat;


