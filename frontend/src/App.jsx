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

const PAGE_HASHES = {
  home: "",
  signup: "signup",
  login: "login",
  booking: "booking",
  appointments: "appointments",
  account: "account",
  admin: "admin",
  changePassword: "change-password",
  requestReset: "request-reset"
};

const HASH_TO_PAGE = Object.entries(PAGE_HASHES).reduce((pages, [page, hash]) => {
  if (hash) pages[hash] = page;
  return pages;
}, {});

function getPageFromLocation() {
  if (
    window.location.pathname === "/reset-password" ||
    window.location.search.includes("token=")
  ) {
    return "resetPassword";
  }

  const hash = window.location.hash.replace(/^#\/?/, "");
  return HASH_TO_PAGE[hash] || "home";
}

function getUrlForPage(page) {
  const hash = PAGE_HASHES[page];
  return `${window.location.pathname}${window.location.search}${hash ? `#/${hash}` : ""}`;
}

function App() {
  const [currentPage, setCurrentPage] = useState(getPageFromLocation);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navigateToPage = (page, options = {}) => {
    setCurrentPage(page);
    setIsMenuOpen(false);

    if (page === "resetPassword") return;

    const nextUrl = getUrlForPage(page);
    const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;

    if (nextUrl !== currentUrl) {
      if (options.replace) {
        window.history.replaceState({ page }, "", nextUrl);
      } else {
        window.history.pushState({ page }, "", nextUrl);
      }
    }
  };

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
    }

    if (token && role === "admin") {
      setIsLoggedIn(true);
      setIsAdmin(true);
      navigateToPage("admin", { replace: true });
    }
  }, []);

  useEffect(() => {
    const handleBrowserNavigation = () => {
      setCurrentPage(getPageFromLocation());
      setIsMenuOpen(false);
    };

    window.addEventListener("popstate", handleBrowserNavigation);
    window.addEventListener("hashchange", handleBrowserNavigation);

    return () => {
      window.removeEventListener("popstate", handleBrowserNavigation);
      window.removeEventListener("hashchange", handleBrowserNavigation);
    };
  }, []);

  function handleCustomerLogin() {
    setIsLoggedIn(true);
    setIsAdmin(false);
    navigateToPage("home", { replace: true });
  }

  function handleAdminLogin() {
    setIsLoggedIn(true);
    setIsAdmin(true);
    navigateToPage("admin", { replace: true });
  }

  function handleForcePasswordChange(customerId) {
    localStorage.setItem("customer_id", customerId);
    navigateToPage("changePassword");
  }

  function handleLogout() {
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigateToPage("home", { replace: true });
  }

  const handleLogoClick = () => {
    navigateToPage("home");
  };

  //  Extract ternary into helper function
  const handleGoToBooking = () => {
    if (isLoggedIn) {
      navigateToPage("booking");
    } else {
      navigateToPage("login");
    }
  };

  const handleGoToQuoteForm = () => {
    setIsMenuOpen(false);

    if (isLoggedIn && !isAdmin) {
      navigateToPage("booking");
      return;
    }

    navigateToPage("home");
    window.setTimeout(() => {
      document.getElementById("demande-sans-compte")?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const handleGoToAppointments = () => {
    setIsMenuOpen(false);

    if (isLoggedIn && !isAdmin) {
      navigateToPage("appointments");
    }
    // Do nothing if not logged in or is admin
  };

  const goToHomeSection = (selector) => {
    setIsMenuOpen(false);
    navigateToPage("home");
    window.setTimeout(() => {
      document.querySelector(selector)?.scrollIntoView({ behavior: "smooth" });
    }, 0);
  };

  const goToPage = (page) => {
    navigateToPage(page);
  };

  const renderAuthButtons = () => {
    if (isAdmin) {
      return (
        <>
          <button
            onClick={() => goToPage("admin")}
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
          onClick={() => goToPage("booking")}
          className="primary-btn"
        >
          Demander un service
        </button>
        <button
          onClick={() => goToPage("appointments")}
          className="primary-btn"
        >
          Mes rendez-vous
        </button>
        <button
          onClick={() => goToPage("account")}
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
      <ResetPassword goToLogin={() => navigateToPage("login")} />
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

          <button
            type="button"
            className={`site-menu-toggle ${isMenuOpen ? "is-open" : ""}`}
            onClick={() => setIsMenuOpen((open) => !open)}
            aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={isMenuOpen}
            aria-controls="site-nav-links"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <div
            id="site-nav-links"
            className={`site-nav-links ${isMenuOpen ? "is-open" : ""}`}
          >
            <button onClick={() => goToHomeSection(".about-section")}>A PROPOS</button>
            <button onClick={() => goToHomeSection(".services-section")}>NOS SERVICES</button>
            <button onClick={() => goToHomeSection(".before-after-section")}>NOS REALISATIONS</button>
            <button onClick={() => goToHomeSection(".contact-section")}>CONTACT</button>

            {!isLoggedIn ? (
              <>
                <button onClick={handleGoToQuoteForm} className="quote-btn">
                  DEMANDER UN DEVIS
                </button>
                <button onClick={() => goToPage("login")} className="auth-nav-btn auth-login-btn">
                  Connexion
                </button>
                <button onClick={() => goToPage("signup")} className="auth-nav-btn auth-signup-btn">
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
          goToSignup={() => navigateToPage("signup")}
          goToClientAppointments={isLoggedIn && !isAdmin ? handleGoToAppointments : null} 
        />
      )}  
        {currentPage === "signup" && (
          <Signup
            goHome={() => navigateToPage("home")}
            goToLogin={() => navigateToPage("login")}
          />
        )}
  
        {currentPage === "login" && (
          <Login
            onCustomerLogin={handleCustomerLogin}
            onAdminLogin={handleAdminLogin}
            onForcePasswordChange={handleForcePasswordChange}
            goHome={() => navigateToPage("home")}
            goToResetRequest={() => navigateToPage("requestReset")}
          />
        )}
  
        {currentPage === "booking" && (
          <Booking goHome={() => navigateToPage("home")} />
        )}

        {currentPage === "appointments" && (
          <ClientAppointments goHome={() => navigateToPage("home")} />
        )}
  
        {currentPage === "account" && (
          <Account goHome={() => navigateToPage("home")} />
        )}
  
        {currentPage === "admin" && (
          <AdminDashboard goHome={handleLogout} />
        )}
  
        {currentPage === "changePassword" && (
          <ChangePassword
            goToLogin={() => navigateToPage("login")}
            goHome={() => navigateToPage("home")}
          />
        )}
  
        {currentPage === "requestReset" && (
          <RequestReset goToLogin={() => navigateToPage("login")} />
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
