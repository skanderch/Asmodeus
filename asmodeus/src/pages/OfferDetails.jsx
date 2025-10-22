import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./OfferDetails.css";

function OfferDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (id) {
      fetchOfferDetails();
    }
  }, [id]);

  const fetchOfferDetails = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/offers/public/${id}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Offer details API response:', data);
        console.log('Offer data:', data.offer);
        setOffer(data.offer);
      } else {
        console.log('API response not ok:', response.status, response.statusText);
        setMessage("Offre non trouvée");
      }
    } catch (error) {
      console.error("Error fetching offer details:", error);
      setMessage("Erreur de connexion au serveur");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="offer-details-container">
        <h1>Chargement...</h1>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="offer-details-container">
        <h1>Offre non trouvée</h1>
        <p>{message}</p>
        <button className="btn-primary" onClick={() => navigate("/offres")}>
          Retour aux offres
        </button>
      </div>
    );
  }

  return (
    <div className="offer-details-container">
      <div className="offer-details-header">
        <button className="btn-secondary" onClick={() => navigate("/offres")}>
          ← Retour aux offres
        </button>
        <h1>{offer.titre}</h1>
        <div className="offer-company">{offer.entreprise}</div>
      </div>

      <div className="offer-details-content">
        <div className="offer-info-grid">
          <div className="info-item">
            <strong>Lieu:</strong> {offer.lieu || "Non spécifié"}
          </div>
          <div className="info-item">
            <strong>Type de contrat:</strong> {offer.type_contrat || "Non spécifié"}
          </div>
          <div className="info-item">
            <strong>Salaire:</strong> {offer.salaire || "Non spécifié"}
          </div>
          <div className="info-item">
            <strong>Expérience requise:</strong> {offer.experience || "Non spécifié"}
          </div>
          <div className="info-item">
            <strong>Département:</strong> {offer.departement || "Non spécifié"}
          </div>
          <div className="info-item">
            <strong>Télétravail:</strong> {offer.teletravail ? "Oui" : "Non"}
          </div>
          {offer.langues && (
            <div className="info-item">
              <strong>Langues:</strong> {offer.langues}
            </div>
          )}
          {offer.date_fin && (
            <div className="info-item">
              <strong>Date de fin:</strong> {new Date(offer.date_fin).toLocaleDateString()}
            </div>
          )}
        </div>

        <div className="offer-description">
          <h3>Description du poste</h3>
          <p>{offer.description}</p>
        </div>

        {offer.competences_requises && (
          <div className="offer-skills">
            <h3>Compétences requises</h3>
            <p>{offer.competences_requises}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default OfferDetails;
