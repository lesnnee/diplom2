import { useEffect, useState } from "react";
import api from "../../api/axios";
import OperatorTicketCard from "../operator/OperatorTicketCard";

export default function Tickets() {
  const [tickets, setTickets] = useState([]);

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);

  const loadTickets = async () => {
    try {
      const res = await api.get("/tickets", {
        params: {
          status,
          category,
          priority,
          lowConfidence: lowConfidenceOnly,
        },
      });

      setTickets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status, category, priority, lowConfidenceOnly]);

  return (
    <div className="tickets-page glass">

      {/* ================= FILTERS ================= */}
      <div className="filters-bar">

        <select onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          <option value="open">Open</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>

        <select onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          <option value="network">Network</option>
          <option value="software">Software</option>
          <option value="hardware">Hardware</option>
          <option value="security">Security</option>
        </select>

        <select onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        {/* 🔥 KEY FEATURE */}
        <label className="checkbox">
          <input
            type="checkbox"
            checked={lowConfidenceOnly}
            onChange={(e) =>
              setLowConfidenceOnly(e.target.checked)
            }
          />
          Low AI confidence only
        </label>

      </div>

      {/* ================= LIST ================= */}
      <div className="tickets-list">

        {tickets.length === 0 && (
          <p className="muted">No tickets found</p>
        )}

        {tickets.map((t) => (
          <OperatorTicketCard
            key={t._id}
            ticket={t}
            reload={loadTickets}
          />
        ))}

      </div>

    </div>
  );
}