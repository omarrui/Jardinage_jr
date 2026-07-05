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
import { apiUrl } from "../api/apiConfig";

function Home({ goToQuoteForm, goToSignup, goToClientAppointments }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [quickRequest, setQuickRequest] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    preferred_date: "",
    description: ""
  });
  const [quickRequestMessage, setQuickRequestMessage] = useState("");
  const [quickRequestStatus, setQuickRequestStatus] = useState("");
  const wrapperRef = useRef(null);
  const isDraggingRef = useRef(false);
  const todayStr = new Date().toISOString().split("T")[0];

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://static.elfsight.com/platform/platform.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const getSliderClientX = (event) => {
    if (event.touches?.length) return event.touches[0].clientX;
    if (event.changedTouches?.length) return event.changedTouches[0].clientX;
    return event.clientX;
  };

  const updateSliderFromEvent = (event) => {
    if (!wrapperRef.current) return;

    const rect = wrapperRef.current.getBoundingClientRect();
    const x = getSliderClientX(event) - rect.left;
    const percentage = (x / rect.width) * 100;

    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  const handleSliderPointerDown = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    updateSliderFromEvent(e);
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };

  const handleSliderTouchStart = (e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    updateSliderFromEvent(e);
  };

  const stopSliderDrag = () => {
    isDraggingRef.current = false;
  };

  useEffect(() => {
    const moveSlider = (event) => {
      if (!isDraggingRef.current) return;
      if (event.cancelable) event.preventDefault();
      updateSliderFromEvent(event);
    };

    window.addEventListener("pointermove", moveSlider);
    window.addEventListener("pointerup", stopSliderDrag);
    window.addEventListener("pointercancel", stopSliderDrag);
    window.addEventListener("touchmove", moveSlider, { passive: false });
    window.addEventListener("touchend", stopSliderDrag);
    window.addEventListener("touchcancel", stopSliderDrag);

    return () => {
      window.removeEventListener("pointermove", moveSlider);
      window.removeEventListener("pointerup", stopSliderDrag);
      window.removeEventListener("pointercancel", stopSliderDrag);
      window.removeEventListener("touchmove", moveSlider);
      window.removeEventListener("touchend", stopSliderDrag);
      window.removeEventListener("touchcancel", stopSliderDrag);
    };
  }, []);

  const updateQuickRequest = (field, value) => {
    setQuickRequest((current) => ({
      ...current,
      [field]: value
    }));
  };

  const submitQuickRequest = async (event) => {
    event.preventDefault();
    setQuickRequestMessage("");
    setQuickRequestStatus("");

    try {
      const response = await fetch(apiUrl("/api/public/service-requests"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickRequest)
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        setQuickRequestStatus("error");
        setQuickRequestMessage(data.error || "Impossible d'envoyer la demande.");
        return;
      }

      setQuickRequestStatus("success");
      setQuickRequestMessage("Votre demande a bien été envoyée. JR Jardinage vous recontactera rapidement.");
      setQuickRequest({
        name: "",
        email: "",
        phone: "",
        address: "",
        preferred_date: "",
        description: ""
      });
    } catch (error) {
      setQuickRequestStatus("error");
      setQuickRequestMessage("Erreur serveur. Veuillez réessayer.");
    }
  };

  const scrollToQuickRequest = () => {
    document.getElementById("demande-sans-compte")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="home-container">

      {/* ================= HERO SECTION ================= */}
      <section
        className="hero"
        style={{ backgroundImage: `url(${background})` }}
      >
        <div className="hero-overlay">
          <span className="hero-kicker">
            Jardinier au Muy | Spécialiste dans l'entretien de votre jardin
          </span>
          <h1>
            Jardinage, élagage et création sur mesure
          </h1>
          <div className="hero-buttons">
            <button className="primary-btn" onClick={goToQuoteForm}>
              Demander un devis
            </button>

            <button
              className="secondary-btn"
              onClick={() => {
                const contractsSection = document.getElementById("contrats-entretien");
                const fallbackSection = document.querySelector(".services-section");
                (contractsSection || fallbackSection)?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              Découvrez nos contrats d'entretien
            </button>

            <a className="secondary-btn" href="tel:+33613035559">
              06 13 03 55 59
            </a>
          </div>
        </div>
      </section>

      {/* ================= SERVICES ================= */}
      <section className="services-section">
        <div className="services-grid">
          <div className="service-card">
            <img src={debroussaillageImg} alt="Service de débroussaillage au Muy" className="service-img" loading="lazy" />
            <h3>Débroussaillage</h3>
            <p>Nettoyage de terrain, coupe des herbes hautes et remise au propre.</p>
          </div>

          <div className="service-card">
            <img src={tailleBuissonImg} alt="Service de taille de haie dans le Var" className="service-img" loading="lazy" />
            <h3>Taille de haie</h3>
            <p>Taille soignée pour garder des haies nettes, denses et harmonieuses.</p>
          </div>

          <div className="service-card">
            <img src={entretienImg} alt="Taille et entretien phytosanitaire des arbustes" className="service-img" loading="lazy" />
            <h3>Taille et entretien phytosanitaire de vos arbustes</h3>
            <p>Soins adaptés pour préserver la forme, la vigueur et la santé des arbustes.</p>
          </div>

          <div className="service-card">
            <img src={decoupeImg} alt="Service de création paysagère au Muy" className="service-img" loading="lazy" />
            <h3>Création paysagère</h3>
            <p>Aménagement et mise en valeur de vos espaces extérieurs.</p>
          </div>

          <div className="service-card">
            <img src={elagageImg} alt="Service d'élagage mineur au Muy" className="service-img" loading="lazy" />
            <h3>Élagage mineur</h3>
            <p>Élagage léger et sécurisé pour entretenir les arbres de petite hauteur.</p>
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
      <section className="seo-section local-seo-section">
        <div className="seo-content">
          <h2>Jardinier professionnel au Muy et dans le Var (83)</h2>
          <p>
            Vous recherchez un jardinier au Muy (83) pour l'entretien
            de votre jardin ou l'élagage de vos arbres ?
            JR Jardinage intervient dans tout le secteur du Var pour
            des prestations rapides, efficaces et adaptées à vos besoins.
          </p>

          <p>
            Nous proposons des services complets : débroussaillage,
            taille de haie, taille et entretien phytosanitaire de vos arbustes,
            création paysagère et élagage mineur.
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
            loading="lazy"
          />
        </div>
      </section>

      {/* ================= BEFORE / AFTER SECTION ================= */}
      <section className="before-after-section">
        <h2>Avant / Après – Transformation de jardin</h2>

        <div className="before-after-container">
          <div
            className="before-after-wrapper"
            ref={wrapperRef}
            onPointerDown={handleSliderPointerDown}
            onTouchStart={handleSliderTouchStart}
          >
            <img
              src={afterImage}
              alt="Jardin après intervention de JR Jardinage"
              className="after-image"
              loading="lazy"
            />
            
            <div 
              className="after-image-wrapper"
              style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
            >
              <img  
                src={beforeImage}
                alt="Jardin avant intervention de JR Jardinage"
                className="before-image"
                loading="lazy"
              />
            </div>

            <div 
              className="slider-line"
              style={{ left: `${sliderPosition}%` }}
              aria-hidden="true"
            >
              <div className="slider-button">⟷</div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= CONTRATS D'ENTRETIEN SECTION ================= */}
      <section id="contrats-entretien" className="contracts-section">
        <div className="contracts-header">
          <span className="about-badge">Contrats d'entretien</span>
          <h2>
            <span>Nos contrats</span>
            <span>d'entretien</span>
          </h2>
          <p>
            Des passages réguliers pour garder votre jardin propre, structuré
            et agréable toute l'année, avec un prix forfaitaire adapté à vos besoins.
          </p>
        </div>

        <div className="contracts-grid">
          <article className="contract-card">
            <span className="contract-period">Mensuel</span>
            <h3>Contrat mensuel</h3>
            <p className="contract-passage">1 à 4 passages</p>
            <p>Entretien suivi pour garder vos extérieurs propres au fil des semaines.</p>
            <strong>Prix forfaitaire sur mesure</strong>
          </article>

          <article className="contract-card featured">
            <span className="contract-period">3 mois</span>
            <h3>Contrat trimestriel</h3>
            <p className="contract-passage">1 à 8 passages</p>
            <p>Un rythme flexible pour accompagner les saisons et les besoins du jardin.</p>
            <strong>Prix forfaitaire sur mesure</strong>
          </article>

          <article className="contract-card">
            <span className="contract-period">6 mois</span>
            <h3>Contrat semestriel</h3>
            <p className="contract-passage">Grand passage tous les 6 mois</p>
            <p>Une intervention complète pour remettre le jardin au propre durablement.</p>
            <strong>Prix forfaitaire sur mesure</strong>
          </article>
        </div>

        <button className="primary-btn" onClick={goToQuoteForm}>
          Demander un devis
        </button>
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
            Les prestations concernées incluent notamment : débroussaillage,
            taille de haie, entretien des arbustes et entretien général du jardin.
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

      {/* ================= FAQ SECTION ================= */}
      <section className="faq-section" id="faq">
        <div className="faq-header">
          <span className="about-badge">Questions fréquentes</span>
          <h2>Tout savoir avant de demander un devis</h2>
        </div>

        <div className="faq-grid">
          <article className="faq-card">
            <h3>Intervenez-vous uniquement au Muy ?</h3>
            <p>
              JR Jardinage intervient au Muy et dans un rayon d'environ 30 km,
              notamment vers Les Arcs, Fréjus, Puget-sur-Argens,
              Roquebrune-sur-Argens et Le Luc.
            </p>
          </article>

          <article className="faq-card">
            <h3>Proposez-vous des devis gratuits ?</h3>
            <p>
              Oui, vous pouvez envoyer une demande de devis gratuitement depuis
              le formulaire du site. JR Jardinage vous recontacte ensuite pour
              préciser votre besoin.
            </p>
          </article>

          <article className="faq-card">
            <h3>Quels services de jardinage proposez-vous ?</h3>
            <p>
              Nous proposons le débroussaillage, la taille de haie, l'entretien
              des arbustes, la création paysagère, l'élagage mineur et les
              contrats d'entretien de jardin.
            </p>
          </article>
        </div>
      </section>

      <div className="home-cta-buttons">
        <button
          className="primary-btn"
          onClick={goToSignup}
        >
          Créer un compte client
        </button>

        <button
          className="secondary-btn"
          onClick={scrollToQuickRequest}
        >
          Demande sans compte
        </button>

        {goToClientAppointments && (
          <button
            className="secondary-btn"
            onClick={goToClientAppointments}
          >
            📅 Mes rendez-vous
          </button>
        )}
      </div>

      {/* ================= QUICK REQUEST SECTION ================= */}
      <section id="demande-sans-compte" className="quick-request-section">
        <div className="quick-request-copy">
          <span className="about-badge">Demande sans compte</span>
          <h2>Un devis rapide sans créer de compte</h2>
          <p>
            Vous pouvez aussi envoyer vos coordonnées directement. Votre demande
            sera transmise à l'administrateur et enregistrée comme client non actif.
          </p>
        </div>

        <form className="quick-request-form" onSubmit={submitQuickRequest}>
          <div className="quick-request-row">
            <label>
              Nom complet
              <input
                type="text"
                value={quickRequest.name}
                onChange={(event) => updateQuickRequest("name", event.target.value)}
                required
              />
            </label>

            <label>
              Téléphone
              <input
                type="tel"
                value={quickRequest.phone}
                onChange={(event) => updateQuickRequest("phone", event.target.value)}
                required
              />
            </label>
          </div>

          <label>
            Email
            <input
              type="email"
              value={quickRequest.email}
              onChange={(event) => updateQuickRequest("email", event.target.value)}
              placeholder="Optionnel"
            />
          </label>

          <label>
            Adresse d'intervention
            <input
              type="text"
              value={quickRequest.address}
              onChange={(event) => updateQuickRequest("address", event.target.value)}
              placeholder="Ex: 12 rue des Oliviers, Le Muy"
              required
            />
          </label>

          <label>
            Date souhaitée
            <input
              type="date"
              min={todayStr}
              value={quickRequest.preferred_date}
              onChange={(event) => updateQuickRequest("preferred_date", event.target.value)}
              required
            />
          </label>

          <label>
            Votre besoin
            <textarea
              value={quickRequest.description}
              onChange={(event) => updateQuickRequest("description", event.target.value)}
              placeholder="Ex: Débroussaillage, taille de haie, création paysagère..."
              rows="4"
            />
          </label>

          <button type="submit" className="primary-btn">
            Envoyer ma demande
          </button>

          {quickRequestMessage && (
            <p className={`quick-request-message ${quickRequestStatus}`}>
              {quickRequestMessage}
            </p>
          )}
        </form>
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
            <img src={jardiniersSapLogo} alt="Partenaire Jardiniers SAP" className="partner-logo" loading="lazy" />
          </a>
        </div>
      </section>
      
      {/* =================== MAP SECTION ================== */}
      <section className="map-section">
        <iframe
          title="Carte de la zone d'intervention JR Jardinage au Muy"
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
