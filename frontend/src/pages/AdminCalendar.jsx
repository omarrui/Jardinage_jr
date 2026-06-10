import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { apiUrl } from "../api/apiConfig";

import { format, parse, startOfWeek, getDay } from "date-fns";
import fr from "date-fns/locale/fr";
import CustomAlert from "../components/CustomAlert";
import "./AdminDashboard.css";

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateToBlock, setSelectedDateToBlock] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [editData, setEditData] = useState({
    scheduled_start: "",
    scheduled_end: "",
    address: ""
  });

  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);

  const showAlert = (message) => {
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  const fetchEvents = () => {
    fetch(apiUrl("/api/admin/appointment-requests"))
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data.requests)) return;

        const formatted = data.requests
          .filter(r => r.status === "scheduled")
          .map(r => ({
            id: r.id,
            title: r.customer_name,
            customer_name: r.customer_name,
            address: r.address,
            start: new Date(r.scheduled_start),
            end: new Date(r.scheduled_end),
          }));

        setAllEvents(formatted); 
        setEvents(formatted);
      })
      .catch((error) => {
        showAlert("Erreur de connexion");
      });
  };

  useEffect(() => {
    if (!searchQuery.trim()) {
      setEvents(allEvents);
      return;
    }

    const filtered = allEvents.filter(event =>
      event.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.address?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setEvents(filtered);
  }, [searchQuery, allEvents]);

  useEffect(() => {
    fetchEvents();

    const fetchAvailability = () => {
      fetch(apiUrl("/api/admin/availability"))
        .then(res => res.json())
        .then(data => {
          if (!Array.isArray(data)) return;
          setBlockedDates(data.map(d => d.date));
        })
        .catch(() => {
          showAlert("Erreur de connexion");
        });
    };

    fetchAvailability();

    const interval = setInterval(() => {
      fetchEvents();
      fetchAvailability();
    }, 10000); // 10 seconds

    return () => clearInterval(interval);
  }, []);

  const moveEvent = async ({ event, start, end }) => {
    const conflictingEvents = events.filter(e => 
      e.id !== event.id && 
      ((start >= e.start && start < e.end) || 
       (end > e.start && end <= e.end) ||
       (start <= e.start && end >= e.end))
    );

    if (conflictingEvents.length > 0) {
      const conflictNames = conflictingEvents.map(e => e.customer_name).join(", ");
      showAlert(`⚠️ Cette date contient déjà ${conflictingEvents.length} rendez-vous avec : ${conflictNames}. Déplacement annulé.`);
      fetchEvents();
      return;
    }

    const updatedEvent = { ...event, start, end };
    setAllEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));

    try {
      const response = await fetch(
        apiUrl(`/api/admin/service-requests/${event.id}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "scheduled",
            scheduled_start: start.toISOString(),
            scheduled_end: end.toISOString()
          })
        }
      );

      const data = await response.json();
 
      if (!response.ok) {
        showAlert(data.error || "Erreur lors de la mise à jour");
        fetchEvents();
        return;
      }

      showAlert("✅ Rendez-vous déplacé avec succès!");
    } catch (error) {
      console.error("Failed to update appointment", error);
      showAlert("❌ Erreur de connexion");
      fetchEvents();
    }
  };

  const handleSelectSlot = async (slotInfo) => {
    const clickedDate = new Date(slotInfo.start);
    clickedDate.setHours(0, 0, 0, 0);

    const isoDate = clickedDate.toISOString().split("T")[0];

    if (blockedDates.includes(isoDate)) {
      showAlert("⚠️ Cette date est actuellement bloquée pour les rendez‑vous. Supprimez-la manuellement si vous voulez la débloquer.");
      return;
    }

    setSelectedDateToBlock(clickedDate);
  };

  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
    setEditMode(false);
    setEditData({
      scheduled_start: event.start.toISOString().slice(0, 16),
      scheduled_end: event.end.toISOString().slice(0, 16),
      address: event.address || ""
    });
  };

  const handleDeleteAppointment = async () => {
    try {
      const response = await fetch(
        apiUrl(`/api/admin/service-requests/${selectedEvent.id}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "cancelled" })
        }
      );

      if (!response.ok) {
        showAlert("Erreur lors de la suppression");
        return;
      }

      showAlert("Rendez-vous annulé avec succès!");
      setSelectedEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error:", error);
      showAlert("Erreur de connexion");
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      const response = await fetch(
        apiUrl(`/api/admin/service-requests/${selectedEvent.id}`),
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            scheduled_start: editData.scheduled_start,
            scheduled_end: editData.scheduled_end,
            address: editData.address
          })
        }
      );

      if (!response.ok) {
        showAlert("Erreur lors de la modification");
        return;
      }

      showAlert("Rendez-vous modifié avec succès!");
      setSelectedEvent(null);
      setEditMode(false);
      fetchEvents();
    } catch (error) {
      console.error("Error:", error);
      showAlert("Erreur de connexion");
    }
  };

  const dayPropGetter = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const isoDate = normalized.toISOString().split("T")[0];

    if (blockedDates.includes(isoDate)) {
      return {
        style: {
          backgroundColor: "#ffcdd2",
          color: "#7f1d1d"
        }
      };
    }

    if (normalized < today) {
      return {
        style: {
          backgroundColor: "#eef0ed",
          color: "#8a9388"
        }
      };
    }

    return {};
  };

  return (
    <div className="admin-calendar-card">
      <div className="admin-calendar-toolbar">
        <h2>Planning des rendez-vous</h2>

        <div className="admin-search">
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="admin-clear-search"
            >
              x
            </button>
          )}
        </div>
      </div>

      {searchQuery && (
        <p style={{ 
          marginBottom: "15px", 
          color: "#666",
          fontSize: "14px" 
        }}>
          {events.length} résultat{events.length !== 1 ? 's' : ''} trouvé{events.length !== 1 ? 's' : ''}
        </p>
      )}

      <DnDCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        culture="fr"
        onEventDrop={moveEvent}
        onEventResize={moveEvent}
        resizable
        selectable
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        dayPropGetter={dayPropGetter}
        style={{ minHeight: "600px" }}
      />
      {selectedEvent && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3 style={{ marginBottom: "15px" }}>
              {selectedEvent.customer_name}
            </h3>

            {!editMode ? (
              <>
                <p><strong>Date début:</strong> {new Date(selectedEvent.start).toLocaleString('fr-FR')}</p>
                <p><strong>Date fin:</strong> {new Date(selectedEvent.end).toLocaleString('fr-FR')}</p>
                <p><strong>Adresse:</strong> {selectedEvent.address || "Non spécifiée"}</p>

                <div className="admin-modal-actions">
                  <button
                    onClick={() => setEditMode(true)}
                    className="admin-btn primary"
                  >
                    Modifier
                  </button>

                  <button
                    onClick={handleDeleteAppointment}
                    className="admin-btn danger"
                  >
                    Annuler le rendez-vous
                  </button>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="admin-btn"
                  >
                    Fermer
                  </button>
                </div>
              </>
            ) : (
              <>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Date et heure de début
                </label>
                <input
                  type="datetime-local"
                  value={editData.scheduled_start}
                  onChange={(e) => setEditData({ ...editData, scheduled_start: e.target.value })}
                  className="admin-input"
                  style={{ marginBottom: "15px" }}
                />

                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Date et heure de fin
                </label>
                <input
                  type="datetime-local"
                  value={editData.scheduled_end}
                  onChange={(e) => setEditData({ ...editData, scheduled_end: e.target.value })}
                  className="admin-input"
                  style={{ marginBottom: "15px" }}
                />

                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Adresse
                </label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  className="admin-input"
                  style={{ marginBottom: "15px" }}
                />

                <div className="admin-modal-actions">
                  <button
                    onClick={handleUpdateAppointment}
                    className="admin-btn primary"
                  >
                    Enregistrer
                  </button>

                  <button
                    onClick={() => setEditMode(false)}
                    className="admin-btn"
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      <CustomAlert
        isOpen={showAlertModal}
        message={alertMessage}
        onClose={() => setShowAlertModal(false)}
      />
    </div>
  );
}

export default AdminCalendar;
