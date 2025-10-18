import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./OfferDashboard.css";

function OfferDashboard() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [offerStats, setOfferStats] = useState({});
  const [myModules, setMyModules] = useState([]);
  const [offerForm, setOfferForm] = useState({
    titre: '',
    description: '',
    competences_requises: '',
    lieu: '',
    entreprise: '',
    salaire: '',
    langues: '',
    type_contrat: '',
    departement: '',
    experience: '',
    teletravail: false,
    date_fin: '',
    responsable: '',
    private_keywords: ''
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!user) {
      navigate("/login");
      return;
    }

    // Load current user modules for UI permissions first
    const loadUserModules = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me/modules', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const modules = (data.modules || []).map(m => m.module_name);
          setMyModules(modules);
          
          // Check if user has gestion_offres module or is admin
          const hasPermission = user.role_id === 1 || modules.includes('gestion_offres');
          if (!hasPermission) {
            navigate("/");
            return;
          }
          
          // Only fetch data if user has permission
          fetchOffers();
          fetchOfferStats();
        } else {
          // If can't load modules, check if user is admin
          if (user.role_id === 1) {
            fetchOffers();
            fetchOfferStats();
          } else {
            navigate("/");
          }
        }
      } catch (error) {
        console.error('Error loading user modules:', error);
        // If can't load modules, check if user is admin
        if (user.role_id === 1) {
          fetchOffers();
          fetchOfferStats();
        } else {
          navigate("/");
        }
      }
    };
    
    loadUserModules();
  }, [navigate]);

  const fetchOffers = async (isReload = false) => {
    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }
    
    try {
      const response = await fetch("http://localhost:5000/api/offers", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOffers(data.offers);
        if (isReload) {
          setMessage("Offers reloaded successfully");
          setTimeout(() => setMessage(""), 3000);
        }
      } else {
        setMessage("Failed to fetch offers");
      }
    } catch (error) {
      console.error("Error fetching offers:", error);
      setMessage("Error connecting to server");
    } finally {
      if (isReload) {
        setReloading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchOfferStats = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/offers/stats", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setOfferStats(data.stats);
      }
    } catch (error) {
      console.error("Error fetching offer stats:", error);
    }
  };

  const handleCreateOffer = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    
    try {
      const response = await fetch("http://localhost:5000/api/offers", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerForm),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setMessage(data.message || "Failed to create offer");
      } else {
        setMessage("Offer created successfully");
        setOfferForm({
          titre: '',
          description: '',
          competences_requises: '',
          lieu: '',
          entreprise: '',
          salaire: '',
          langues: '',
          type_contrat: '',
          departement: '',
          experience: '',
          teletravail: false,
          date_fin: '',
          responsable: '',
          private_keywords: ''
        });
        setShowCreateModal(false);
        fetchOffers();
        fetchOfferStats();
      }
    } catch (err) {
      console.error("Create offer error:", err);
      setMessage("Error connecting to server");
    } finally {
      setCreating(false);
    }
  };

  const handleEditOffer = async (offer) => {
    setOfferForm({
      job_id: offer.job_id,
      titre: offer.titre || '',
      description: offer.description || '',
      competences_requises: offer.competences_requises || '',
      lieu: offer.lieu || '',
      entreprise: offer.entreprise || '',
      salaire: offer.salaire || '',
      langues: offer.langues || '',
      type_contrat: offer.type_contrat || '',
      departement: offer.departement || '',
      experience: offer.experience || '',
      teletravail: offer.teletravail || false,
      date_fin: offer.date_fin ? offer.date_fin.split('T')[0] : '',
      responsable: offer.responsable || '',
      statut: offer.statut || 'Brouillon',
      private_keywords: offer.private_keywords || ''
    });
    setShowEditModal(true);
  };

  const handleSubmitEditOffer = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/offers/${offerForm.job_id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(offerForm),
      });
      
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to update offer");
      } else {
        setMessage("Offer updated successfully");
        setShowEditModal(false);
        fetchOffers();
        fetchOfferStats();
      }
    } catch (err) {
      console.error("Update offer error:", err);
      setMessage("Error connecting to server");
    }
  };

  const handleDeleteOffer = async (offer) => {
    const ok = window.confirm(`Delete offer "${offer.titre}"? This cannot be undone.`);
    if (!ok) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/offers/${offer.job_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "Failed to delete offer");
      } else {
        setMessage("Offer deleted successfully");
        fetchOffers();
        fetchOfferStats();
      }
    } catch (err) {
      console.error("Delete offer error:", err);
      setMessage("Error connecting to server");
    }
  };

  const getOfferStatusColor = (status) => {
    switch (status) {
      case "Publié": return "status-active";
      case "Brouillon": return "status-inactive";
      case "Fermé": return "status-suspended";
      default: return "status-unknown";
    }
  };

  // Get current user info
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentTime = new Date();
  const timeOfDay = currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 18 ? "afternoon" : "evening";

  if (loading) {
    return <div className="offer-dashboard-container">Loading...</div>;
  }

  return (
    <div className="offer-dashboard-container">
      <div className="dashboard-header">
        <h1>Offer Management Dashboard</h1>
      </div>

      <div className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">
              Good {timeOfDay}, {currentUser.full_name || currentUser.username || 'Manager'}! 💼
            </h2>
            <p className="welcome-message">
              Welcome to the Offer Management dashboard. Here you can create, edit, and manage job offers 
              that will be displayed to candidates for applications.
            </p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span className="stat-label">Total Offers:</span>
                <span className="stat-value">{offerStats.total_offers || 0}</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-label">Published:</span>
                <span className="stat-value">{offerStats.published_offers || 0}</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-label">Drafts:</span>
                <span className="stat-value">{offerStats.draft_offers || 0}</span>
              </div>
            </div>
          </div>
          <div className="welcome-icon">
            <div className="admin-icon">💼</div>
          </div>
        </div>
      </div>

      {message && (
        <div className="message-banner">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      <div className="offers-section">
        <div className="offers-stats-card">
          <h2>Offer Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card stat-card--primary">
              <h3>Total Offers</h3>
              <p className="stat-number">{offerStats.total_offers || 0}</p>
            </div>
            <div className="stat-card stat-card--success">
              <h3>Published</h3>
              <p className="stat-number">{offerStats.published_offers || 0}</p>
            </div>
            <div className="stat-card stat-card--warning">
              <h3>Drafts</h3>
              <p className="stat-number">{offerStats.draft_offers || 0}</p>
            </div>
            <div className="stat-card stat-card--purple">
              <h3>Remote Jobs</h3>
              <p className="stat-number">{offerStats.remote_offers || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="offers-section">
        <div className="offers-management-card">
          <h2>Offer Management</h2>
          <div className="offers-management-actions">
            {(JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('gestion_offres') ? (
              <button
                className="btn-add-user"
                onClick={() => setShowCreateModal(true)}
              >
                Add Offer
              </button>
            ) : null}
            <button
              className="btn-reload"
              onClick={() => fetchOffers(true)}
              title="Reload offers"
              disabled={reloading}
            >
              {reloading ? "Reloading..." : "Reload"}
            </button>
          </div>
          <div className="offers-table-container">
            <table className="offers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Type</th>
                  <th>Remote</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {offers.map((offer) => (
                  <tr key={offer.job_id}>
                    <td>{offer.job_id}</td>
                    <td>{offer.titre}</td>
                    <td>{offer.entreprise}</td>
                    <td>{offer.lieu || "N/A"}</td>
                    <td>
                      <span className={`status-badge ${getOfferStatusColor(offer.statut)}`}>
                        {offer.statut}
                      </span>
                    </td>
                    <td>{offer.type_contrat || "N/A"}</td>
                    <td>{offer.teletravail ? "Yes" : "No"}</td>
                    <td>{new Date(offer.date_creation).toLocaleDateString()}</td>
                    <td>
                      <div className="action-buttons">
                        {(JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('gestion_offres') ? (
                          <>
                            <button 
                              onClick={() => handleEditOffer(offer)}
                              className="btn-secondary btn-sm"
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDeleteOffer(offer)}
                              className="btn-danger btn-sm"
                            >
                              Delete
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Create Offer Modal */}
      {showCreateModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Create Job Offer</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form className="create-form" onSubmit={handleCreateOffer}>
              <div className="form-section">
                <h4 className="form-section-title">Basic Information</h4>
                <input
                  type="text"
                  placeholder="Job Title"
                  value={offerForm.titre}
                  onChange={(e) => setOfferForm({ ...offerForm, titre: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Job Description"
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  rows="4"
                  required
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={offerForm.entreprise}
                  onChange={(e) => setOfferForm({ ...offerForm, entreprise: e.target.value })}
                  required
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Job Details</h4>
                <input
                  type="text"
                  placeholder="Location"
                  value={offerForm.lieu}
                  onChange={(e) => setOfferForm({ ...offerForm, lieu: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Salary"
                  value={offerForm.salaire}
                  onChange={(e) => setOfferForm({ ...offerForm, salaire: e.target.value })}
                />
                <select
                  value={offerForm.type_contrat}
                  onChange={(e) => setOfferForm({ ...offerForm, type_contrat: e.target.value })}
                >
                  <option value="">Contract Type</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Stage">Stage</option>
                </select>
                <input
                  type="text"
                  placeholder="Department"
                  value={offerForm.departement}
                  onChange={(e) => setOfferForm({ ...offerForm, departement: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Experience Required"
                  value={offerForm.experience}
                  onChange={(e) => setOfferForm({ ...offerForm, experience: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Responsible User ID (optional - leave empty if none)"
                  value={offerForm.responsable}
                  onChange={(e) => setOfferForm({ ...offerForm, responsable: e.target.value })}
                  min="1"
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Additional Information</h4>
                <textarea
                  placeholder="Required Skills"
                  value={offerForm.competences_requises}
                  onChange={(e) => setOfferForm({ ...offerForm, competences_requises: e.target.value })}
                  rows="3"
                />
                <input
                  type="text"
                  placeholder="Languages"
                  value={offerForm.langues}
                  onChange={(e) => setOfferForm({ ...offerForm, langues: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={offerForm.date_fin}
                  onChange={(e) => setOfferForm({ ...offerForm, date_fin: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Private Keywords (optional)"
                  value={offerForm.private_keywords}
                  onChange={(e) => setOfferForm({ ...offerForm, private_keywords: e.target.value })}
                />
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input
                    type="checkbox"
                    checked={offerForm.teletravail}
                    onChange={(e) => setOfferForm({ ...offerForm, teletravail: e.target.checked })}
                  />
                  Remote Work Available
                </label>
              </div>

              <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn-success" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Offer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Offer Modal */}
      {showEditModal && (
        <div className="modal-overlay" role="dialog" aria-modal="true">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Edit Job Offer</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form className="create-form" onSubmit={handleSubmitEditOffer}>
              <div className="form-section">
                <h4 className="form-section-title">Basic Information</h4>
                <input
                  type="text"
                  placeholder="Job Title"
                  value={offerForm.titre}
                  onChange={(e) => setOfferForm({ ...offerForm, titre: e.target.value })}
                  required
                />
                <textarea
                  placeholder="Job Description"
                  value={offerForm.description}
                  onChange={(e) => setOfferForm({ ...offerForm, description: e.target.value })}
                  rows="4"
                  required
                />
                <input
                  type="text"
                  placeholder="Company"
                  value={offerForm.entreprise}
                  onChange={(e) => setOfferForm({ ...offerForm, entreprise: e.target.value })}
                  required
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Job Details</h4>
                <input
                  type="text"
                  placeholder="Location"
                  value={offerForm.lieu}
                  onChange={(e) => setOfferForm({ ...offerForm, lieu: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Salary"
                  value={offerForm.salaire}
                  onChange={(e) => setOfferForm({ ...offerForm, salaire: e.target.value })}
                />
                <select
                  value={offerForm.type_contrat}
                  onChange={(e) => setOfferForm({ ...offerForm, type_contrat: e.target.value })}
                >
                  <option value="">Contract Type</option>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="Freelance">Freelance</option>
                  <option value="Stage">Stage</option>
                </select>
                <select
                  value={offerForm.statut}
                  onChange={(e) => setOfferForm({ ...offerForm, statut: e.target.value })}
                >
                  <option value="Brouillon">Draft</option>
                  <option value="Publié">Published</option>
                  <option value="Fermé">Closed</option>
                </select>
                <input
                  type="text"
                  placeholder="Department"
                  value={offerForm.departement}
                  onChange={(e) => setOfferForm({ ...offerForm, departement: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Experience Required"
                  value={offerForm.experience}
                  onChange={(e) => setOfferForm({ ...offerForm, experience: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Responsible User ID (optional - leave empty if none)"
                  value={offerForm.responsable}
                  onChange={(e) => setOfferForm({ ...offerForm, responsable: e.target.value })}
                  min="1"
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Additional Information</h4>
                <textarea
                  placeholder="Required Skills"
                  value={offerForm.competences_requises}
                  onChange={(e) => setOfferForm({ ...offerForm, competences_requises: e.target.value })}
                  rows="3"
                />
                <input
                  type="text"
                  placeholder="Languages"
                  value={offerForm.langues}
                  onChange={(e) => setOfferForm({ ...offerForm, langues: e.target.value })}
                />
                <input
                  type="date"
                  placeholder="End Date"
                  value={offerForm.date_fin}
                  onChange={(e) => setOfferForm({ ...offerForm, date_fin: e.target.value })}
                />
                <label style={{display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                  <input
                    type="checkbox"
                    checked={offerForm.teletravail}
                    onChange={(e) => setOfferForm({ ...offerForm, teletravail: e.target.checked })}
                  />
                  Remote Work Available
                </label>
              </div>

              <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-success" type="submit">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default OfferDashboard;
