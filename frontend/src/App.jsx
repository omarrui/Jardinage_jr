import React, { useState, useEffect } from "react";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./pages/ResetPassword";
import Account from "./pages/Account";
import RequestReset from "./pages/RequestReset";
import ClientAppointments from "./pages/ClientAppointments";
import logo from "./gallery/logojr.webp";

function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (
      window.location.pathname === "/reset-password" ||
      window.location.search.includes("token=")
    ) {
      return "resetPassword";
    }
    return "home";
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (
      window.location.pathname === "/reset-password" ||
      window.location.search.includes("token=")
    ) {
      return;
    }

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (token && role === "customer") {
      setIsLoggedIn(true);
      setIsAdmin(false);
      setCurrentPage("home");
    }

    if (token && role === "admin") {
      setIsLoggedIn(true);
      setIsAdmin(true);
      setCurrentPage("admin");
    }
  }, []);

  function handleCustomerLogin() {
    setIsLoggedIn(true);
    setIsAdmin(false);
    setCurrentPage("home");
  }

  function handleAdminLogin() {
    setIsLoggedIn(true);
    setIsAdmin(true);
    setCurrentPage("admin");
  }

  function handleForcePasswordChange(customerId) {
    localStorage.setItem("customer_id", customerId);
    setCurrentPage("changePassword");
  }

  function handleLogout() {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCurrentPage("home");
  }

  const handleLogoClick = () => {
    setCurrentPage("home");
  };

  //  Extract ternary into helper function
  const handleGoToBooking = () => {
    if (isLoggedIn) {
      setCurrentPage("booking");
    } else {
      setCurrentPage("login");
    }
  };

  const handleGoToQuoteForm = () => {
    if (isLoggedIn && !isAdmin) {
      setCurrentPage("booking");
      return;
    }

    setCurrentPage("home");
    window.setTimeout(() => {
      document.getElementById("demande-sans-compte")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleGoToAppointments = () => {
    if (isLoggedIn && !isAdmin) {
      setCurrentPage("appointments");
    }
    // Do nothing if not logged in or is admin
  };

  const goToHomeSection = (selector) => {
    setCurrentPage("home");
    window.setTimeout(() => {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const renderAuthButtons = () => {
    if (isAdmin) {
      return (
        <>
          <button
            onClick={() => setCurrentPage("admin")}
            className="primary-btn"
          >
            Admin
          </button>
          <button onClick={handleLogout} className="danger-btn">
            Déconnexion
          </button>
        </>
      );
    }

    return (
      <>
        <button
          onClick={() => setCurrentPage("booking")}
          className="primary-btn"
        >
          Demander un service
        </button>
        <button
          onClick={() => setCurrentPage("appointments")}
          className="primary-btn"
        >
          Mes rendez-vous
        </button>
        <button
          onClick={() => setCurrentPage("account")}
          className="primary-btn"
        >
          Mon compte
        </button>
        <button onClick={handleLogout} className="danger-btn">
          Déconnexion
        </button>
      </>
    );
  };

  if (currentPage === "resetPassword") {
    return (
      <ResetPassword goToLogin={() => setCurrentPage("login")} />
    );
  }

  return (
    <div>
      {/* NAVBAR */}
      <header className="site-header">
        <div className="site-topbar">
          <span>Le Muy et alentours</span>
          <a href="tel:+33613035559">06 13 03 55 59</a>
        </div>

        <nav className="site-navbar">
          <button
            onClick={handleLogoClick}
            onKeyDown={(e) => e.key === "Enter" && handleLogoClick()}
            className="site-logo-button"
            aria-label="Go to home page"
          >
            <img src={logo} alt="JR Jardinage Logo" />
          </button>

          <div className="site-nav-links">
            <button onClick={() => goToHomeSection(".about-section")}>A PROPOS</button>
            <button onClick={() => goToHomeSection(".services-section")}>NOS SERVICES</button>
            <button onClick={() => goToHomeSection(".before-after-section")}>NOS REALISATIONS</button>
            <button onClick={() => goToHomeSection(".contact-section")}>CONTACT</button>

            {!isLoggedIn ? (
              <>
                <button onClick={handleGoToQuoteForm} className="quote-btn">
                  DEMANDER UN DEVIS
                </button>
                <button onClick={() => setCurrentPage("login")} className="auth-nav-btn auth-login-btn">
                  Connexion
                </button>
                <button onClick={() => setCurrentPage("signup")} className="auth-nav-btn auth-signup-btn">
                  Inscription
                </button>
              </>
            ) : renderAuthButtons()
            }
          </div>
        </nav>
      </header>
  
      {/* PAGE CONTENT */}
      <div className="page-container">
      {currentPage === "home" && (
        <Home
          goToQuoteForm={handleGoToQuoteForm}
          goToSignup={() => setCurrentPage("signup")}
          goToClientAppointments={isLoggedIn && !isAdmin ? handleGoToAppointments : null} 
        />
      )}  
        {currentPage === "signup" && (
          <Signup
            goHome={() => setCurrentPage("home")}
            goToLogin={() => setCurrentPage("login")}
          />
        )}
  
        {currentPage === "login" && (
          <Login
            onCustomerLogin={handleCustomerLogin}
            onAdminLogin={handleAdminLogin}
            onForcePasswordChange={handleForcePasswordChange}
            goHome={() => setCurrentPage("home")}
            goToResetRequest={() => setCurrentPage("requestReset")}
          />
        )}
  
        {currentPage === "booking" && (
          <Booking goHome={() => setCurrentPage("home")} />
        )}

        {currentPage === "appointments" && (
          <ClientAppointments goHome={() => setCurrentPage("home")} />
        )}
  
        {currentPage === "account" && (
          <Account goHome={() => setCurrentPage("home")} />
        )}
  
        {currentPage === "admin" && (
          <AdminDashboard goHome={handleLogout} />
        )}
  
        {currentPage === "changePassword" && (
          <ChangePassword
            goToLogin={() => setCurrentPage("login")}
            goHome={() => setCurrentPage("home")}
          />
        )}
  
        {currentPage === "requestReset" && (
          <RequestReset goToLogin={() => setCurrentPage("login")} />
        )}
      </div>
      {currentPage !== "admin" && (
        <footer className="app-footer">
          <div className="footer-main">
            <div className="footer-brand">
              <img src={logo} alt="JR Jardinage Logo" />
              <div>
                <strong>JR Jardinage</strong>
                <span>Entretien, élagage et création paysagère au Muy.</span>
              </div>
            </div>

            <div className="footer-links">
              <button onClick={() => goToHomeSection(".services-section")}>Services</button>
              <button onClick={() => goToHomeSection(".contact-section")}>Contact</button>
              <a href="tel:+33613035559">06 13 03 55 59</a>
              <a href="mailto:contact@jrjardinage.fr">contact@jrjardinage.fr</a>
            </div>
          </div>

          <div className="footer-credit">
            <span>Site réalisé par Omar Rouigui</span>
            <a
              href="mailto:rouiguio919@gmail.com"
            >
              rouiguio919@gmail.com
            </a>
          </div>
        </footer>
      )}
    </div>
  );
}
export default App;
