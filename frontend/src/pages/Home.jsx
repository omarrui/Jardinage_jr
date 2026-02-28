import React, { useEffect, useState, useRef } from "react";
import "./Home.css";
import background from "../gallery/background.jpg";
import beforeImage from "../gallery/before.jpeg";
import afterImage from "../gallery/after.jpeg";
import debroussaillageImg from "../gallery/Debroussaillage.webp";
import tailleBuissonImg from "../gallery/taildebouisson.webp";
import entretienImg from "../gallery/entretien.webp";
import decoupeImg from "../gallery/decoupapprofondie.webp";
import elagageImg from "../gallery/elagage.webp";
import votreJardinImg from "../gallery/votrejardain.jpg";
import instaLogo from "../gallery/insta.webp";
import jardiniersSapLogo from "../gallery/jardiniersap.png";

function Home({ goToBooking }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div className="home-container">

      {/* ================= HERO SECTION ================= */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="hero-overlay">
          <h1>
            Jardinier au Muy (83) – Entretien, Élagage & Aménagement Paysager
          </h1>
          <p>
            JR Jardinage est votre jardinier professionnel au Muy dans le Var (83).
            Nous réalisons l'entretien de jardin, l'élagage d'arbres,
            le débroussaillage et l'aménagement paysager sur mesure.
            Intervention rapide et devis gratuit.
          </p>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={goToBooking}>
              Demander un devis
            </button>
            <button
              className="secondary-btn"
              onClick={() => {
                document.querySelector(".services-section")?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Nos services
            </button>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="services-section">
        <div className="services-grid">
          <div className="service-card">
            <img src={debroussaillageImg} alt="Débroussaillage et nettoyage" className="service-img" />
            <h3>Débroussaillage et nettoyage</h3>
            <p>Nettoyage complet de terrain et mise en sécurité.</p>
          </div>

          <div className="service-card">
            <img src={tailleBuissonImg} alt="Taille de haies et de buissons" className="service-img" />
            <h3>Taille de haies et de buissons</h3>
            <p>Taille soignée pour un jardin structuré et harmonieux.</p>
          </div>

          <div className="service-card">
            <img src={entretienImg} alt="Entretien complet des arbustes" className="service-img" />
            <h3>Entretien complet des arbustes</h3>
            <p>Entretien régulier et adapté à chaque type d'arbuste.</p>
          </div>

          <div className="service-card">
            <img src={decoupeImg} alt="Découpe approfondie des branches" className="service-img" />
            <h3>Découpe approfondie des branches</h3>
            <p>Interventions précises pour préserver la santé des arbres.</p>
          </div>

          <div className="service-card">
            <img src={elagageImg} alt="Élagage mineur jusqu'à 5 mètres" className="service-img" />
            <h3>Élagage mineur jusqu'à 5 mètres</h3>
            <p>Élagage professionnel sécurisé jusqu'à 5 mètres de hauteur.</p>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "40px" }}>
          <button
            className="primary-btn"
            onClick={() => {
              document.getElementById("credit-impot")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Bénéficiez de 50% en crédit d'impôt
          </button>
        </div>
      </section>

      {/* ================= LOCAL SEO BLOCK ================= */}
      <section className="seo-section">
        <div className="seo-content">
          <h2>Jardinier professionnel au Muy et dans le Var (83)</h2>
          <p>
            Vous recherchez un jardinier au Muy (83) pour l'entretien
            de votre jardin ou l'élagage de vos arbres ?
            JR Jardinage intervient dans tout le secteur du Var pour
            des prestations rapides, efficaces et adaptées à vos besoins.
          </p>

          <p>
            Nous proposons des services complets : entretien régulier,
            taille de haies, élagage jusqu'à 5 mètres, débroussaillage
            de terrain et création paysagère.
            Chaque intervention est réalisée avec soin et professionnalisme.
          </p>

          <p>
            Basés au Muy, nous intervenons également dans les communes
            environnantes pour garantir un service de proximité.
            Contactez-nous dès aujourd'hui pour un devis gratuit.
          </p>
        </div>
      </section>

      {/* ================= PREMIUM ABOUT SECTION ================= */}
      <section className="about-section">
        <div className="about-left">
          <span className="about-badge">
            Entretien de jardin et élagage au Muy (Var 83)
          </span>

          <h2>
            Votre jardin entre de bonnes mains
          </h2>

          <p>
            JR Jardinage, installé au Muy dans le Var, accompagne particuliers
            et professionnels pour l'entretien, l'aménagement et l'embellissement
            de leurs espaces verts.
          </p>

          <p>
            Passionnés par la nature et forts d'une solide expérience,
            nous intervenons aussi bien pour des petits jardins familiaux
            que pour des terrains plus étendus.
          </p>

          <ul className="about-list">
            <li>
              <strong>Proche et réactif :</strong> intervention rapide dans un rayon
              de 30 km (Le Muy, Fréjus, Les Arcs, Roquebrune, Puget-sur-Argens…)
            </li>
            <li>
              <strong>Professionnel et soigné :</strong> prestations adaptées
              à vos attentes et à votre budget.
            </li>
            <li>
              <strong>Avantage fiscal :</strong> bénéficiez du crédit d'impôt
              sur nos prestations de jardinage.
            </li>
          </ul>

          <button 
            className="primary-btn"
            onClick={() => {
              document.querySelector(".contact-section")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Nous contacter
          </button>
        </div>

        <div className="about-right">
          <img
            src={votreJardinImg}
            alt="Votre jardin entretenu au Muy"
            className="about-image"
          />
        </div>
      </section>

      {/* ================= BEFORE / AFTER SECTION ================= */}
      <section className="before-after-section">
        <h2>Avant / Après – Transformation de jardin</h2>

        <div className="before-after-container">
          <div className="before-after-wrapper" ref={wrapperRef}>
            <img
              src={afterImage}
              alt="apres entretien jardin"
              className="after-image"
            />
            
            <div 
              className="after-image-wrapper"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img  
                src={beforeImage}
                alt="Avant entretien jardin"
                className="before-image"
              />
            </div>

            <div 
              className="slider-line"
              style={{ left: `${sliderPosition}%` }}
              onMouseDown={handleMouseDown}
            >
              <div className="slider-button">⟷</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CREDIT IMPÔT SECTION ================= */}
      <section id="credit-impot" className="seo-section">
        <div className="seo-content">
          <h2>50% de crédit d'impôt – Service à la Personne (SAP)</h2>
          <p>
            En tant que jardinier déclaré en Service à la Personne (SAP),
            vous bénéficiez d'un crédit d'impôt de 50% sur les prestations
            d'entretien de jardin.
          </p>

          <p>
            Cela signifie que la moitié du montant payé pour l'entretien
            courant de votre jardin peut être remboursée ou déduite de vos impôts,
            selon votre situation fiscale.
          </p>

          <p>
            Les prestations concernées incluent notamment : tonte de pelouse,
            taille de haies, entretien des arbustes, débroussaillage et entretien
            général du jardin.
          </p>

          <p>
            Contactez-nous pour savoir si votre demande est éligible et
            obtenir un devis détaillé.
          </p>
        </div>
      </section>

      {/* ================= GOOGLE REVIEWS SECTION ================= */}
      <section className="reviews-section">
        <div className="reviews-content">
          <div
            className="elfsight-app-0c6785b5-07cc-434a-a653-3b406ff5f6ef"
            data-elfsight-app-lazy
          ></div>
        </div>
      </section>

      {/* ================= CONTACT SECTION ================= */}
      <section className="contact-section">
        <div className="contact-header">
          <p>Contactez JR Jardinage au Muy</p>
          <h2>Nos coordonnées</h2>
        </div>

        <div className="contact-cards">
          <div className="contact-card">
            <div className="contact-card-icon">📞</div>
            <h3>Téléphone</h3>
            <a href="tel:+33613035559" style={{ color: '#555', textDecoration: 'none' }}>
              <p>06 13 03 55 59</p>
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">✉️</div>
            <h3>Email</h3>
            <a href="mailto:contact@jrjardinage.fr" style={{ color: '#555', textDecoration: 'none' }}>
              <p>contact@jrjardinage.fr</p>
            </a>
          </div>

          <div className="contact-card">
            <div className="contact-card-icon">📍</div>
            <h3>Zone d'intervention</h3>
            <p>Sur 30 km autour de le Muy, Les Arcs, Fréjus, Puget sur Argens, Roquebrune, Le Luc</p>
          </div>
        </div>

        <div className="social-section">
          <p>Nous suivre sur les réseaux sociaux</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/people/Rayen-Jelalia/61567984251514/" className="social-icon" target="_blank" rel="noopener noreferrer">
              <span style={{ fontSize: '20px', fontWeight: 'bold' }}>f</span>
            </a>
            <a href="https://www.instagram.com/jr_jardinage" className="social-icon" target="_blank" rel="noopener noreferrer">
              <img src={instaLogo} alt="Instagram" style={{ width: '24px', height: '24px' }} />
            </a>
          </div>
        </div>

        <div className="partner-section">
          <p>Nos partenaires</p>
          <a href="https://www.jardiniers-sap.fr/" target="_blank" rel="noopener noreferrer">
            <img src={jardiniersSapLogo} alt="Jardiniers SAP" className="partner-logo" />
          </a>
        </div>
      </section>
      
      {/* =================== MAP SECTION ================== */}
      <section className="map-section">
        <h2>Zone d'intervention</h2>

        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2893.605991073233!2d6.560979315576652!3d43.4606318791274!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12c9f5f9c6bbde83%3A0x7915df94a91f0bce!2sLe%20Muy%2C%20France!5e0!3m2!1fr!2sfr!4v1709019012345"
          width="100%"
          height="450"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
        />
      </section>

      <div style={{ textAlign: "center", marginTop: "40px", marginBottom: "60px" }}>
        <button 
          className="primary-btn"
          onClick={goToBooking}
        >
          Demander un devis
        </button>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Intervenez-vous uniquement au Muy ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Nous intervenons au Muy et dans les communes voisines du Var (83) pour l'entretien et l'élagage de jardin."
                }
              },
              {
                "@type": "Question",
                name: "Proposez-vous des devis gratuits ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Oui, tous nos devis sont gratuits et sans engagement."
                }
              },
              {
                "@type": "Question",
                name: "Quels types de services proposez-vous ?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Entretien complet de jardin, taille, élagage, débroussaillage et création paysagère."
                }
              }
            ]
          })
        }}
      />
    </div>
  );
}

export default Home;