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
  startOfWeek,
  getDay,
  locales,
});

const DnDCalendar = withDragAndDrop(Calendar);

function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateToBlock, setSelectedDateToBlock] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/admin/appointment-requests")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data.requests)) return;
      
        const formatted = data.requests
          .filter(r => r.status === "scheduled")
          .map(r => ({
            id: r.id,
            title: r.customer_name,
            address: r.address,
            start: new Date(r.scheduled_start),
            end: new Date(r.scheduled_end),
          }));
      
        setEvents(formatted);


        fetch("http://127.0.0.1:5000/api/admin/availability")
          .then(res => res.json())
          .then(data => {
            if (!Array.isArray(data)) return;
            setBlockedDates(data.map(d => d.date));
          });
      });
  }, []);

  const moveEvent = async ({ event, start, end }) => {
    const updated = events.map(e =>
      e.id === event.id ? { ...e, start, end } : e
    );

    setEvents(updated);

    try {
      await fetch(
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
    } catch (error) {
      console.error("Failed to update appointment", error);
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

    const hasEvent = events.some(e => {
      const eventDate = new Date(e.start);
      eventDate.setHours(0, 0, 0, 0);
      return eventDate.getTime() === clickedDate.getTime();
    });

    if (hasEvent) return;

    setSelectedDateToBlock(clickedDate);
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
      <h2 style={{ marginBottom: "30px", fontWeight: 600 }}>
        📅 Planning des rendez-vous
      </h2>

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
        onSelectEvent={(event) => setSelectedEvent(event)}
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
              📌 {selectedEvent.title}
            </h3>

            <p>
              🗓 {selectedEvent.start.toLocaleDateString("fr-FR")}
            </p>
            <p>
              📍 {selectedEvent.address}
            </p>

            <div style={{ marginTop: "20px" }}>
              <button
                onClick={async () => {
                  const confirmDelete = window.confirm(
                    "Êtes-vous sûr de vouloir annuler ce rendez-vous ?"
                  );
                  if (!confirmDelete) return;

                  try {
                    await fetch(
                      `http://127.0.0.1:5000/api/admin/service-requests/${selectedEvent.id}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "cancelled" })
                      }
                    );

                    setEvents(prev =>
                      prev.filter(e => e.id !== selectedEvent.id)
                    );

                    setSelectedEvent(null);
                  } catch (error) {
                    console.error("Failed to cancel appointment", error);
                  }
                }}
                style={{
                  backgroundColor: "#c62828",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  marginRight: "10px"
                }}
              >
                ❌ Annuler le rendez-vous
              </button>

              <button
                onClick={() => setSelectedEvent(null)}
                style={{
                  backgroundColor: "#1b5e20",
                  color: "white",
                  padding: "8px 16px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCalendar;