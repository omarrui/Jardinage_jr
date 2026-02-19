// AdminDashboard.jsx
import React, { useState, useEffect } from "react";

function AdminDashboard({ goHome }) {
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [message, setMessage] = useState("");

  // ✅ Define today string HERE (not inside JSX)
  const todayStr = new Date().toISOString().split("T")[0];

  // Fetch all service requests
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/admin/service-requests")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRequests(data);
        }
      })
      .catch(() => {
        setMessage("Failed to load service requests.");
      });
  }, []);

  // Confirm appointment
  const handleConfirm = async () => {
    if (!startDate) {
      alert("Please select a start date");
      return;
    }

    if (endDate && endDate < startDate) {
      alert("End date cannot be before start date.");
      return;
    }

    await fetch(
      `http://127.0.0.1:5000/api/admin/service-requests/${selectedRequest.id}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "scheduled",
          scheduled_start_date: startDate,
          scheduled_end_date: endDate,
          scheduled_time: scheduledTime
        })
      }
    );

    // Update UI without reloading page
    setRequests(prev =>
      prev.map(req =>
        req.id === selectedRequest.id
          ? { ...req, status: "scheduled" }
          : req
      )
    );

    setSelectedRequest(null);
    setStartDate("");
    setEndDate("");
    setScheduledTime("");
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <button onClick={goHome} style={{ marginBottom: "15px" }}>
        Home
      </button>

      {requests.length === 0 ? (
        <p>No service requests found.</p>
      ) : (
        <div>
          <h3>Service Requests:</h3>
          <ul>
            {requests.map((req) => (
              <li key={req.id} style={{ marginBottom: "15px" }}>
                <strong>{req.customer_name}</strong><br />
                Preferred Date: {req.preferred_date}<br />
                Status: {req.status}<br />
                <button onClick={() => setSelectedRequest(req)}>
                  View
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* MODAL */}
      {selectedRequest && (
        <div style={overlayStyle}>
          <div style={modalStyle}>

            {/* LEFT SIDE */}
            <div style={leftStyle}>
              <h3>Client Details</h3>
              <p><strong>Name:</strong> {selectedRequest.customer_name}</p>
              <p><strong>Email:</strong> {selectedRequest.customer_email}</p>
              <p>
                <strong>Phone:</strong>{" "}
                <a href={`tel:${selectedRequest.customer_phone}`}>
                  {selectedRequest.customer_phone}
                </a>
              </p>
              <hr />
              <p><strong>Description:</strong> {selectedRequest.description}</p>
              <p><strong>Status:</strong> {selectedRequest.status}</p>
            </div>

            {/* RIGHT SIDE */}
            <div style={rightStyle}>
              <h3>Schedule Service</h3>

              <label>Start Date:</label><br />
              <input
                type="date"
                value={startDate}
                min={todayStr}   // ✅ past dates grey
                onChange={(e) => setStartDate(e.target.value)}
              />
              <br /><br />

              <label>End Date (optional):</label><br />
              <input
                type="date"
                value={endDate}
                min={startDate || todayStr}   // ✅ cannot be before start
                onChange={(e) => setEndDate(e.target.value)}
              />
              <br /><br />

              <label>Time:</label><br />
              <input
                type="time"
                value={scheduledTime}
                onChange={(e) => setScheduledTime(e.target.value)}
              />
              <br /><br />

              <button onClick={handleConfirm}>
                Confirm Appointment
              </button>

              <button
                onClick={() => setSelectedRequest(null)}
                style={{ marginLeft: "10px" }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {message && <p>{message}</p>}
    </div>
  );
}

/* STYLES */

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const modalStyle = {
  backgroundColor: "white",
  width: "800px",
  padding: "20px",
  display: "flex",
  gap: "40px",
  borderRadius: "10px"
};

const leftStyle = { flex: 1 };
const rightStyle = { flex: 1 };

export default AdminDashboard;
