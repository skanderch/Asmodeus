import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaUserCircle } from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation(); // ✅ pour surveiller la route actuelle
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  // ✅ Recharger l'utilisateur à chaque changement de page
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]); // se déclenche à chaque changement d’URL

  const handleLogout = async () => {
    try {
      // Call logout endpoint to clear httpOnly cookie
      await fetch("http://localhost:5000/api/users/logout", {
        method: "POST",
        credentials: "include", // Include cookies
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      // Clear local storage and redirect regardless of API call result
      localStorage.removeItem("user");
      setUser(null);
      navigate("/login");
    }
  };

  const handlePostuler = () => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/login");
      return;
    }
    navigate("/offres");
  };

  return (
    <nav className="navbar">
      <div className="nav-left">
        <Link to="/">Asmodeus</Link>
        <Link to="/offres" className="nav-link">Offres d'emploi</Link>
      </div>

      <div className="nav-right">
        <button className="btn-postuler" onClick={handlePostuler}>Postuler</button>
        {user && (
          <>
            <Link to="/espace">Espace candidat</Link>
            {user.role_id === 1 && (
              <Link to="/admin">Admin Dashboard</Link>
            )}
          </>
        )}
        {!user ? (
          <>
            <Link to="/login">Connexion</Link>
          </>
        ) : (
          <div
            className="profile-menu"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            <FaUserCircle size={26} className="profile-icon" />
            {showDropdown && (
              <div className="dropdown">
                <p>{user.full_name || user.username}</p>
                <hr />
                <Link to="/profile">Profile</Link>
                <button onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
