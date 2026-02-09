// src/pages/Signup.jsx

// I import useState so I can store and update data inside this component
// (form inputs and messages).
import React from "react";

import { useState } from "react";

import { signupCustomer } from "../api/api";

function Signup() {

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  function handleChange(e) {

    // I update only the field that changed
    // e.target.name = input name (name, email, etc.)
    // e.target.value = what the user typed
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
    }
    else {
      setMessage(response.message);
    }
  }

  return (
    <div>
      {/* Page title */}
      <h2>Customer Signup</h2>

      {/* The form calls handleSubmit when submitted */}
      <form onSubmit={handleSubmit}>

        {/* Name input */}
        <input
          type="text"
          name="name"
          placeholder="Name"
          onChange={handleChange}
        />

        {/* Email input */}
        <input
          type="email"
          name="email"
          placeholder="Email"
          onChange={handleChange}
        />

        {/* Password input */}
        <input
          type="password"
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />

        {/* Phone number input */}
        <input
          type="text"
          name="phone"
          placeholder="Phone"
          onChange={handleChange}
        />

        {/* Submit button */}
        <button type="submit">Sign Up</button>
      </form>

      {/* If there is a message, show it */}
      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
