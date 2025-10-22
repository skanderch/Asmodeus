import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./EspaceCandidat.css";

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
      if (parsed.role_id !== 4) {
        // Only candidates can access this page
        navigate("/");
        return;
      }
      setUser(parsed);
      if (storageKey) {
        const rawApps = localStorage.getItem(storageKey);
        const apps = rawApps ? JSON.parse(rawApps) : [];
        console.log('Storage key:', storageKey);
        console.log('Raw applications:', rawApps);
        console.log('Parsed applications:', apps);
        setApplications(apps);
      }
    } catch {
      navigate("/login");
    }
  }, [navigate, storageKey]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Mon Espace</h1>
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
            <div key={offer.job_id} className="application-item">
              <div>
                <h3 className="offer-title">{offer.titre}</h3>
                <div className="offer-meta">
                  <span>{offer.entreprise}</span>
                  <span>•</span>
                  <span>{offer.lieu}</span>
                </div>
              </div>
              <div className="application-actions">
                <button className="btn-secondary" onClick={() => navigate(`/offres/${offer.job_id}`)}>Détails</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Espacecandidat;


