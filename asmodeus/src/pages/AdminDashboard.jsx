import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

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
                  <td>
                    <div className="action-buttons">
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
