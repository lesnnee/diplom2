import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function OperatorDashboard() {
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      const res = await api.get("/tickets", {
        params: { status: statusFilter, category: categoryFilter, },
      });
      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    await api.patch(`/tickets/${id}/status`, { status });
    loadTickets();
  };

  const assignTicket = async (id) => {
  try {
    await api.patch(`/tickets/${id}/assign`, {
      assignedTo: "operator",
    });
    loadTickets();
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div className="operator-page">

      <h1>Operator Panel</h1>

      {/* FILTER */}
      <div className="filters">
        <select onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select onChange={(e) => setCategoryFilter(e.target.value)}>
  <option value="">All categories</option>
  <option value="network">Network</option>
  <option value="software">Software</option>
  <option value="hardware">Hardware</option>
  <option value="security">Security</option>
</select>
      </div>

      {/* LIST */}
      <div className="ticket-list">
        {tickets.map((t) => (
          <div
  key={t._id}
  className="ticket-card"
  onClick={() => navigate(`/ticket/${t._id}`)}
  style={{ cursor: "pointer" }}
>

            <h3>{t.title}</h3>
            <p>{t.description}</p>

            <div className="meta">
              <span>{t.status}</span>
              <span>{t.category}</span>
              <span>priority: {t.priority}</span>
              <span>Assigned to: {t.assignedTo || "unassigned"}</span>
            </div>

            <div className="user-info">
                <p>{t.userId?.name}</p>
                <p>{t.userId?.email}</p>
            </div>

            <div className="actions">
              <button
  onClick={(e) => {
    e.stopPropagation();
    updateStatus(t._id, "in_progress");
  }}
>
                In Progress
              </button>

              <button
  onClick={(e) => {
    e.stopPropagation();
    updateStatus(t._id, "done");
  }}
>
                Close
              </button>
              
{!t.assignedTo && (
  <button
    onClick={(e) => {
      e.stopPropagation();
      assignTicket(t._id);
    }}
  >
    Assign to me
  </button>
)}
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}