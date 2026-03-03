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

  // ✅ FIX: Make this a proper conditional function
  const handleGoToAppointments = () => {
    if (isLoggedIn && !isAdmin) {
      setCurrentPage("appointments");
    }
    // Do nothing if not logged in or is admin
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
      <nav
        style={{
          background: "linear-gradient(90deg, #1b5e20, #2e7d32)",
          padding: "15px 40px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          color: "white",
          boxShadow: "0 4px 15px rgba(0,0,0,0.15)"
        }}
      >
        <div className="nav-left">
          <button
            onClick={handleLogoClick}
            onKeyDown={(e) => e.key === 'Enter' && handleLogoClick()}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              background: "none",
              border: "none",
              color: "inherit",
              padding: 0
            }}
            aria-label="Go to home page"
          >
            <img
              src={logo}
              alt="JR Jardinage Logo"
              style={{
                height: "56px",
                width: "56px",
                objectFit: "contain"
              }}
            />
            <span
              style={{
                fontWeight: 600,
                fontSize: "18px",
                letterSpacing: "0.5px"
              }}
            >
              JR Jardinage
            </span>
          </button>
        </div>
  
        <div
          className="nav-right"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px"
          }}
        >
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => setCurrentPage("login")}
                className="primary-btn"
              >
                Connexion
              </button>
                <button
                onClick={() => setCurrentPage("signup")}
                className="primary-btn"
              >
                Inscription
              </button>
            </>
          ) : renderAuthButtons()
          }
        </div>
      </nav>
  
      {/* PAGE CONTENT */}
      <div className="page-container">
      {currentPage === "home" && (
        <Home
          goToBooking={handleGoToBooking}
          goToClientAppointments={handleGoToAppointments} 
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
    </div>
  );
}
export default App;