import React, { useState } from "react";
import "./Register.css";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    full_name: "",
    email: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Data sent to backend
    const newUser = {
      ...formData,
      role_id: "viewer",   // Default role
      status: "active",
      module_id: null,
    };

    console.log("New user registration:", newUser);

    // Later we'll replace this with a real POST request
    // const res = await fetch("http://localhost:5000/api/users/register", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify(newUser)
    // });
    // const data = await res.json();
    // console.log("Registration response:", data);
  };

  return (
    <div className="register-container">
      <h2>Register New Account</h2>
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

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
