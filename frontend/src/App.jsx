import React, { useState, useEffect } from "react";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";
import ChangePassword from "./pages/ChangePassword";
import ResetPassword from "./ResetPassword";
import Account from "./pages/Account";
import RequestReset from "./pages/RequestReset";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const path = window.location.pathname;

    if (path === "/reset-password") {
      setCurrentPage("resetPassword");
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

  return (
    <div>
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-left">
          <h3 style={{ cursor: "pointer" }} onClick={() => setCurrentPage("home")}>
            JR Jardinage
          </h3>
        </div>
  
        <div className="nav-right">
          {!isLoggedIn ? (
            <>
              <button onClick={() => setCurrentPage("login")}>
                Connexion
              </button>
              <button
                onClick={() => setCurrentPage("signup")}
                className="primary-btn"
              >
                Inscription
              </button>
            </>
          ) : isAdmin ? (
            <>
              <button onClick={() => setCurrentPage("admin")}>
                Admin
              </button>
              <button onClick={handleLogout} className="danger-btn">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentPage("booking")}>
                Demander un service
              </button>
              <button onClick={() => setCurrentPage("account")}>
                Mon compte
              </button>
              <button onClick={handleLogout} className="danger-btn">
                Déconnexion
              </button>
            </>
          )}
        </div>
      </nav>
  
      {/* PAGE CONTENT */}
      <div className="page-container">
        {currentPage === "home" && <Home />}
  
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
  
        {currentPage === "resetPassword" && (
          <ResetPassword goToLogin={() => setCurrentPage("login")} />
        )}
  
        {currentPage === "requestReset" && (
          <RequestReset goToLogin={() => setCurrentPage("login")} />
        )}
      </div>
    </div>
  );
}
export default App