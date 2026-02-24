import React, { useState, useEffect } from "react";

function AdminDashboard({ goHome }) {
  const [adminSection, setAdminSection] = useState("home");
  const [clients, setClients] = useState([]);

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
  const [appointmentTime, setAppointmentTime] = useState("");

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

  useEffect(() => {
    if (adminSection === "clients") {
      fetchClients();
    }
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
    <div style={{ maxWidth: "1000px", margin: "40px auto" }}>
      <h2 className="section-title">Espace administrateur</h2>

      {adminSection === "home" && (
        <>
          <button onClick={() => setAdminSection("clients")}>
            Clients
          </button>

          <button onClick={goHome} style={{ marginLeft: "10px" }}>
            Déconnexion
          </button>
        </>
      )}

      {adminSection === "clients" && (
        <>
          <button onClick={() => setAdminSection("home")}>
            ⬅ Retour
          </button>

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
                  borderRadius: "8px"
                }}
              >
                <strong>{client.name}</strong>

                {editingClient?.id === client.id ? (
                  <>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) =>
                        setEditData({ ...editData, email: e.target.value })
                      }
                    />

                    <input
                      type="text"
                      value={editData.phone}
                      onChange={(e) =>
                        setEditData({ ...editData, phone: e.target.value })
                      }
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
                    >
                      💾 Enregistrer
                    </button>

                    <button onClick={() => setEditingClient(null)}>
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <p>Email : {client.email}</p>
                    <p>Téléphone : {client.phone}</p>

                    <button
                      onClick={() => {
                        setEditingClient(client);
                        setEditData({
                          email: client.email,
                          phone: client.phone
                        });
                      }}
                    >
                      ✏ Modifier
                    </button>
                  </>
                )}

                <p>
                  Statut :{" "}
                  {client.must_change_password ? (
                    <span>🟠 Compte non activé</span>
                  ) : (
                    <span>🟢 Actif</span>
                  )}
                </p>

                {/* GIVE APPOINTMENT BUTTON */}
                <button
                  onClick={() => setSelectedClientForAppointment(client)}
                  style={{ marginRight: "8px" }}
                >
                  🗓 Donner un rendez-vous
                </button>

                {client.must_change_password && (
                  <>
                    <button onClick={() => resendTempPassword(client.id)}>
                      🔁 Renvoyer mot de passe
                    </button>

                    <button
                      onClick={() => setClientToDelete(client)}
                      style={{
                        marginLeft: "8px",
                        backgroundColor: "#c62828",
                        color: "white",
                        border: "none",
                        padding: "6px 12px",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}
                    >
                      🗑 Supprimer
                    </button>
                  </>
                )}
              </div>
            ))
          )}
        </>
      )}

      {/* APPOINTMENT MODAL */}
      {selectedClientForAppointment && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>
              Rendez-vous pour {selectedClientForAppointment.name}
            </h3>

            <input
              type="date"
              min={todayStr}
              value={appointmentStart}
              onChange={(e) => setAppointmentStart(e.target.value)}
            />

            <input
              type="date"
              min={appointmentStart || todayStr}
              value={appointmentEnd}
              onChange={(e) => setAppointmentEnd(e.target.value)}
            />

            <input
              type="time"
              value={appointmentTime}
              onChange={(e) => setAppointmentTime(e.target.value)}
            />

            <br /><br />

            <button
              onClick={async () => {
                await fetch(
                  "http://127.0.0.1:5000/api/admin/create-appointment",
                  {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      customer_id: selectedClientForAppointment.id,
                      scheduled_start_date: appointmentStart,
                      scheduled_end_date: appointmentEnd,
                      scheduled_time: appointmentTime
                    })
                  }
                );

                setSelectedClientForAppointment(null);
                setAppointmentStart("");
                setAppointmentEnd("");
                setAppointmentTime("");
              }}
            >
              Confirmer
            </button>

            <button
              onClick={() => setSelectedClientForAppointment(null)}
              style={{ marginLeft: "10px" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* DELETE MODAL */}
      {clientToDelete && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Confirmer la suppression</h3>

            <p>
              Supprimer {clientToDelete.name} ?
            </p>

            <button onClick={() => setClientToDelete(null)}>
              Annuler
            </button>

            <button
              disabled={isDeleting}
              onClick={async () => {
                setIsDeleting(true);

                await fetch(
                  `http://127.0.0.1:5000/api/admin/customers/${clientToDelete.id}`,
                  { method: "DELETE" }
                );

                setIsDeleting(false);
                setClientToDelete(null);
                fetchClients();
              }}
              style={{ marginLeft: "10px", backgroundColor: "#c62828", color: "white" }}
            >
              Supprimer
            </button>
          </div>
        </div>
      )}

      {/* CREATE CLIENT MODAL */}
      {showCreateClient && (
        <div style={overlayStyle}>
          <div style={modalStyle}>
            <h3>Créer un client</h3>

            <input
              type="text"
              placeholder="Nom"
              value={newClient.name}
              onChange={(e) =>
                setNewClient({ ...newClient, name: e.target.value })
              }
            />

            <input
              type="email"
              placeholder="Email"
              value={newClient.email}
              onChange={(e) =>
                setNewClient({ ...newClient, email: e.target.value })
              }
            />

            <input
              type="text"
              placeholder="Téléphone"
              value={newClient.phone}
              onChange={(e) =>
                setNewClient({ ...newClient, phone: e.target.value })
              }
            />

            <label>
              <input
                type="checkbox"
                checked={createLogin}
                onChange={() => setCreateLogin(!createLogin)}
              />
              Créer un compte
            </label>

            <br /><br />

            <button onClick={handleCreateClient}>Créer</button>
            <button onClick={() => setShowCreateClient(false)} style={{ marginLeft: "10px" }}>
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

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