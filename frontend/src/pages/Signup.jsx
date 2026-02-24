// Signup.jsx
// Permet à un client de créer un compte

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
      setMessage("Compte créé avec succès. Redirection vers la connexion...");
  
      setTimeout(() => {
        goToLogin();
      }, 1500);
    }
  }
  

  return (
    <div>
      <h2>Inscription Client</h2>

      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Nom" onChange={handleChange} />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Mot de passe" onChange={handleChange} />
        <input type="text" name="phone" placeholder="Téléphone" onChange={handleChange} />

        <button type="submit">S'inscrire</button>
      </form>

      <p>
        Vous avez déjà un compte ?{" "}
        <button onClick={goToLogin}>Se connecter</button>
      </p>

      <p>
        Vous changez d'avis ?{" "}
        <button onClick={goHome}>Accueil</button>
      </p>

      {message && <p>{message}</p>}
    </div>
  );
}

export default Signup;
