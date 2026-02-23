import React, { useState, useEffect } from "react";

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

  //  SESSION RESTORE + RESET LINK DETECTION
  useEffect(() => {
    const path = window.location.pathname;

    // If user clicked email reset link
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
      <h1>🌱 JR jardinage</h1>

      {/* HOME */}
      {currentPage === "home" && (
        <>
          {!isLoggedIn ? (
            <>
              <button onClick={() => setCurrentPage("login")}>
                Log In
              </button>
              <button onClick={() => setCurrentPage("signup")}>
                Sign Up
              </button>
            </>
          ) : isAdmin ? (
            <>
              <button onClick={() => setCurrentPage("admin")}>
                Admin Dashboard
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setCurrentPage("booking")}>
                Request Service
              </button>
              <button onClick={() => setCurrentPage("account")}>
                My Account
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </>
      )}


      {/* SIGNUP */}
      {currentPage === "signup" && (
        <Signup
          goHome={() => setCurrentPage("home")}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {/* BOOKING */}
      {currentPage === "booking" && (
        <Booking goHome={() => setCurrentPage("home")} />
      )}

      {/* ADMIN */}
      {currentPage === "admin" && (
        <AdminDashboard goHome={handleLogout} />
      )}

      {/* FORCE CHANGE PASSWORD */}
      {currentPage === "changePassword" && (
        <ChangePassword
          goToLogin={() => setCurrentPage("login")}
          goHome={() => setCurrentPage("home")}
        />
      )}


      {currentPage === "account" && (
        <Account goHome={() => setCurrentPage("home")} />
      )}

      {/* RESET PASSWORD (EMAIL LINK PAGE) */}
      {currentPage === "resetPassword" && (
        <ResetPassword
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "requestReset" && (
        <RequestReset
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {/* LOGIN */}

      {currentPage === "login" && (
        <Login
          onCustomerLogin={handleCustomerLogin}
          onAdminLogin={handleAdminLogin}
          onForcePasswordChange={handleForcePasswordChange}
          goHome={() => setCurrentPage("home")}
          goToResetRequest={() => setCurrentPage("requestReset")}
        />
      )}
    </div>
  );
}

export default App;