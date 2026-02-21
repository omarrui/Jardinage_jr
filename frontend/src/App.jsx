import React, { useState, useEffect } from "react";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customerName, setCustomerName] = useState("");

  // 🔥 SESSION RESTORE ON PAGE RELOAD
  useEffect(() => {
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

  function handleLogout() {
    // 🔥 CLEAR EVERYTHING
    localStorage.clear();
    setIsLoggedIn(false);
    setIsAdmin(false);
    setCustomerName("");
    setCurrentPage("home");
  }

  return (
    <div>
      <h1>🌱 JR jardinage</h1>

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
              <h2>Admin Dashboard</h2>
              <button onClick={() => setCurrentPage("admin")}>
                Go to Dashboard
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <h2>Welcome 👋</h2>
              <button onClick={() => setCurrentPage("booking")}>
                Request Service
              </button>
              <button onClick={handleLogout}>
                Logout
              </button>
            </>
          )}
        </>
      )}

      {currentPage === "login" && (
        <Login
          onCustomerLogin={handleCustomerLogin}
          onAdminLogin={handleAdminLogin}
          goHome={() => setCurrentPage("home")}
        />
      )}

      {currentPage === "signup" && (
        <Signup
          goHome={() => setCurrentPage("home")}
          goToLogin={() => setCurrentPage("login")}
        />
      )}

      {currentPage === "booking" && (
        <Booking goHome={() => setCurrentPage("home")} />
      )}

      {currentPage === "admin" && (
        <AdminDashboard goHome={() => setCurrentPage("home")} />
      )}
    </div>
  );
}

export default App;