import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";

import { format, parse, startOfWeek, getDay } from "date-fns";
import fr from "date-fns/locale/fr";

const locales = { fr };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfdWeek,
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

  const fetchEvents = () => {
    fetch("http://127.0.0.1:5000/api/admin/appointment-requests")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data.requests)) return;

        const formatted = data.requests
          .filter(r => r.status === "scheduled")
          .map(r => ({
            id: r.id,
            title: r.customer_name,
            customer_name: r.customer_name, // ✅ Keep for searching
            address: r.address,
            start: new Date(r.scheduled_start),
            end: new Date(r.scheduled_end),
          }));

        setAllEvents(formatted); 
        setEvents(formatted);    //  Display all initially
      });
  };

  // Filter events when search changes
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

    fetch("http://127.0.0.1:5000/api/admin/availability")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setBlockedDates(data.map(d => d.date));
      });
  }, []);

  const moveEvent = async ({ event, start, end }) => {
    // Check for conflicts
    const conflictingEvents = events.filter(e => 
      e.id !== event.id && 
      ((start >= e.start && start < e.end) || 
       (end > e.start && end <= e.end) ||
       (start <= e.start && end >= e.end))
    );

    if (conflictingEvents.length > 0) {
      const conflictNames = conflictingEvents.map(e => e.customer_name).join(", ");
      const confirmMove = window.confirm(
        `⚠️ Cette date contient déjà ${conflictingEvents.length} rendez-vous avec : ${conflictNames}.\n\nVoulez-vous ajouter un autre rendez-vous ce jour-là ?`
      );
      
      if (!confirmMove) {
        // Refresh to reset the event position
        fetchEvents();
        return;
      }
    }

    // Update local state optimistically
    const updatedEvent = { ...event, start, end };
    setAllEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));
    setEvents(prev => prev.map(e => e.id === event.id ? updatedEvent : e));

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/service-requests/${event.id}`,
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
        alert(data.error || "Erreur lors de la mise à jour");
        fetchEvents(); // Revert on error
        return;
      }

      alert("✅ Rendez-vous déplacé avec succès!");
    } catch (error) {
      console.error("Failed to update appointment", error);
      alert("❌ Erreur de connexion");
      fetchEvents(); // Revert on error
    }
  };

  const handleSelectSlot = async (slotInfo) => {
    const clickedDate = new Date(slotInfo.start);
    clickedDate.setHours(0, 0, 0, 0);

    const isoDate = clickedDate.toISOString().split("T")[0];

    if (blockedDates.includes(isoDate)) {
      const confirmUnblock = window.confirm(
        "Cette date est bloquée. Voulez-vous la débloquer ?"
      );

      if (!confirmUnblock) return;

      try {
        await fetch(
          `http://127.0.0.1:5000/api/admin/availability/${isoDate}`,
          { method: "DELETE" }
        );

        setBlockedDates(prev => prev.filter(d => d !== isoDate));
      } catch (error) {
        console.error("Failed to unblock date", error);
      }

      return;
    }

    const overlappingEvents = events.filter(e => {
      const eventStart = new Date(e.start);
      const eventEnd = new Date(e.end);

      eventStart.setHours(0, 0, 0, 0);
      eventEnd.setHours(0, 0, 0, 0);

      return clickedDate >= eventStart && clickedDate <= eventEnd;
    });

    if (overlappingEvents.length > 0) {
      const names = overlappingEvents.map(e => e.title).join(", ");

      const confirmAdd = window.confirm(
        `⚠️ Cette date contient déjà un rendez-vous avec : ${names}.\n\nVoulez-vous ajouter un autre rendez-vous ce jour-là ?`
      );

      if (!confirmAdd) return;
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
    const confirmDelete = window.confirm(
      "Êtes-vous sûr de vouloir annuler ce rendez-vous ?"
    );
    
    if (!confirmDelete) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/appointments/${selectedEvent.id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        alert("Erreur lors de la suppression");
        return;
      }

      alert("Rendez-vous annulé avec succès!");
      setSelectedEvent(null);
      fetchEvents(); // Refresh calendar
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur de connexion");
    }
  };

  const handleUpdateAppointment = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:5000/api/admin/appointments/${selectedEvent.id}`,
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
        alert("Erreur lors de la modification");
        return;
      }

      alert("Rendez-vous modifié avec succès!");
      setSelectedEvent(null);
      setEditMode(false);
      fetchEvents();
    } catch (error) {
      console.error("Error:", error);
      alert("Erreur de connexion");
    }
  };

  const dayPropGetter = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);

    const isoDate = normalized.toISOString().split("T")[0];

    if (blockedDates.includes(isoDate)) {
      return {
        style: {
          backgroundColor: "#ffcdd2"
        }
      };
    }

    return {};
  };

  return (
    <div
      style={{
        background: "white",
        padding: "30px",
        borderRadius: "18px",
        boxShadow: "0 15px 40px rgba(0,0,0,0.08)",
        minHeight: "600px"
      }}
    >
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "30px" 
      }}>
        <h2 style={{ fontWeight: 600, margin: 0 }}>
          📅 Planning des rendez-vous
        </h2>

        {/* ✅ Search Bar */}
        <div style={{ position: "relative", width: "300px" }}>
          <input
            type="text"
            placeholder="🔍 Rechercher un client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 15px",
              border: "2px solid #e0e0e0",
              borderRadius: "8px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.3s"
            }}
            onFocus={(e) => e.target.style.borderColor = "#1b5e20"}
            onBlur={(e) => e.target.style.borderColor = "#e0e0e0"}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "18px",
                color: "#999"
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* ✅ Results counter */}
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
          zIndex: 999
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: "15px",
            minWidth: "320px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}>
            <h3 style={{ marginBottom: "15px" }}>
              📅 {selectedEvent.customer_name}
            </h3>

            {!editMode ? (
              <>
                <p><strong>Date début:</strong> {new Date(selectedEvent.start).toLocaleString('fr-FR')}</p>
                <p><strong>Date fin:</strong> {new Date(selectedEvent.end).toLocaleString('fr-FR')}</p>
                <p><strong>Adresse:</strong> {selectedEvent.address || "Non spécifiée"}</p>

                <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
                  <button
                    onClick={() => setEditMode(true)}
                    style={{
                      backgroundColor: "#1b5e20",
                      color: "white",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    ✏️ Modifier
                  </button>

                  <button
                    onClick={handleDeleteAppointment}
                    style={{
                      backgroundColor: "#c62828",
                      color: "white",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    🗑️ Annuler le rendez-vous
                  </button>

                  <button
                    onClick={() => setSelectedEvent(null)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      cursor: "pointer"
                    }}
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
                  style={{ display: "block", marginBottom: "15px", width: "100%" }}
                />

                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Date et heure de fin
                </label>
                <input
                  type="datetime-local"
                  value={editData.scheduled_end}
                  onChange={(e) => setEditData({ ...editData, scheduled_end: e.target.value })}
                  style={{ display: "block", marginBottom: "15px", width: "100%" }}
                />

                <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                  Adresse
                </label>
                <input
                  type="text"
                  value={editData.address}
                  onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                  style={{ display: "block", marginBottom: "15px", width: "100%" }}
                />

                <div style={{ display: "flex", gap: "10px" }}>
                  <button
                    onClick={handleUpdateAppointment}
                    style={{
                      backgroundColor: "#1b5e20",
                      color: "white",
                      padding: "8px 16px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    💾 Enregistrer
                  </button>

                  <button
                    onClick={() => setEditMode(false)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: "6px",
                      border: "1px solid #ccc",
                      cursor: "pointer"
                    }}
                  >
                    Annuler
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCalendar;