import React, { useEffect, useState } from "react";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
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

function AdminCalendar() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/admin/service-requests")
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        const formatted = data
          .filter(r => r.status === "scheduled")
          .map(r => ({
            title: `${r.customer_name}`,
            start: new Date(r.scheduled_start_date),
            end: new Date(r.scheduled_end_date || r.scheduled_start_date),
          }));

        setEvents(formatted);
      });
  }, []);

  return (
    <div style={{ height: "80vh", background: "white", padding: "20px", borderRadius: "12px" }}>
      <h2 style={{ marginBottom: "20px" }}>📅 Planning</h2>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="month"
        style={{ height: "100%" }}
      />
    </div>
  );
}

export default AdminCalendar;