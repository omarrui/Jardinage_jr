import React, { useState } from "react";

import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Booking from "./pages/Booking";
import AdminDashboard from "./pages/AdminDashboard"; // create this later

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [customerName, setCustomerName] = useState("");

  function handleCustomerLogin(name) {
    setIsLoggedIn(true);
    setIsAdmin(false);
    setCustomerName(name);
    setCurrentPage("home");
  }

  function handleAdminLogin() {
    setIsLoggedIn(true);
    setIsAdmin(true);
    setCurrentPage("admin");
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
              <button onClick={() => {
                setIsLoggedIn(false);
                setIsAdmin(false);
              }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <h2>Welcome, {customerName} 👋</h2>
              <button onClick={() => setCurrentPage("booking")}>
                Request Service
              </button>
              <button onClick={() => {
                localStorage.removeItem("customer_id");
                setIsLoggedIn(false);
                setCustomerName("");
              }}>
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
