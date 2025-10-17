import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

function Login() {
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    username: "",
    password_hash: "",
  });

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // Include cookies in the request
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        // ✅ Sauvegarde utilisateur en localStorage (token is now in httpOnly cookie)
        localStorage.setItem("user", JSON.stringify(data.user));

        setMessage(`✅ Welcome back, ${data.user.full_name || data.user.username}!`);

        // ✅ Redirect based on role to existing routes
        const destination = data.user.role_id === 1 ? "/admin" : "/espace";
        setTimeout(() => navigate(destination), 800);
      } else {
        setMessage(`❌ ${data.message || "Login failed."}`);
      }
    } catch (err) {
      console.error("Login error:", err);
      setMessage("⚠️ Unable to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>

      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={credentials.username}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password_hash"
          value={credentials.password_hash}
          onChange={handleChange}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </button>

        {message && <p className="message">{message}</p>}
      </form>

      <p className="redirect-text">
        Don't have an account? <Link to="/register">Register here</Link>
      </p>
      
      <p className="redirect-text">
        <Link to="/forgot-password">Forgot your password?</Link>
      </p>
    </div>
  );
}

export default Login;
