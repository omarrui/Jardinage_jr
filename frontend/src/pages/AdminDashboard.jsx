import React, { useState, useEffect } from "react";
import AdminCalendar from "./AdminCalendar";
import CustomAlert from "../components/CustomAlert";
import "./AdminDashboard.css";
import { adminFetch } from "../api/apiConfig";

function AdminDashboard({ goHome }) {
  const [adminSection, setAdminSection] = useState("planning");
  const [clients, setClients] = useState([]);
  const [allClients, setAllClients] = useState([]);
  const [clientSearchQuery, setClientSearchQuery] = useState("");
  const [pendingRequests, setPendingRequests] = useState(0);
  const [appointmentRequests, setAppointmentRequests] = useState([]);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertModal, setShowAlertModal] = useState(false);

  const showAlert = (message) => {
    setAlertMessage(message);
    setShowAlertModal(true);
  };

  // Confirmation modal state and helper
  const [confirmMessage, setConfirmMessage] = useState("");
  const [confirmAction, setConfirmAction] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const showConfirm = (message, action) => {
    setConfirmMessage(message);
    setConfirmAction(() => action);
    setShowConfirmModal(true);
  };

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
  const [appointmentStartTime, setAppointmentStartTime] = useState("09:00");
  const [appointmentEndTime, setAppointmentEndTime] = useState("17:00");

  const todayStr = new Date().toISOString().split("T")[0];

  /* 
     LOAD CLIENTS
   */
  const fetchClients = () => {
    adminFetch("/api/admin/customers")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllClients(data);
          setClients(data);
        }
      });
  };

  /* 
     LOAD APPOINTMENT REQUESTS
   */
  const fetchAppointmentRequests = () => {
    adminFetch("/api/admin/appointment-requests")
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

  // Load clients when switching to clients section
  useEffect(() => {
    if (adminSection === "clients") {
      fetchClients();
    }
  }, [adminSection]);

  // Always keep appointment requests updated (badge + list)
  useEffect(() => {
    // Initial load
    fetchAppointmentRequests();

    const interval = setInterval(() => {
      fetchAppointmentRequests();
    }, 5000); 

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!clientSearchQuery.trim()) {
      setClients(allClients);
      return;
    }

    const filtered = allClients.filter(client =>
      client.name.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.email.toLowerCase().includes(clientSearchQuery.toLowerCase()) ||
      client.phone.toLowerCase().includes(clientSearchQuery.toLowerCase())
    );

    setClients(filtered);
  }, [clientSearchQuery, allClients]);

  /* 
     CREATE CLIENT
   */
  const handleCreateClient = async () => {
    // only require email if creating a login account
    if (createLogin && !newClient.email) {
      alert("L'email est requis pour créer un compte de connexion");
      return;
    }

    // basic validation for name and phone (always required)
    if (!newClient.name || !newClient.phone) {
      alert("Le nom et le téléphone sont requis");
      return;
    }

    const response = await adminFetch(
      "/api/admin/customers",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClient.name,
          email: newClient.email || null, 
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

  /* 
     RESEND TEMP PASSWORD
   */
  const resendTempPassword = async (customerId) => {
    const response = await adminFetch(
      `/api/admin/resend-temp-password/${customerId}`,
      { method: "POST" }
    );

    const data = await response.json();
    showAlert(data.message || data.error);
    fetchClients();
  };

  
  return (
    <div className="admin-shell">

      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <div>
          <h2 className="admin-sidebar-title">Admin <span>JR Jardinage</span></h2>

          <button
            onClick={() => setAdminSection("planning")}
            className={`admin-nav-button ${adminSection === "planning" ? "is-active" : ""}`}
          >
            <span>Planning</span>
          </button>

          <button
            onClick={() => setAdminSection("clients")}
            className={`admin-nav-button ${adminSection === "clients" ? "is-active" : ""}`}
          >
            <span>Clients</span>
          </button>

          <button
            onClick={() => setAdminSection("appointments")}
            className={`admin-nav-button ${adminSection === "appointments" ? "is-active" : ""}`}
          >
            <span>Rendez-vous</span>
            {pendingRequests > 0 && (
              <span className="admin-badge">
                {pendingRequests}
              </span>
            )}
          </button>
        </div>

        <button
          onClick={goHome}
          className="admin-nav-button is-danger"
        >
          <span>Déconnexion</span>
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <div className="admin-top">
          <div className="admin-title-card">
            <p>Espace de gestion</p>
            <h1>{adminSection === "planning" ? "Planning" : adminSection === "clients" ? "Clients" : "Demandes"}</h1>
          </div>
          <div className="admin-stat-card">
            <span>Demandes en attente</span>
            <strong>{pendingRequests}</strong>
          </div>
          <div className="admin-stat-card">
            <span>Clients chargés</span>
            <strong>{allClients.length}</strong>
          </div>
        </div>

        {adminSection === "planning" && <AdminCalendar />}

        {adminSection === "appointments" && (
          <section className="admin-panel">
            <div className="admin-panel-header">
              <h2>Demandes de rendez-vous</h2>
            </div>

            {appointmentRequests.length === 0 ? (
              <p className="admin-empty">Aucune demande pour le moment.</p>
            ) : (
              appointmentRequests.map((req) => (
                <div
                  key={req.id}
                  className="admin-card"
                  style={{
                    background: "white"
                  }}
                >
                  <strong>Client : {req.customer_name || `ID ${req.customer_id}`}</strong>
                  <p>Téléphone : {req.customer_phone || "Non renseigné"}</p>
                  <p>Date demandée : {req.preferred_date}</p>
                  <p>Adresse : {req.address}</p>
                  <p>Description : {req.description || "Aucune description"}</p>

                  <div className="admin-actions">
                    <button
                      className="admin-btn primary"
                      onClick={() => {
                        setSelectedClientForAppointment({
                          id: req.customer_id,
                          request_id: req.id,
                          name: req.customer_name || "Client"
                        });
                        setAppointmentAddress(req.address || "");
                      }}
                    >
                      Donner un rendez-vous
                    </button>
                    <button
                      className="admin-btn danger"
                      onClick={async () => {
                        showConfirm("Refuser cette demande de rendez-vous ?", async () => {
                          try {
                            const response = await adminFetch(
                              `/api/admin/appointment-requests/${req.id}/cancel`,
                              {
                                method: "PUT",
                                headers: { "Content-Type": "application/json" }
                              }
                            );

                            const data = await response.json();

                            if (!response.ok) {
                              showAlert(data.error || "Erreur lors de l'annulation");
                              return;
                            }

                            showAlert("Demande annulée");
                            fetchAppointmentRequests();
                          } catch (error) {
                            console.error(error);
                            showAlert("Erreur serveur");
                          }
                        });
                        return;
                      }}
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {adminSection === "clients" && (
          <section className="admin-panel">

            <div className="admin-panel-header">
              <h2>Clients</h2>

              <div className="admin-search">
                <input
                  type="text"
                  placeholder="Rechercher un client..."
                  value={clientSearchQuery}
                  onChange={(e) => setClientSearchQuery(e.target.value)}
                />
                {clientSearchQuery && (
                  <button
                    onClick={() => setClientSearchQuery("")}
                    className="admin-clear-search"
                  >
                    x
                  </button>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowCreateClient(true)}
              className="admin-btn primary"
              style={{ marginBottom: "15px" }}
            >
              Ajouter un client
            </button>

            {clientSearchQuery && (
              <p style={{ 
                marginBottom: "15px", 
                color: "#666",
                fontSize: "14px" 
              }}>
                {clients.length} résultat{clients.length !== 1 ? 's' : ''} trouvé{clients.length !== 1 ? 's' : ''}
              </p>
            )}

            {clients.length === 0 ? (
              <p className="admin-empty">{clientSearchQuery ? "Aucun client trouvé." : "Aucun client."}</p>
            ) : (
              clients.map(client => (
                <div
                  key={client.id}
                  className="admin-card"
                  style={{
                    background: "white"
                  }}
                >
                  <strong>{client.name}</strong>
                  <p>Email : {client.email}</p>
                  <p>Téléphone : {client.phone}</p>

                  <p>
                    Statut :{" "}
                    {!client.has_account ? (
                      <span>⚪ Client sans compte</span>
                    ) : client.must_change_password ? (
                      <span>🟠 Compte non activé</span>
                    ) : (
                      <span>🟢 Actif</span>
                    )}
                  </p>

                  <div className="admin-actions">
                    <button
                      className="admin-btn primary"
                      onClick={() => setSelectedClientForAppointment(client)}
                    >
                      Donner un rendez-vous
                    </button>

                    {client.has_account && client.must_change_password && (
                      <button
                        className="admin-btn"
                        onClick={() => resendTempPassword(client.id)}
                      >
                        Renvoyer mot de passe
                      </button>
                    )}

                    <button
                      className="admin-btn"
                      onClick={() => {
                        setEditingClient(client);
                        setEditData({
                          email: client.email,
                          phone: client.phone
                        });
                      }}
                    >
                      Modifier
                    </button>

                    {client.must_change_password && (
                      <button
                        className="admin-btn danger"
                        onClick={() => {
                          showConfirm("Êtes-vous sûr de vouloir supprimer ce client ?", () => {
                            adminFetch(
                              `/api/admin/customers/${client.id}`,
                              { method: "DELETE" }
                            ).then(() => fetchClients());
                          });
                          return;
                        }}
                      >
                        Supprimer
                      </button>
                    )}
                  </div>
                  {editingClient?.id === client.id && (
                    <div style={{ marginTop: "15px" }}>
                      <input
                        type="email"
                        value={editData.email}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                        className="admin-input"
                        style={{ marginBottom: "8px" }}
                      />

                      <input
                        type="text"
                        value={editData.phone}
                        onChange={(e) =>
                          setEditData({ ...editData, phone: e.target.value })
                        }
                        className="admin-input"
                        style={{ marginBottom: "10px" }}
                      />

                      <button
                        onClick={async () => {
                          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                          if (!emailRegex.test(editData.email)) {
                            showAlert("Veuillez entrer un email valide");
                            return;
                          }

                          if (!editData.email || !editData.phone) {
                            showAlert("Veuillez remplir tous les champs");
                            return;
                          }

                          await adminFetch(
                            `/api/admin/customers/${client.id}`,
                            {
                              method: "PUT",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify(editData)
                            }
                          );

                          setEditingClient(null);
                          fetchClients();
                        }}
                        className="admin-btn primary"
                      >
                        Enregistrer
                      </button>

                      <button
                        onClick={() => setEditingClient(null)}
                        className="admin-btn"
                        style={{ marginLeft: "8px" }}
                      >
                        Annuler
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}

          </section>
        )}

        {/* CREATE CLIENT MODAL */}
        {showCreateClient && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <h3 style={{ marginBottom: "15px" }}>Créer un client</h3>

              <input
                type="text"
                placeholder="Nom"
                value={newClient.name}
                onChange={(e) =>
                  setNewClient({ ...newClient, name: e.target.value })
                }
                className="admin-input"
                style={{ marginBottom: "10px" }}
              />

              <input
                type="email"
                placeholder="Email"
                value={newClient.email}
                onChange={(e) =>
                  setNewClient({ ...newClient, email: e.target.value })
                }
                required={createLogin}
                className="admin-input"
                style={{ marginBottom: "10px" }}
              />

              <input
                type="text"
                placeholder="Téléphone"
                value={newClient.phone}
                onChange={(e) =>
                  setNewClient({ ...newClient, phone: e.target.value })
                }
                className="admin-input"
                style={{ marginBottom: "15px" }}
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
                className="admin-btn primary"
              >
                Créer
              </button>

              <button
                onClick={() => setShowCreateClient(false)}
                className="admin-btn"
                style={{ marginLeft: "10px" }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* APPOINTMENT MODAL */}
        {selectedClientForAppointment && (
          <div className="admin-modal-overlay">
            <div className="admin-modal">
              <h3 style={{ marginBottom: "15px" }}>
                Rendez-vous pour {selectedClientForAppointment.name}
              </h3>

              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Date de début
              </label>
              <input
                type="date"
                min={todayStr}
                value={appointmentStart}
                onChange={(e) => setAppointmentStart(e.target.value)}
                className="admin-input"
                style={{ marginBottom: "10px" }}
              />

              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Heure de début
              </label>
              <input
                type="time"
                value={appointmentStartTime}
                onChange={(e) => setAppointmentStartTime(e.target.value)}
                className="admin-input"
                style={{ marginBottom: "15px" }}
              />

              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Date de fin
              </label>
              <input
                type="date"
                min={appointmentStart || todayStr}
                value={appointmentEnd}
                onChange={(e) => setAppointmentEnd(e.target.value)}
                className="admin-input"
                style={{ marginBottom: "10px" }}
              />

              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Heure de fin
              </label>
              <input
                type="time"
                value={appointmentEndTime}
                onChange={(e) => setAppointmentEndTime(e.target.value)}
                className="admin-input"
                style={{ marginBottom: "15px" }}
              />
              
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
                Adresse d'intervention
              </label>
              <input
                type="text"
                placeholder="Adresse d'intervention"
                value={appointmentAddress}
                onChange={(e) => setAppointmentAddress(e.target.value)}
                className="admin-input"
                style={{ marginBottom: "15px" }}
              />

              <button
                onClick={async () => {
                  if (!appointmentStart || !appointmentEnd || !appointmentAddress) {
                    showAlert("Veuillez remplir tous les champs");
                    return;
                  }

                  const scheduledStart = `${appointmentStart}T${appointmentStartTime}:00`;
                  const scheduledEnd = `${appointmentEnd}T${appointmentEndTime}:00`;

                  // Check for conflicts before creating
                  try {
                    const checkResponse = await adminFetch(
                      "/api/admin/appointment-requests"
                    );
                    const checkData = await checkResponse.json();

                    if (Array.isArray(checkData.requests)) {
                      const startDate = new Date(scheduledStart);
                      const endDate = new Date(scheduledEnd);

                      const conflicts = checkData.requests.filter(req => {
                        if (req.status !== "scheduled") return false;
                        
                        const reqStart = new Date(req.scheduled_start);
                        const reqEnd = new Date(req.scheduled_end);

                        return (
                          (startDate >= reqStart && startDate < reqEnd) ||
                          (endDate > reqStart && endDate <= reqEnd) ||
                          (startDate <= reqStart && endDate >= reqEnd)
                        );
                      });

                      if (conflicts.length > 0) {
                        const conflictNames = conflicts.map(c => c.customer_name).join(", ");
                        showConfirm(
                          `⚠️ Cette date contient déjà ${conflicts.length} rendez-vous avec : ${conflictNames}. Voulez-vous créer un autre rendez-vous ce jour-là ?`,
                          async () => {
                        
                            const payload = {
                              scheduled_start: scheduledStart,
                              scheduled_end: scheduledEnd,
                              address: appointmentAddress
                            };
                        
                            if (selectedClientForAppointment.request_id) {
                              payload.request_id = selectedClientForAppointment.request_id;
                            } else {
                              payload.customer_id = selectedClientForAppointment.id;
                            }
                        
                            const response = await adminFetch(
                              "/api/admin/appointments",
                              {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload)
                              }
                            );
                        
                            const data = await response.json();
                        
                            if (!response.ok) {
                              showAlert(data.error || "Erreur lors de la création");
                              return;
                            }
                        
                            showAlert("✅ Rendez-vous créé avec succès!");
                        
                            fetchAppointmentRequests();
                            if (adminSection === "clients") {
                              fetchClients();
                            }
                        
                            setSelectedClientForAppointment(null);
                            setAppointmentStart("");
                            setAppointmentEnd("");
                            setAppointmentStartTime("09:00");
                            setAppointmentEndTime("17:00");
                            setAppointmentAddress("");
                          }
                        );
                        
                        return;
                      }
                    }
                  } catch (error) {
                    console.error("Error checking conflicts:", error);
                  }

                  // Proceed with creation
                  const payload = {
                    scheduled_start: scheduledStart,
                    scheduled_end: scheduledEnd,
                    address: appointmentAddress
                  };

                  if (selectedClientForAppointment.request_id) {
                    payload.request_id = selectedClientForAppointment.request_id;
                  } else {
                    payload.customer_id = selectedClientForAppointment.id;
                  }

                  const response = await adminFetch(
                    "/api/admin/appointments",
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(payload)  
                    }
                  );

                  const data = await response.json();

                  if (!response.ok) {
                    showAlert(data.error || "Erreur lors de la création");
                    return;
                  }

                  showAlert("✅ Rendez-vous créé avec succès!");

                  fetchAppointmentRequests();
                  if (adminSection === "clients") {
                    fetchClients();
                  }

                  setSelectedClientForAppointment(null);
                  setAppointmentStart("");
                  setAppointmentEnd("");
                  setAppointmentStartTime("09:00");
                  setAppointmentEndTime("17:00");
                  setAppointmentAddress("");
                }}
                className="admin-btn primary"
              >
                Confirmer
              </button>

              <button
                onClick={() => setSelectedClientForAppointment(null)}
                className="admin-btn"
                style={{ marginLeft: "10px" }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      
      {showConfirmModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <p style={{ marginBottom: "20px" }}>{confirmMessage}</p>

            <button
              onClick={() => {
                if (confirmAction) confirmAction();
                setShowConfirmModal(false);
              }}
              className="admin-btn primary"
            >
              Confirmer
            </button>

            <button
              onClick={() => setShowConfirmModal(false)}
              className="admin-btn"
              style={{ marginLeft: "10px" }}
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      <CustomAlert
        isOpen={showAlertModal}
        message={alertMessage}
        onClose={() => setShowAlertModal(false)}
      />

      </main>
    </div>
  );
}

export default AdminDashboard;
