import React from "react";
import "./Home.css";
import background from "../gallery/background.jpg";

function Home() {
  return (
    <div className="home-container">

      {/* ================= HERO SECTION ================= */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${background})` }}
        >        <div className="hero-overlay">
          <h1>Jardinage & Entretien Professionnel</h1>
          <p>
            Spécialiste de l’entretien de jardin au Muy et alentours.
            Création, taille, élagage et entretien sur mesure.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn">Demander un devis</button>
            <button className="secondary-btn">Nos services</button>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="services-section">
        <h2>Nos Services</h2>

        <div className="services-grid">

          <div className="service-card">
            <div className="service-img-placeholder">Photo Service</div>
            <h3>Entretien complet</h3>
            <p>Taille, nettoyage et entretien régulier.</p>
          </div>

          <div className="service-card">
            <div className="service-img-placeholder">Photo Service</div>
            <h3>Élagage</h3>
            <p>Élagage professionnel jusqu’à 5 mètres.</p>
          </div>

          <div className="service-card">
            <div className="service-img-placeholder">Photo Service</div>
            <h3>Création paysagère</h3>
            <p>Aménagement personnalisé de votre extérieur.</p>
          </div>

          <div className="service-card">
            <div className="service-img-placeholder">Photo Service</div>
            <h3>Débroussaillage</h3>
            <p>Nettoyage et mise en sécurité de terrain.</p>
          </div>

        </div>
      </section>

      {/* ================= ABOUT SECTION ================= */}
      <section className="about-section">
        <div className="about-text">
          <h2>Votre jardin entre de bonnes mains</h2>
          <p>
            Avec une approche personnalisée et un savoir-faire reconnu,
            nous garantissons des interventions rapides et adaptées
            à vos besoins.
          </p>
          <button className="primary-btn">Contactez-nous</button>
        </div>

        <div className="about-image-placeholder">
          Photo Avant / Après
        </div>
      </section>

        {/* ================= MAP SECTION ================= */}
        <section className="map-section">
        <h2>Zone d’intervention</h2>

        <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2893.605991073233!2d6.560979315576652!3d43.4606318791274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9f5f9c6bbde83%3A0x7915df94a91f0bce!2sLe%20Muy%2C%20France!5e0!3m2!1fr!2sfr!4v1709019012345"
            width="100%"
            height="450"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
        />
        </section>

    </div>
  );
}

export default Home;