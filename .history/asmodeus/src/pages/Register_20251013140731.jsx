import React, { useState } from "react";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    password_hash: "",
    full_name: "",
    email: "",
  });

  return (
    <div>
      <h2>Register Page</h2>
    </div>
  );
}

export default Register;
