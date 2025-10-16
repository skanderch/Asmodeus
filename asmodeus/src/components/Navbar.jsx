import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { 
  FaUserCircle, 
  FaBars, 
  FaTimes, 
  FaHome, 
  FaBriefcase, 
  FaUser, 
  FaCog, 
  FaSignOutAlt,
  FaChevronDown
} from "react-icons/fa";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Recharger l'utilisateur à chaque changement de page
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    setUser(storedUser ? JSON.parse(storedUser) : null);
  }, [location]); // se déclenche à chaque changement d'URL

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.profile-menu')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

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


  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const toggleProfileDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const closeProfileDropdown = () => {
    setShowDropdown(false);
  };

  const getRoleDisplayName = (roleId) => {
    const roles = {
      1: "Admin",
      2: "HR Manager",
      3: "Recruiter", 
      4: "Candidate"
    };
    return roles[roleId] || "User";
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Brand */}
        <div className="navbar-brand">
          <Link to="/" className="brand-link" onClick={closeMobileMenu}>
            <span className="brand-text">Asmodeus</span>
            <span className="brand-subtitle">Recruitment Platform</span>
          </Link>
        </div>


        {/* Desktop Navigation */}
        <div className="navbar-nav desktop-nav">
          <Link to="/offres" className="nav-link">
            <FaBriefcase className="nav-icon" />
            Jobs
          </Link>
          
          {user ? (
            <>
              {user.role_id === 4 && (
                <Link to="/espace" className="nav-link">
                  <FaUser className="nav-icon" />
                  Mon Espace
                </Link>
              )}
              
              {user.role_id === 1 && (
                <Link to="/admin" className="nav-link admin-link">
                  <FaCog className="nav-icon" />
                  Admin
                </Link>
              )}
              
              <button className="btn-postuler" onClick={handlePostuler}>
                Apply Now
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-link">
              <FaUser className="nav-icon" />
              Login
            </Link>
          )}
        </div>

        {/* User Profile Dropdown */}
        {user && (
          <div className="profile-menu">
            <div className="profile-trigger" onClick={toggleProfileDropdown}>
              <FaUserCircle className="profile-avatar" />
              <div className="profile-info">
                <span className="profile-name">{user.full_name || user.username}</span>
                <span className="profile-role">{getRoleDisplayName(user.role_id)}</span>
              </div>
              <FaChevronDown className={`dropdown-arrow ${showDropdown ? 'rotated' : ''}`} />
            </div>
            
            {showDropdown && (
              <div className="dropdown">
                <div className="dropdown-header">
                  <div className="dropdown-user-info">
                    <FaUserCircle className="dropdown-avatar" />
                    <div>
                      <p className="dropdown-name">{user.full_name || user.username}</p>
                      <p className="dropdown-email">{user.email}</p>
                      <span className="dropdown-role">{getRoleDisplayName(user.role_id)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="dropdown-divider"></div>
                
                <div className="dropdown-menu">
                  {user.role_id === 4 && (
                    <Link to="/espace" className="dropdown-item" onClick={closeProfileDropdown}>
                      <FaUser className="dropdown-icon" />
                      Mon Espace
                    </Link>
                  )}
                  
                  <Link to="/profile" className="dropdown-item" onClick={closeProfileDropdown}>
                    <FaUserCircle className="dropdown-icon" />
                    Profile Settings
                  </Link>
                  
                  {user.role_id === 1 && (
                    <Link to="/admin" className="dropdown-item" onClick={closeProfileDropdown}>
                      <FaCog className="dropdown-icon" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <div className="dropdown-divider"></div>
                  
                  <button onClick={() => { handleLogout(); closeProfileDropdown(); }} className="dropdown-item logout-item">
                    <FaSignOutAlt className="dropdown-icon" />
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
        >
          {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="mobile-nav">
          <div className="mobile-nav-content">
            <div className="mobile-nav-links">
              <Link to="/" className="mobile-nav-link" onClick={closeMobileMenu}>
                <FaHome className="mobile-nav-icon" />
                Home
              </Link>
              
              <Link to="/offres" className="mobile-nav-link" onClick={closeMobileMenu}>
                <FaBriefcase className="mobile-nav-icon" />
                Jobs
              </Link>
              
              {user ? (
                <>
                  {user.role_id === 4 && (
                    <Link to="/espace" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <FaUser className="mobile-nav-icon" />
                      Mon Espace
                    </Link>
                  )}
                  
                  {user.role_id === 1 && (
                    <Link to="/admin" className="mobile-nav-link" onClick={closeMobileMenu}>
                      <FaCog className="mobile-nav-icon" />
                      Admin Panel
                    </Link>
                  )}
                  
                  <button className="mobile-btn-postuler" onClick={() => { handlePostuler(); closeMobileMenu(); }}>
                    Apply Now
                  </button>
                  
                  <div className="mobile-user-info">
                    <FaUserCircle className="mobile-user-avatar" />
                    <div>
                      <p className="mobile-user-name">{user.full_name || user.username}</p>
                      <p className="mobile-user-role">{getRoleDisplayName(user.role_id)}</p>
                    </div>
                  </div>
                  
                  <button onClick={handleLogout} className="mobile-logout-btn">
                    <FaSignOutAlt className="mobile-logout-icon" />
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" className="mobile-nav-link" onClick={closeMobileMenu}>
                  <FaUser className="mobile-nav-icon" />
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
