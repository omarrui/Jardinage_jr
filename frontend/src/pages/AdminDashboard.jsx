import React, { useState, useEffect } from "react";

function AdminDashboard({ goHome }) {
  const [adminSection, setAdminSection] = useState("home");

  const [requests, setRequests] = useState([]);
  const [clients, setClients] = useState([]);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");

  const [message, setMessage] = useState("");

  // 🔥 Create Client State
  const [showCreateClient, setShowCreateClient] = useState(false);
  const [createLogin, setCreateLogin] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const todayStr = new Date().toISOString().split("T")[0];

  /* =============================
     LOAD APPOINTMENTS
  ============================= */
  useEffect(() => {
    if (adminSection !== "appointments") return;

    fetch("http://127.0.0.1:5000/api/admin/service-requests")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
      });
  }, [adminSection]);

  /* =============================
     LOAD CLIENTS
  ============================= */
  const fetchClients = () => {
    fetch("http://127.0.0.1:5000/api/admin/customers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setClients(data);
      });
  };

  useEffect(() => {
    if (adminSection !== "clients") return;
    fetchClients();
  }, [adminSection]);

  /* =============================
     CONFIRM APPOINTMENT
  ============================= */
  const handleConfirm = async () => {
    if (!startDate) {
      alert("Select start date");
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

    setSelectedRequest(null);
  };

  /* =============================
     CREATE CLIENT
  ============================= */
  const handleCreateClient = async () => {
    const response = await fetch(
      "http://127.0.0.1:5000/api/admin/customers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClient.name,
          email: newClient.email,
          phone: newClient.phone,
          has_account: createLogin
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      alert(data.error);
      return;
    }

    if (data.temporary_password) {
      alert(
        "Client created.\nTemporary Password: " +
        data.temporary_password
      );
    } else {
      alert("Internal client created.");
    }

    setShowCreateClient(false);
    setNewClient({ name: "", email: "", phone: "" });
    setCreateLogin(false);
    fetchClients();
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      {/* =============================
         HOME
      ============================= */}
      {adminSection === "home" && (
        <>
          <button onClick={() => setAdminSection("appointments")}>
            Appointments
          </button>

          <button
            onClick={() => setAdminSection("clients")}
            style={{ marginLeft: "10px" }}
          >
            Clients
          </button>

          <button
            onClick={goHome}
            style={{ marginLeft: "10px" }}
          >
            Logout
          </button>
        </>
      )}

      {/* =============================
         APPOINTMENTS
      ============================= */}
      {adminSection === "appointments" && (
        <>
          <button onClick={() => setAdminSection("home")}>
            ⬅ Back
          </button>

          <h3>Appointments</h3>

          {requests.length === 0 ? (
            <p>No service requests found.</p>
          ) : (
            requests.map(req => (
              <div
                key={req.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px"
                }}
              >
                <strong>{req.customer_name}</strong>
                <p>Preferred: {req.preferred_date}</p>
                <p>Status: {req.status}</p>

                <button onClick={() => setSelectedRequest(req)}>
                  View
                </button>
              </div>
            ))
          )}
        </>
      )}

      {/* =============================
         CLIENTS
      ============================= */}
      {adminSection === "clients" && (
        <>
          <button onClick={() => setAdminSection("home")}>
            ⬅ Back
          </button>

          <h3>Clients</h3>

          <button
            onClick={() => setShowCreateClient(true)}
            style={{ fontSize: "18px", marginBottom: "15px" }}
          >
            ➕ Add Client
          </button>

          {clients.length === 0 ? (
            <p>No clients found.</p>
          ) : (
            clients.map(client => (
              <div
                key={client.id}
                style={{
                  border: "1px solid #ddd",
                  padding: "15px",
                  marginBottom: "15px",
                  borderRadius: "8px"
                }}
              >
                <strong>{client.name}</strong>
                <p>Email: {client.email}</p>
                <p>Phone: {client.phone}</p>
              </div>
            ))
          )}
        </>
      )}

      {/* =============================
         CREATE CLIENT MODAL
      ============================= */}
      {showCreateClient && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Create Client</h3>

            <input
              type="text"
              placeholder="Name"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />
            <br /><br />

            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />
            <br /><br />

            <input
              type="text"
              placeholder="Phone"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
            />
            <br /><br />

            <label>
              <input
                type="checkbox"
                checked={createLogin}
                onChange={() => setCreateLogin(!createLogin)}
              />
              Create login account
            </label>

            <br /><br />

            <button onClick={handleCreateClient}>
              Create
            </button>

            <button
              onClick={() => setShowCreateClient(false)}
              style={{ marginLeft: "10px" }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* =============================
         SCHEDULE MODAL
      ============================= */}
      {selectedRequest && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Schedule Service</h3>

            <input
              type="date"
              min={todayStr}
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <br /><br />

            <input
              type="date"
              min={startDate || todayStr}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
            <br /><br />

            <input
              type="time"
              value={scheduledTime}
              onChange={(e) => setScheduledTime(e.target.value)}
            />
            <br /><br />

            <button onClick={handleConfirm}>
              Confirm
            </button>

            <button
              onClick={() => setSelectedRequest(null)}
              style={{ marginLeft: "10px" }}
            >
              Close
            </button>
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
  padding: "20px",
  borderRadius: "10px"
};

export default AdminDashboard;