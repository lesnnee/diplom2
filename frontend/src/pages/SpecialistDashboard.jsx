import { useEffect, useState } from "react";
import api from "../api/axios";

export default function SpecialistDashboard() {
  const [tickets, setTickets] = useState([]);

  const role = localStorage.getItem("role");

  const roleToCategory = {
    it_support: "software",
    network_admin: "network",
    sysadmin: "infrastructure",
    security: "security",
    hardware_support: "hardware",
  };

  const category = roleToCategory[role];

  const loadTickets = async () => {
    try {
      const res = await api.get(`/tickets/category/${category}`);
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/tickets/${id}/status`, { status });
      loadTickets();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="specialist-page">

      <h1>Specialist Panel</h1>

      <div className="ticket-list">

        {tickets.map((t) => (
          <div key={t._id} className="ticket-card">

            <h3>{t.title}</h3>
            <p>{t.description}</p>

            <div className="meta">
              <span>{t.status}</span>
              <span>{t.priority}</span>
            </div>

            <div className="actions">

              <button
                onClick={() => updateStatus(t._id, "in_progress")}
              >
                Take in work
              </button>

              <button
                onClick={() => updateStatus(t._id, "done")}
              >
                Close
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}