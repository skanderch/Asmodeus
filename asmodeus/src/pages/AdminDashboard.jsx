import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newUser, setNewUser] = useState({
    username: "",
    email: "",
    full_name: "",
    password: "",
    role_id: 4,
    status: "active",
  });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!user || user.role_id !== 1) {
      navigate("/login");
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/users/all", {
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json"
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
      } else {
        setMessage("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error connecting to server");
    } finally {
      setLoading(false);
    }
  };

  const updateUserStatus = async (userId, newStatus) => {
    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: "PUT",
        credentials: "include", // Include cookies
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        setMessage("User status updated successfully");
        fetchUsers(); // Refresh the list
      } else {
        const data = await response.json();
        setMessage(data.message || "Failed to update user status");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setMessage("Error connecting to server");
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setCreating(true);
    setMessage("");
    try {
      const response = await fetch("http://localhost:5000/api/users", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: newUser.username,
          password: newUser.password,
          full_name: newUser.full_name,
          email: newUser.email,
          role_id: Number(newUser.role_id),
          status: newUser.status,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to create user");
      } else {
        setMessage("User created successfully");
        setNewUser({ username: "", email: "", full_name: "", password: "", role_id: 4, status: "active" });
        fetchUsers();
      }
    } catch (err) {
      console.error("Create user error:", err);
      setMessage("Error connecting to server");
    } finally {
      setCreating(false);
    }
  };

  // Improve modal UX: ESC to close and body scroll lock
  useEffect(() => {
    if (!showCreateModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setShowCreateModal(false);
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [showCreateModal]);

  const handleEditUser = async (user) => {
    const full_name = window.prompt("Full name", user.full_name || "");
    if (full_name === null) return;
    const email = window.prompt("Email", user.email || "");
    if (email === null) return;
    const roleStr = window.prompt("Role (1=Admin,2=RH,3=Recruteur,4=Candidat)", String(user.role_id));
    if (roleStr === null) return;
    const status = window.prompt("Status (active,inactive,suspended)", user.status || "active");
    if (status === null) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.user_id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, role_id: Number(roleStr), status }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to update user");
      } else {
        setMessage("User updated successfully");
        fetchUsers();
      }
    } catch (err) {
      console.error("Update user error:", err);
      setMessage("Error connecting to server");
    }
  };

  const handleDeleteUser = async (user) => {
    const ok = window.confirm(`Delete user ${user.username}? This cannot be undone.`);
    if (!ok) return;
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.user_id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(data.message || "Failed to delete user");
      } else {
        setMessage("User deleted successfully");
        fetchUsers();
      }
    } catch (err) {
      console.error("Delete user error:", err);
      setMessage("Error connecting to server");
    }
  };

  const getRoleName = (roleId) => {
    const roles = {
      1: "Admin",
      2: "HR Manager", 
      3: "Recruiter",
      4: "Candidate"
    };
    return roles[roleId] || "Unknown";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active": return "status-active";
      case "inactive": return "status-inactive";
      case "suspended": return "status-suspended";
      default: return "status-unknown";
    }
  };

  const formatLastLogin = (lastLogin) => {
    if (!lastLogin) return 'Never';
    
    const loginDate = new Date(lastLogin);
    const now = new Date();
    const diffInHours = Math.floor((now - loginDate) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    
    return loginDate.toLocaleDateString() + ' ' + loginDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };

  if (loading) {
    return <div className="admin-dashboard-container">Loading...</div>;
  }

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <button onClick={() => navigate("/espace")} className="btn-secondary">
          Back to Dashboard
        </button>
      </div>

      {message && (
        <div className="message-banner">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      <div className="users-section">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem'}}>
          <h2>User Management</h2>
          <button
            className="btn-success"
            onClick={() => setShowCreateModal(true)}
          >
            Add user
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="create-user-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowCreateModal(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="create-user-title">Create User</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>×</button>
            </div>
            <form className="create-form" onSubmit={handleCreateUser}>
              <div className="form-section">
                <h4 className="form-section-title">Informations de base</h4>
                <input
                  type="text"
                  placeholder="Nom d'utilisateur"
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  autoFocus
                  required
                />
                <input
                  type="email"
                  placeholder="E-mail"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Sécurité</h4>
                <input
                  type="password"
                  placeholder="Mot de passe"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  required
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Rôle et statut</h4>
                <select
                  value={newUser.role_id}
                  onChange={(e) => setNewUser({ ...newUser, role_id: e.target.value })}
                >
                  <option value={1}>Admin</option>
                  <option value={2}>RH</option>
                  <option value={3}>Recruteur</option>
                  <option value={4}>Candidat</option>
                </select>
                <select
                  value={newUser.status}
                  onChange={(e) => setNewUser({ ...newUser, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>

              <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button className="btn-success" type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Users</h3>
          <p className="stat-number">{users.length}</p>
        </div>
        <div className="stat-card">
          <h3>Active Users</h3>
          <p className="stat-number">{users.filter(u => u.status === 'active').length}</p>
        </div>
        <div className="stat-card">
          <h3>Admins</h3>
          <p className="stat-number">{users.filter(u => u.role_id === 1).length}</p>
        </div>
        <div className="stat-card">
          <h3>Candidates</h3>
          <p className="stat-number">{users.filter(u => u.role_id === 4).length}</p>
        </div>
      </div>

      <div className="users-section">
        <h2>User Management</h2>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.user_id}</td>
                  <td>{user.username}</td>
                  <td>{user.full_name || "N/A"}</td>
                  <td>{user.email}</td>
                  <td>{getRoleName(user.role_id)}</td>
                  <td>
                    <span className={`status-badge ${getStatusColor(user.status)}`}>
                      {user.status}
                    </span>
                  </td>
                  <td>{new Date(user.created_at).toLocaleDateString()}</td>
                  <td>{formatLastLogin(user.last_login)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEditUser(user)}
                        className="btn-secondary btn-sm"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user)}
                        className="btn-danger btn-sm"
                      >
                        Delete
                      </button>
                      {user.status === 'active' ? (
                        <button 
                          onClick={() => updateUserStatus(user.user_id, 'inactive')}
                          className="btn-warning btn-sm"
                        >
                          Deactivate
                        </button>
                      ) : (
                        <button 
                          onClick={() => updateUserStatus(user.user_id, 'active')}
                          className="btn-success btn-sm"
                        >
                          Activate
                        </button>
                      )}
                      {user.status !== 'suspended' && (
                        <button 
                          onClick={() => updateUserStatus(user.user_id, 'suspended')}
                          className="btn-danger btn-sm"
                        >
                          Suspend
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
