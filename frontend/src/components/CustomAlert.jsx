import React from "react";

function CustomAlert({ isOpen, message, onClose }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 2000
    }}>
      <div style={{
        background: "white",
        padding: "25px",
        borderRadius: "12px",
        minWidth: "320px",
        textAlign: "center",
        boxShadow: "0 10px 30px rgba(0,0,0,0.2)"
      }}>
        <p style={{ marginBottom: "20px", fontSize: "16px" }}>
          {message}
        </p>

        <button
          onClick={onClose}
          style={{
            backgroundColor: "#1b5e20",
            color: "white",
            padding: "8px 18px",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default CustomAlert;