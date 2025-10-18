import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [reloading, setReloading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [myModules, setMyModules] = useState([]);
  const [allModules, setAllModules] = useState([]);
  const [editSelectedModuleIds, setEditSelectedModuleIds] = useState([]);
  const [editForm, setEditForm] = useState({
    user_id: null,
    full_name: "",
    email: "",
    role_id: 4,
    status: "active",
  });
  
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
    // Load current admin modules for UI permissions
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/me/modules', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setMyModules((data.modules || []).map(m => m.module_name));
        }
      } catch {}
    })();
    // Preload all modules for assignment UI
    (async () => {
      try {
        const res = await fetch('http://localhost:5000/api/users/modules', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          setAllModules(data.modules || []);
        }
      } catch {}
    })();
    
  }, [navigate]);

  const fetchUsers = async (isReload = false) => {
    if (isReload) {
      setReloading(true);
    } else {
      setLoading(true);
    }
    
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
        if (isReload) {
          setMessage("Users reloaded successfully");
          setTimeout(() => setMessage(""), 3000); // Clear message after 3 seconds
        }
      } else {
        setMessage("Failed to fetch users");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      setMessage("Error connecting to server");
    } finally {
      if (isReload) {
        setReloading(false);
      } else {
        setLoading(false);
      }
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
    setEditForm({
      user_id: user.user_id,
      full_name: user.full_name || "",
      email: user.email || "",
      role_id: Number(user.role_id) || 4,
      status: user.status || "active",
    });
    // Fetch effective modules for selected user
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.user_id}/modules`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setEditSelectedModuleIds((data.modules || []).map(m => m.module_id));
      } else {
        setEditSelectedModuleIds([]);
      }
    } catch {
      setEditSelectedModuleIds([]);
    }
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:5000/api/users/${editForm.user_id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: editForm.full_name,
          email: editForm.email,
          role_id: Number(editForm.role_id),
          status: editForm.status,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.message || "Failed to update user");
      } else {
        // If role changed to Candidate (4), automatically add espace_candidat module
        let updatedModuleIds = [...editSelectedModuleIds];
        if (Number(editForm.role_id) === 4) {
          // Find espace_candidat module ID
          const espaceCandidatModule = allModules.find(m => m.module_name === 'espace_candidat');
          if (espaceCandidatModule && !updatedModuleIds.includes(espaceCandidatModule.module_id)) {
            updatedModuleIds.push(espaceCandidatModule.module_id);
          }
        }

        // Update direct modules assignment
        try {
          const res2 = await fetch(`http://localhost:5000/api/users/${editForm.user_id}/modules`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ moduleIds: updatedModuleIds })
          });
          const data2 = await res2.json().catch(() => ({}));
          if (!res2.ok) {
            setMessage(data2.message || 'Failed to update user modules');
          } else {
            setMessage("User updated successfully");
            setShowEditModal(false);
            fetchUsers();
          }
        } catch {
          setMessage('Error updating user modules');
        }
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
    return loginDate.toLocaleDateString() + ' ' + loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return <div className="admin-dashboard-container">Loading...</div>;
  }

  // Get current admin user info
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const currentTime = new Date();
  const timeOfDay = currentTime.getHours() < 12 ? "morning" : currentTime.getHours() < 18 ? "afternoon" : "evening";

  return (
    <div className="admin-dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </div>

      <div className="welcome-section">
        <div className="welcome-card">
          <div className="welcome-content">
            <h2 className="welcome-title">
              Good {timeOfDay}, {currentUser.full_name || currentUser.username || 'Administrator'}! 👋
            </h2>
            <p className="welcome-message">
              Welcome to the Asmodeus administration space. Here you can manage users, 
              monitor system activity, and oversee all aspects of the platform.
            </p>
            <div className="welcome-stats">
              <div className="welcome-stat">
                <span className="stat-label">Total Users:</span>
                <span className="stat-value">{users.length}</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-label">Active Users:</span>
                <span className="stat-value">{users.filter(u => u.status === 'active').length}</span>
              </div>
              <div className="welcome-stat">
                <span className="stat-label">Candidates:</span>
                <span className="stat-value">{users.filter(u => u.role_id === 4).length}</span>
              </div>
            </div>
          </div>
          <div className="welcome-icon">
            <div className="admin-icon">👨‍💼</div>
          </div>
        </div>
      </div>

      {message && (
        <div className="message-banner">
          {message}
          <button onClick={() => setMessage("")} className="close-btn">×</button>
        </div>
      )}

      <div className="users-section">
        <div className="users-stats-card">
          <h2>User Stats</h2>
          <div className="stats-grid">
            <div className="stat-card stat-card--primary">
              <h3>Total Users</h3>
              <p className="stat-number">{users.length}</p>
            </div>
            <div className="stat-card stat-card--success">
              <h3>Active Users</h3>
              <p className="stat-number">{users.filter(u => u.status === 'active').length}</p>
            </div>
            <div className="stat-card stat-card--purple">
              <h3>Admins</h3>
              <p className="stat-number">{users.filter(u => u.role_id === 1).length}</p>
            </div>
            <div className="stat-card stat-card--teal">
              <h3>HR Managers</h3>
              <p className="stat-number">{users.filter(u => u.role_id === 2).length}</p>
            </div>
            <div className="stat-card stat-card--orange">
              <h3>Recruiters</h3>
              <p className="stat-number">{users.filter(u => u.role_id === 3).length}</p>
            </div>
            <div className="stat-card stat-card--indigo">
              <h3>Candidates</h3>
              <p className="stat-number">{users.filter(u => u.role_id === 4).length}</p>
            </div>
          </div>
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

      {showEditModal && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-user-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowEditModal(false);
          }}
        >
          <div className="modal-card">
            <div className="modal-header">
              <h3 id="edit-user-title">Edit User</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
            </div>
            <form className="create-form" onSubmit={handleSubmitEdit}>
              <div className="form-section">
                <h4 className="form-section-title">Informations de base</h4>
                <input
                  type="email"
                  placeholder="E-mail"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Nom complet"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                />
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Rôle et statut</h4>
                <select
                  value={editForm.role_id}
                  onChange={(e) => {
                    const newRoleId = Number(e.target.value);
                    setEditForm({ ...editForm, role_id: newRoleId });
                    
                    // If role changed to Candidate (4), automatically add espace_candidat module
                    if (newRoleId === 4) {
                      const espaceCandidatModule = allModules.find(m => m.module_name === 'espace_candidat');
                      if (espaceCandidatModule && !editSelectedModuleIds.includes(espaceCandidatModule.module_id)) {
                        setEditSelectedModuleIds([...editSelectedModuleIds, espaceCandidatModule.module_id]);
                      }
                    }
                  }}
                >
                  <option value={1}>Admin</option>
                  <option value={2}>RH</option>
                  <option value={3}>Recruteur</option>
                  <option value={4}>Candidat</option>
                </select>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="active">active</option>
                  <option value="inactive">inactive</option>
                  <option value="suspended">suspended</option>
                </select>
              </div>

              <div className="form-section">
                <h4 className="form-section-title">Modules</h4>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(160px, 1fr))', gap:'0.5rem'}}>
                  {allModules.map((m) => {
                    const checked = editSelectedModuleIds.includes(m.module_id);
                    return (
                      <label key={m.module_id} style={{display:'flex', alignItems:'center', gap:'0.5rem', background:'#f9fbff', border:'1px solid #e1e5ee', padding:'0.4rem 0.6rem', borderRadius:'6px'}}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setEditSelectedModuleIds([...editSelectedModuleIds, m.module_id]);
                            } else {
                              setEditSelectedModuleIds(editSelectedModuleIds.filter(id => id !== m.module_id));
                            }
                          }}
                        />
                        <span>{m.module_name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div style={{display:'flex', gap:'0.5rem', justifyContent:'flex-end'}}>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button className="btn-success" type="submit">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="users-section">
        <div className="users-management-card">
          <h2>User Management</h2>
          <div className="users-management-actions">
            {(JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('Users:Write') ? (
              <button
                className="btn-add-user"
                onClick={() => setShowCreateModal(true)}
              >
                Add user
              </button>
            ) : null}
            <button
              className="btn-reload"
              onClick={() => fetchUsers(true)}
              title="Reload users"
              disabled={reloading}
            >
              {reloading ? "Reloading..." : "Reload"}
            </button>
          </div>
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
                <th>Modules</th>
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
                    <div style={{display:'flex', flexWrap:'wrap', gap:'0.25rem'}}>
                      {String(user.modules || '').split(',').filter(Boolean).map((m, idx) => (
                        <span key={idx} className="module-badge">{m.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      {(JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('Users:Write') ? (
                        <button 
                          onClick={() => handleEditUser(user)}
                          className="btn-secondary btn-sm"
                        >
                          Edit
                        </button>
                      ) : null}
                      {(JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('Users:Delete') ? (
                        <button 
                          onClick={() => handleDeleteUser(user)}
                          className="btn-danger btn-sm"
                        >
                          Delete
                        </button>
                      ) : null}
                      {(JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('Users:Write') ? (
                        user.status === 'active' ? (
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
                        )
                      ) : null}
                      {((JSON.parse(localStorage.getItem('user')||'{}').role_id === 1) || myModules.includes('Users:Write')) && user.status !== 'suspended' && (
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
    </div>
  );
}

export default AdminDashboard;