import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Offres.css";

function Offres() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const isCandidate = user?.role_id === 4; // 4 = Candidat

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/offers/public", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Fetched offers:', data.offers);
        // Server already returns only published offers
        setOffers(data.offers);
      } else {
        console.error("Failed to fetch offers");
        setMessage("Erreur lors du chargement des offres");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setMessage("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

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
        body: JSON.stringify({ job_id: offerId }),
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
      const offer = offers.find((o) => o.job_id === offerId);
      const already = existing.some((e) => e.job_id === offerId);
      const next = already || !offer ? existing : [...existing, offer];
      localStorage.setItem(key, JSON.stringify(next));
    } catch {
      // ignore storage errors and still navigate
    }
    navigate("/espace");
  };

  if (loading) {
    return (
      <div className="offres-page">
        <h1>Offres d'emploi</h1>
        <p>Chargement des offres...</p>
      </div>
    );
  }

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
      
      {offers.length === 0 ? (
        <div className="no-offers">
          <p>Aucune offre d'emploi disponible pour le moment.</p>
        </div>
      ) : (
        <div className="offers-grid">
          {offers.map((offer) => (
            <div key={offer.job_id} className="offer-card">
              <h3>{offer.titre}</h3>
              <div className="offer-meta">
                <span>{offer.entreprise}</span>
                <span>•</span>
                <span>{offer.lieu || "Non spécifié"}</span>
                {offer.teletravail && <span>•</span>}
                {offer.teletravail && <span className="remote-badge">Remote</span>}
              </div>
              <p className="offer-description">
                {offer.description ? 
                  (offer.description.length > 150 ? 
                    offer.description.substring(0, 150) + "..." : 
                    offer.description
                  ) : 
                  "Aucune description disponible."
                }
              </p>
              {offer.salaire && (
                <div className="offer-salary">
                  <strong>Salaire:</strong> {offer.salaire}
                </div>
              )}
              {offer.type_contrat && (
                <div className="offer-contract">
                  <strong>Type de contrat:</strong> {offer.type_contrat}
                </div>
              )}
              <div className="offer-actions">
                <button className="btn-secondary" onClick={() => navigate(`/offres/${offer.job_id}`)}>
                  Détails
                </button>
                <button
                  className={`btn-primary ${!isCandidate ? "btn-disabled" : ""}`}
                  onClick={() => handleApply(offer.job_id)}
                  disabled={!isCandidate}
                  title={!isCandidate ? "Seuls les candidats peuvent postuler" : "Postuler"}
                >
                  Postuler
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Offres;


