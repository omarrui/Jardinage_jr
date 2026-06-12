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
  const [customers, setCustomers] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [quickAppointment, setQuickAppointment] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState(""); 
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");
  const [isSavingQuickAppointment, setIsSavingQuickAppointment] = useState(false);
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

  const fetchCustomers = () => {
    const token = localStorage.getItem("token");

    fetch(apiUrl("/api/admin/customers"), {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCustomers(data);
        }
      })
      .catch(() => {
        showAlert("Erreur de chargement des clients");
      });
  };

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
    fetchCustomers();
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

    const isoDate = format(clickedDate, "yyyy-MM-dd");

    if (blockedDates.includes(isoDate)) {
      showAlert("⚠️ Cette date est actuellement bloquée pour les rendez‑vous. Supprimez-la manuellement si vous voulez la débloquer.");
      return;
    }

    const clickedStart = new Date(slotInfo.start);
    const clickedEnd = new Date(slotInfo.end);
    const isFullDaySlot = clickedStart.getHours() === 0 &&
      clickedStart.getMinutes() === 0 &&
      clickedEnd.getHours() === 0 &&
      clickedEnd.getMinutes() === 0;

    setQuickAppointment({
      mode: "existing",
      customerId: "",
      date: format(clickedStart, "yyyy-MM-dd"),
      startTime: isFullDaySlot ? "09:00" : format(clickedStart, "HH:mm"),
      endTime: isFullDaySlot ? "17:00" : format(clickedEnd, "HH:mm"),
      address: "",
      description: "Rendez-vous créé depuis le planning",
      newCustomer: {
        name: "",
        email: "",
        phone: ""
      }
    });
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

  const updateQuickAppointment = (field, value) => {
    setQuickAppointment(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateQuickCustomer = (field, value) => {
    setQuickAppointment(prev => ({
      ...prev,
      newCustomer: {
        ...prev.newCustomer,
        [field]: value
      }
    }));
  };

  const getQuickAppointmentConflicts = () => {
    if (!quickAppointment?.date || !quickAppointment?.startTime || !quickAppointment?.endTime) {
      return [];
    }

    const start = new Date(`${quickAppointment.date}T${quickAppointment.startTime}:00`);
    const end = new Date(`${quickAppointment.date}T${quickAppointment.endTime}:00`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return [];
    }

    return allEvents.filter(event => (
      (start >= event.start && start < event.end) ||
      (end > event.start && end <= event.end) ||
      (start <= event.start && end >= event.end)
    ));
  };

  const handleBlockQuickDate = async () => {
    if (!quickAppointment?.date) return;

    try {
      const response = await fetch(apiUrl("/api/admin/availability"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: quickAppointment.date })
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.error || "Erreur lors du blocage de la date");
        return;
      }

      showAlert("Date bloquée");
      setQuickAppointment(null);
      fetchAvailability();
    } catch (error) {
      console.error("Failed to block date", error);
      showAlert("Erreur de connexion");
    }
  };

  const handleCreateQuickAppointment = async () => {
    if (!quickAppointment) return;

    if (!quickAppointment.date || !quickAppointment.startTime || !quickAppointment.endTime || !quickAppointment.address) {
      showAlert("Veuillez remplir la date, les heures et l'adresse");
      return;
    }

    const scheduledStart = `${quickAppointment.date}T${quickAppointment.startTime}:00`;
    const scheduledEnd = `${quickAppointment.date}T${quickAppointment.endTime}:00`;
    const startDate = new Date(scheduledStart);
    const endDate = new Date(scheduledEnd);

    if (endDate <= startDate) {
      showAlert("L'heure de fin doit être après l'heure de début");
      return;
    }

    setIsSavingQuickAppointment(true);

    try {
      let customerId = quickAppointment.customerId;

      if (quickAppointment.mode === "new") {
        if (!quickAppointment.newCustomer.name || !quickAppointment.newCustomer.phone) {
          showAlert("Le nom et le téléphone du nouveau client sont requis");
          setIsSavingQuickAppointment(false);
          return;
        }

        const customerResponse = await fetch(apiUrl("/api/admin/customers"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: quickAppointment.newCustomer.name,
            email: quickAppointment.newCustomer.email || null,
            phone: quickAppointment.newCustomer.phone,
            has_account: false
          })
        });

        const customerData = await customerResponse.json();

        if (!customerResponse.ok) {
          showAlert(customerData.error || customerData.Error || "Erreur lors de la création du client");
          setIsSavingQuickAppointment(false);
          return;
        }

        customerId = customerData.customer?.id;

        if (!customerId) {
          showAlert("Client créé, mais impossible de récupérer son identifiant");
          setIsSavingQuickAppointment(false);
          fetchCustomers();
          return;
        }
      }

      if (!customerId) {
        showAlert("Veuillez sélectionner un client");
        setIsSavingQuickAppointment(false);
        return;
      }

      const response = await fetch(apiUrl("/api/admin/appointments"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_id: Number(customerId),
          scheduled_start: scheduledStart,
          scheduled_end: scheduledEnd,
          address: quickAppointment.address,
          description: quickAppointment.description || "Rendez-vous créé depuis le planning"
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showAlert(data.error || "Erreur lors de la création du rendez-vous");
        setIsSavingQuickAppointment(false);
        return;
      }

      showAlert("✅ Rendez-vous créé depuis le planning");
      setQuickAppointment(null);
      setCustomerSearchQuery("");
      fetchEvents();
      fetchCustomers();
    } catch (error) {
      console.error("Failed to create quick appointment", error);
      showAlert("Erreur de connexion");
    } finally {
      setIsSavingQuickAppointment(false);
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const query = customerSearchQuery.trim().toLowerCase();
    if (!query) return true;

    return (
      customer.name?.toLowerCase().includes(query) ||
      customer.email?.toLowerCase().includes(query) ||
      customer.phone?.toLowerCase().includes(query)
    );
  });

  const quickConflicts = getQuickAppointmentConflicts();

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

      {quickAppointment && (
        <div className="admin-drawer-overlay">
          <aside className="admin-side-panel">
            <div className="admin-side-panel-header">
              <div>
                <p>Nouveau depuis le planning</p>
                <h3>Ajouter un rendez-vous</h3>
              </div>
              <button
                type="button"
                onClick={() => setQuickAppointment(null)}
                className="admin-icon-btn"
                aria-label="Fermer"
              >
                x
              </button>
            </div>

            <div className="admin-segmented-control">
              <button
                type="button"
                className={quickAppointment.mode === "existing" ? "is-active" : ""}
                onClick={() => updateQuickAppointment("mode", "existing")}
              >
                Client existant
              </button>
              <button
                type="button"
                className={quickAppointment.mode === "new" ? "is-active" : ""}
                onClick={() => updateQuickAppointment("mode", "new")}
              >
                Nouveau client
              </button>
            </div>

            {quickAppointment.mode === "existing" ? (
              <div className="admin-form-group">
                <label>Rechercher un client</label>
                <input
                  type="text"
                  value={customerSearchQuery}
                  onChange={(e) => setCustomerSearchQuery(e.target.value)}
                  className="admin-input"
                  placeholder="Nom, email ou téléphone"
                />

                <label>Client</label>
                <select
                  value={quickAppointment.customerId}
                  onChange={(e) => updateQuickAppointment("customerId", e.target.value)}
                  className="admin-input"
                >
                  <option value="">Choisir un client</option>
                  {filteredCustomers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name} - {customer.phone || "sans téléphone"}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="admin-form-group">
                <label>Nom du client</label>
                <input
                  type="text"
                  value={quickAppointment.newCustomer.name}
                  onChange={(e) => updateQuickCustomer("name", e.target.value)}
                  className="admin-input"
                  placeholder="Nom"
                />

                <label>Email</label>
                <input
                  type="email"
                  value={quickAppointment.newCustomer.email}
                  onChange={(e) => updateQuickCustomer("email", e.target.value)}
                  className="admin-input"
                  placeholder="Email optionnel"
                />

                <label>Téléphone</label>
                <input
                  type="text"
                  value={quickAppointment.newCustomer.phone}
                  onChange={(e) => updateQuickCustomer("phone", e.target.value)}
                  className="admin-input"
                  placeholder="Téléphone"
                />
              </div>
            )}

            <div className="admin-form-grid">
              <div className="admin-form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={quickAppointment.date}
                  onChange={(e) => updateQuickAppointment("date", e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Début</label>
                <input
                  type="time"
                  value={quickAppointment.startTime}
                  onChange={(e) => updateQuickAppointment("startTime", e.target.value)}
                  className="admin-input"
                />
              </div>

              <div className="admin-form-group">
                <label>Fin</label>
                <input
                  type="time"
                  value={quickAppointment.endTime}
                  onChange={(e) => updateQuickAppointment("endTime", e.target.value)}
                  className="admin-input"
                />
              </div>
            </div>

            {quickConflicts.length > 0 && (
              <div className="admin-conflict-note">
                <strong>Créneau déjà occupé</strong>
                <span>
                  {quickConflicts.map(conflict => conflict.customer_name).join(", ")}
                </span>
              </div>
            )}

            <div className="admin-form-group">
              <label>Adresse d'intervention</label>
              <input
                type="text"
                value={quickAppointment.address}
                onChange={(e) => updateQuickAppointment("address", e.target.value)}
                className="admin-input"
                placeholder="Adresse"
              />
            </div>

            <div className="admin-form-group">
              <label>Description</label>
              <textarea
                value={quickAppointment.description}
                onChange={(e) => updateQuickAppointment("description", e.target.value)}
                className="admin-input admin-textarea"
                placeholder="Notes pour l'intervention"
              />
            </div>

            <div className="admin-side-panel-actions">
              <button
                type="button"
                onClick={handleCreateQuickAppointment}
                className="admin-btn primary"
                disabled={isSavingQuickAppointment}
              >
                {isSavingQuickAppointment ? "Création..." : "Créer le rendez-vous"}
              </button>
              <button
                type="button"
                onClick={handleBlockQuickDate}
                className="admin-btn"
              >
                Bloquer cette date
              </button>
            </div>
          </aside>
        </div>
      )}

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
