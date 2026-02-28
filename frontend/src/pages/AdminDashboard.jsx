import React, { useState, useEffect } from "react";
import AdminCalendar from "./AdminCalendar";

function AdminDashboard({ goHome }) {
  const [adminSection, setAdminSection] = useState("planning");
  const [clients, setClients] = useState([]);
  const [pendingRequests, setPendingRequests] = useState(0);
  const [appointmentRequests, setAppointmentRequests] = useState([]);

  const [showCreateClient, setShowCreateClient] = useState(false);
  const [createLogin, setCreateLogin] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [editingClient, setEditingClient] = useState(null);
  const [editData, setEditData] = useState({ email: "", phone: "" });

  const [clientToDelete, setClientToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [selectedClientForAppointment, setSelectedClientForAppointment] = useState(null);
  const [appointmentStart, setAppointmentStart] = useState("");
  const [appointmentEnd, setAppointmentEnd] = useState("");
  const [appointmentAddress, setAppointmentAddress] = useState("");

  const todayStr = new Date().toISOString().split("T")[0];

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

  /* =============================
     LOAD APPOINTMENT REQUESTS
  ============================= */
  const fetchAppointmentRequests = () => {
    fetch("http://127.0.0.1:5000/api/admin/appointment-requests")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data.requests)) {
          const pending = data.requests.filter(r => r.status === "pending");
          setPendingRequests(pending.length);
          setAppointmentRequests(pending);
        } else {
          setPendingRequests(0);
          setAppointmentRequests([]);
        }
      })
      .catch(() => {
        setPendingRequests(0);
        setAppointmentRequests([]);
      });
  };

  useEffect(() => {
    if (adminSection === "clients") {
      fetchClients();
    }
    fetchAppointmentRequests();
  }, [adminSection]);

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

    alert("Client créé avec succès");
    setShowCreateClient(false);
    setNewClient({ name: "", email: "", phone: "" });
    setCreateLogin(false);
    fetchClients();
  };

  /* =============================
     RESEND TEMP PASSWORD
  ============================= */
  const resendTempPassword = async (customerId) => {
    const response = await fetch(
      `http://127.0.0.1:5000/api/admin/resend-temp-password/${customerId}`,
      { method: "POST" }
    );

    const data = await response.json();
    alert(data.message || data.error);
    fetchClients();
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>

      {/* SIDEBAR */}
      <div
        style={{
          width: window.innerWidth < 768 ? "70px" : "250px",
          backgroundColor: "#1b5e20",
          color: "white",
          padding: "30px 20px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between"
        }}
      >
        <div>
          <h2 style={{ marginBottom: "40px" }}>Admin</h2>

          <button
            onClick={() => setAdminSection("planning")}
            style={sidebarBtn}
          >
            📅 Planning
          </button>

          <button
            onClick={() => setAdminSection("clients")}
            style={sidebarBtn}
          >
            👥 Clients
          </button>

          <button
            onClick={() => setAdminSection("appointments")}
            style={{ ...sidebarBtn, position: "relative" }}
          >
            📨 Rendez-vous
            {pendingRequests > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "6px",
                  right: "10px",
                  backgroundColor: "#c62828",
                  color: "white",
                  borderRadius: "50%",
                  padding: "2px 8px",
                  fontSize: "12px",
                  fontWeight: "bold"
                }}
              >
                {pendingRequests}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={goHome}
          style={{ ...sidebarBtn, backgroundColor: "#c62828", color: "white" }}
        >
          🚪 Déconnexion
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div
        style={{
          flex: 1,
          backgroundColor: "#f5f7f6",
          padding: "40px",
          overflowY: "auto"
        }}
      >

        {adminSection === "planning" && <AdminCalendar />}

        {adminSection === "appointments" && (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h3>Demandes de rendez-vous</h3>

            {appointmentRequests.length === 0 ? (
              <p>Aucune demande pour le moment.</p>
            ) : (
              appointmentRequests.map((req) => (
                <div
                  key={req.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "white"
                  }}
                >
                  <strong>Client ID : {req.customer_id}</strong>
                  <p>Date demandée : {req.preferred_date}</p>
                  <p>Adresse : {req.address}</p>
                  <p>Description : {req.description || "Aucune description"}</p>

                  <button
                    onClick={() => {
                      setSelectedClientForAppointment({
                        id: req.customer_id,
                        request_id: req.id,
                        name: "Client"
                      });
                    }}
                    style={{
                      marginTop: "10px",
                      backgroundColor: "#1b5e20",
                      color: "white",
                      padding: "6px 12px",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer"
                    }}
                  >
                    🗓 Donner un rendez-vous
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {adminSection === "clients" && (
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>

            <h3>Clients</h3>

            <button
              onClick={() => setShowCreateClient(true)}
              style={{ fontSize: "18px", marginBottom: "15px" }}
            >
              ➕ Ajouter un client
            </button>

            {clients.length === 0 ? (
              <p>Aucun client trouvé.</p>
            ) : (
              clients.map(client => (
                <div
                  key={client.id}
                  style={{
                    border: "1px solid #ddd",
                    padding: "15px",
                    marginBottom: "15px",
                    borderRadius: "8px",
                    background: "white"
                  }}
                >
                  <strong>{client.name}</strong>
                  <p>Email : {client.email}</p>
                  <p>Téléphone : {client.phone}</p>

                  <p>
                    Statut :{" "}
                    {client.must_change_password ? (
                      <span>🟠 Compte non activé</span>
                    ) : (
                      <span>🟢 Actif</span>
                    )}
                  </p>

                  <button
                    onClick={() => setSelectedClientForAppointment(client)}
                    style={{ marginRight: "8px" }}
                  >
                    🗓 Donner un rendez-vous
                  </button>

                  {/* RESEND TEMP PASSWORD (only for login accounts not activated) */}
                  {client.has_account && client.must_change_password && (
                    <button
                      onClick={() => resendTempPassword(client.id)}
                      style={{ marginRight: "8px" }}
                    >
                      🔁 Renvoyer mot de passe
                    </button>
                  )}

                  {/* EDIT BUTTON */}
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setEditData({
                        email: client.email,
                        phone: client.phone
                      });
                    }}
                    style={{ marginRight: "8px" }}
                  >
                    ✏ Modifier
                  </button>

                  {/* DELETE BUTTON (only if not activated) */}
                  {client.must_change_password && (
                    <button
                      onClick={() => {
                        const confirmDelete = window.confirm(
                          "⚠️ Êtes-vous sûr de vouloir supprimer ce client ?"
                        );
                        if (!confirmDelete) return;

                        fetch(
                          `http://127.0.0.1:5000/api/admin/customers/${client.id}`,
                          { method: "DELETE" }
                        ).then(() => fetchClients());
                      }}
                      style={{
                        backgroundColor: "#c62828",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "6px",
                        cursor: "pointer"
                      }}
                    >
                      🗑 Supprimer
                    </button>
                  )}
                  {editingClient?.id === client.id && (
                    <div style={{ marginTop: "15px" }}>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        style={{ display: "block", marginBottom: "8px", width: "100%" }}
                      />

                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        style={{ display: "block", marginBottom: "10px", width: "100%" }}
                      />

                      <button
                        onClick={async () => {
                          await fetch(
                            `http://127.0.0.1:5000/api/admin/customers/${client.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(editData)
                            }
                          );
                          setEditingClient(null);
                          fetchClients();
                        }}
                        style={{
                          backgroundColor: "#1b5e20",
                          color: "white",
                          padding: "6px 12px",
                          border: "none",
                          borderRadius: "6px",
                          marginRight: "8px",
                          cursor: "pointer"
                        }}
                      >
                        💾 Enregistrer
                      </button>

                      <button
                        onClick={() => setEditingClient(null)}
                        style={{ padding: "6px 12px", borderRadius: "6px" }}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

          </div>
        )}

        {/* CREATE CLIENT MODAL */}
        {showCreateClient && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3 style={{ marginBottom: "15px" }}>Créer un client</h3>

              <input
                type="text"
                placeholder="Nom"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                style={{ display: "block", marginBottom: "10px", width: "100%" }}
              />

              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                style={{ display: "block", marginBottom: "10px", width: "100%" }}
              />

              <input
                type="text"
                placeholder="Téléphone"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
                style={{ display: "block", marginBottom: "15px", width: "100%" }}
              />

              <label style={{ display: "block", marginBottom: "15px" }}>
                <input
                  type="checkbox"
                  checked={createLogin}
                  onChange={() => setCreateLogin(!createLogin)}
                />
                {" "}Créer un compte de connexion
              </label>

              <button
                onClick={handleCreateClient}
                style={{
                  backgroundColor: "#1b5e20",
                  color: "white",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "8px",
                  marginRight: "10px",
                  cursor: "pointer"
                }}
              >
                Créer
              </button>

              <button
                onClick={() => setShowCreateClient(false)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* APPOINTMENT MODAL */}
        {selectedClientForAppointment && (
          <div style={overlayStyle}>
            <div style={modalStyle}>
              <h3 style={{ marginBottom: "15px" }}>
                Rendez-vous pour {selectedClientForAppointment.name}
              </h3>

              <input
                type="date"
                min={todayStr}
                value={appointmentStart}
                onChange={(e) => setAppointmentStart(e.target.value)}
                style={{ display: "block", marginBottom: "10px", width: "100%" }}
              />

              <input
                type="date"
                min={appointmentStart || todayStr}
                value={appointmentEnd}
                onChange={(e) => setAppointmentEnd(e.target.value)}
                style={{ display: "block", marginBottom: "10px", width: "100%" }}
              />

              
              <input
                type="text"
                placeholder="Adresse d'intervention"
                value={appointmentAddress}
                onChange={(e) => setAppointmentAddress(e.target.value)}
                style={{ display: "block", marginBottom: "15px", width: "100%" }}
              />
              

              <button
                onClick={async () => {
                  if (!appointmentStart || !appointmentEnd || !appointmentAddress) {
                    alert("Veuillez remplir tous les champs");
                    return;
                  }

                  // Add time to dates
                  const scheduledStart = `${appointmentStart}T09:00:00`;
                  const scheduledEnd = `${appointmentEnd}T17:00:00`;

                  // Build payload
                  const payload = {
                    scheduled_start: scheduledStart,
                    scheduled_end: scheduledEnd,
                    address: appointmentAddress
                  };

                  // Add request_id OR customer_id
                  if (selectedClientForAppointment.request_id) {
                    payload.request_id = selectedClientForAppointment.request_id;
                  } else {
                    payload.customer_id = selectedClientForAppointment.id;
                  }

                  const response = await fetch(
                    "http://127.0.0.1:5000/api/admin/appointments",  // ✅ CHANGED
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload)  // ✅ CHANGED
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    alert(data.error || "Erreur lors de la création");
                    return;
                  }

                  alert("Rendez-vous créé avec succès!");

                  fetchAppointmentRequests();
                  if (adminSection === "clients") {
                    fetchClients();
                  }

                  setSelectedClientForAppointment(null);
                  setAppointmentStart("");
                  setAppointmentEnd("");
                  setAppointmentAddress("");
                }}
                style={{
                  backgroundColor: "#1b5e20",
                  color: "white",
                  padding: "8px 14px",
                  border: "none",
                  borderRadius: "8px",
                  marginRight: "10px",
                  cursor: "pointer"
                }}
              >
                Confirmer
              </button>

              <button
                onClick={() => setSelectedClientForAppointment(null)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const sidebarBtn = {
  background: "rgba(255,255,255,0.08)",
  border: "none",
  color: "white",
  padding: "12px 15px",
  textAlign: "left",
  cursor: "pointer",
  fontSize: "15px",
  borderRadius: "8px",
  marginBottom: "12px",
  width: "100%",
  transition: "all 0.2s ease"
};

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
  borderRadius: "10px",
  minWidth: "300px"
};

export default AdminDashboard;