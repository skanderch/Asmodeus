import React, { useState } from "react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    full_name: "",
    email: "",
  });

  const [message, setMessage] = useState(""); // For success or error feedback
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:5000/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("✅ Account created successfully! You can now log in.");
        setFormData({
          username: "",
          password_hash: "",
          full_name: "",
          email: "",
        });
      } else {
        setMessage(`❌ Error: ${data.message || "Registration failed."}`);
      }
    } catch (err) {
      console.error("Registration error:", err);
      setMessage("⚠️ Unable to connect to server.");
    }

    setLoading(false);
  };

  return (
    <div className="register-container">
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label>Username:</label>
        <input
          type="text"
          name="username"
          value={formData.username}
          onChange={handleChange}
          required
        />

        <label>Password:</label>
        <input
          type="password"
          name="password_hash"
          value={formData.password_hash}
          onChange={handleChange}
          required
        />

        <label>Full Name:</label>
        <input
          type="text"
          name="full_name"
          value={formData.full_name}
          onChange={handleChange}
        />

        <label>Email:</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Registering..." : "Register"}
        </button>

        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default Register;
