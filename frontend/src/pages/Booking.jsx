// This page lets a logged-in customer request a gardening service
import React from "react";
import { useState, useEffect } from "react";

function Booking({ goHome }) {

  // Store form inputs
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  // Store customer's requests
  const [appointments, setAppointments] = useState([]);
  const [showAppointments, setShowAppointments] = useState(false);

  // Message
  const [message, setMessage] = useState("");

  // Auto-hide message
  useEffect(() => {
    if (!message) return;

    const timer = setTimeout(() => {
      setMessage("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [message]);

  // Fetch customer's own requests
  useEffect(() => {
    const customerId = localStorage.getItem("customer_id");
    if (!customerId) return;

    fetch(`http://127.0.0.1:5000/api/customer/service-requests?customer_id=${customerId}`)
      .then((res) => res.json())
      .then((data) => {
        console.log("DATA FROM BACKEND:", data);
        if (Array.isArray(data)) {
          setAppointments(data);
        }
      })
      .catch(() => {
        setAppointments([]);
      });
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();

    const customerId = localStorage.getItem("customer_id");

    if (!customerId) {
      setMessage("Please log in before requesting a service.");
      return;
    }

    if (!date) {
      setMessage("Please select a date.");
      return;
    }

    const response = await fetch("http://127.0.0.1:5000/api/service-requests", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        customer_id: customerId,
        preferred_date: date,
        description: description || ""
      }),
    });

    const data = await response.json();

    if (data.error) {
      setMessage(data.error);
    } else {
      setMessage("Service request sent successfully!");
      setDate("");
      setDescription("");
    }
  }

  const todayStr = new Date().toISOString().split("T")[0];

  return (
    <div>
      <h2>Request a Gardening Service</h2>

      <button onClick={goHome} style={{ marginBottom: "10px" }}>
        Home
      </button>

      <form onSubmit={handleSubmit}>

        <input
          type="date"
          value={date}
          min={todayStr}
          onChange={(e) => setDate(e.target.value)}
        />

        <br /><br />

        <textarea
          placeholder="Describe what you need (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          style={{ width: "250px" }}
        />

        <br /><br />

        <button type="submit">Request Service</button>
      </form>

      <button
        onClick={() => setShowAppointments(!showAppointments)}
        style={{ marginTop: "15px" }}
      >
        {showAppointments ? "Hide My Requests" : "See My Requests"}
      </button>

      {showAppointments && appointments.length > 0 && (
        <div style={{ marginTop: "15px" }}>
          <h4>My Service Requests:</h4>
          <ul>
            {appointments.map((appt) => (
              <li key={appt.id}>
                <strong>Requested:</strong> {appt.preferred_date} <br />
                <strong>status:</strong> {appt.status} <br />
                {appt.status === "scheduled" && (
                   <>
                    <strong>Start:</strong> {appt.scheduled_start_date} <br />
                    <strong>End:</strong> {appt.scheduled_end_date || "—"} <br />
                    <strong>Time:</strong> {appt.scheduled_time || "—"} 
                   </>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {message && (
        <div
          style={{
            marginTop: "15px",
            padding: "10px",
            borderRadius: "6px",
            backgroundColor: message.includes("success")
              ? "#d4edda"
              : "#f8d7da",
            color: message.includes("success")
              ? "#155724"
              : "#721c24",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}

export default Booking;