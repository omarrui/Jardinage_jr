// Signup.jsx
// Allows a customer to create an account

import React, { useState } from "react";
import { signupCustomer } from "../api/api";

function Signup({ goToLogin, goHome }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
  
    const response = await signupCustomer(formData);
  
    if (response.error) {
      setMessage(response.error);
    } else {
      setMessage("Account created successfully. Redirecting to login...");
  
      setTimeout(() => {
        goToLogin();
      }, 1500);
    }
  }
  

  return (
    <div>
      <h2>Customer Signup</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} />

        <button type="submit">Sign Up</button>
      </form>

      <p>
        Already have an account?{" "}
        <button onClick={goToLogin}>Log in</button>
      </p>

      <p>
        Changed your mind?{" "}
        <button onClick={goHome}>Go Home</button>
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
