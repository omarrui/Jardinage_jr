import React, { useEffect, useState } from "react";
import CustomAlert from "../components/CustomAlert.jsx";
import { apiUrl } from "../api/apiConfig";

function ClientAppointments({ goHome }) {
  const [appointments, setAppointments] = useState([]);
  const [showPast, setShowPast] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    const customerId = localStorage.getItem("customer_id");

    if (!customerId) return;

    try {
      const res = await fetch(
        apiUrl(`/api/customer/service-requests?customer_id=${customerId}`)
      );
      const data = await res.json();

      // Sort by most recent scheduled_start or preferred_date
      const sorted = (data.requests || []).sort((a, b) => {
        const dateA = a.scheduled_start
          ? new Date(a.scheduled_start)
          : new Date(a.preferred_date);
        const dateB = b.scheduled_start
          ? new Date(b.scheduled_start)
          : new Date(b.preferred_date);
        return dateB - dateA;
      });

      setAppointments(sorted);
    } catch (err) {
      console.error("Failed to fetch appointments", err);
    }
  };

  const showAlert = (message) => {
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const cancelAppointment = async (requestId) => {
    const confirmCancel = window.confirm(
      "Êtes-vous sûr de vouloir annuler ce rendez-vous ?"
    );
    
    if (!confirmCancel) return;
  
    try {
      const response = await fetch(
        apiUrl(`/api/customer/cancel-appointment/${requestId}`),
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );
  
      const data = await response.json();
  
      if (!response.ok) {
        showAlert(data.error || "Erreur lors de l'annulation");
        return;
      }
  
      showAlert("Rendez-vous annulé avec succès!");
      // Refresh the appointments list
      fetchAppointments();
    } catch (error) {
      console.error("Error:", error);
      showAlert("Erreur de connexion");
    }
  };

  const now = new Date();

  const upcomingAppointments = appointments.filter((appt) => {
    if (appt.status === "cancelled") return false;

    if (!appt.scheduled_start) return true;

    return new Date(appt.scheduled_start) >= now;
  });

  const pastAppointments = appointments.filter((appt) => {
    if (appt.status === "cancelled") return false;

    if (!appt.scheduled_start) return false;

    return new Date(appt.scheduled_start) < now;
  });

  const listToDisplay = showPast ? pastAppointments : upcomingAppointments;

  return (
    <>
      <div style={{ padding: "40px", maxWidth: "900px", margin: "0 auto" }}>
        <h2 style={{ color: "#1b5e20", marginBottom: "20px" }}>
          📅 Mes rendez-vous
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <button
            onClick={() => setShowPast(false)}
            style={{
              marginRight: "10px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: !showPast ? "#1b5e20" : "#e0e0e0",
              color: !showPast ? "white" : "black"
            }}
          >
            À venir
          </button>

          <button
            onClick={() => setShowPast(true)}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              backgroundColor: showPast ? "#1b5e20" : "#e0e0e0",
              color: showPast ? "white" : "black"
            }}
          >
            Rendez-vous passés
          </button>
        </div>

        {listToDisplay.length === 0 ? (
          <p>Aucun rendez-vous.</p>
        ) : (
          listToDisplay.map((appt) => {
            const isPast = appt.scheduled_start && new Date(appt.scheduled_start) < new Date();
            const isCancelled = appt.status === "cancelled";
            const canCancel = !isPast && !isCancelled && appt.status === "scheduled";

            return (
              <div
                key={appt.id}
                style={{
                  border: "1px solid #e0e0e0",
                  padding: "18px",
                  borderRadius: "12px",
                  marginBottom: "15px",
                  backgroundColor: "#ffffff",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
                }}
              >
                <p><strong>Date demandée :</strong> {appt.preferred_date}</p>
                <p><strong>Adresse :</strong> {appt.address}</p>
                <p><strong>Status :</strong> {appt.status}</p>
                {appt.scheduled_start && (
                  <p><strong>Prévu :</strong> {new Date(appt.scheduled_start).toLocaleString('fr-FR')}</p>
                )}

                {/* Only show cancel button if appointment is future and scheduled */}
                {canCancel && (
                  <button
                    onClick={() => cancelAppointment(appt.id)}
                    style={{
                      backgroundColor: "#c62828",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginTop: "10px"
                    }}
                  >
                    🗑️ Annuler le rendez-vous
                  </button>
                )}
              </div>
            );
          })
        )}

        <button
          onClick={goHome}
          style={{
            marginTop: "30px",
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            backgroundColor: "#1b5e20",
            color: "white",
            cursor: "pointer"
          }}
        >
          ← Retour
        </button>
      </div>

      <CustomAlert
        isOpen={showAlertModal}
        message={alertMessage}
        onClose={() => setShowAlertModal(false)}
      />
    </>
  );
}

export default ClientAppointments;