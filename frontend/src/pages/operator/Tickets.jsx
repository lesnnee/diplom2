import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import OperatorTicketCard from "../operator/OperatorTicketCard";

export default function Tickets() {
  const [mineTickets, setMineTickets] = useState([]);
  const [allTickets, setAllTickets] = useState([]);

  const [tab, setTab] = useState("mine");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("");
  const [lowConfidenceOnly, setLowConfidenceOnly] = useState(false);

  const navigate = useNavigate();

  // ================= LOAD =================
  const loadTickets = async () => {
    try {
      const [mineRes, allRes] = await Promise.all([
        api.get("/tickets/assigned", {
          params: {
            status,
            category,
            priority,
            lowConfidence: lowConfidenceOnly,
          },
        }),

        api.get("/tickets", {
          params: {
            status,
            category,
            priority,
            lowConfidence: lowConfidenceOnly,
          },
        }),
      ]);

      setMineTickets(mineRes.data);
      setAllTickets(allRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [status, category, priority, lowConfidenceOnly]);

  // ================= DATA =================
  const tickets = tab === "mine" ? mineTickets : allTickets;

  // ================= FILTER =================
  const filteredTickets = tickets.filter((t) => {
    const text = `${t.title || ""} ${t.description || ""}`
      .toLowerCase();

    return text.includes(search.toLowerCase());
  });

  return (
    <div className="tickets-page glass">

      {/* ================= TABS ================= */}
      <div className="tabs">

        <button
          className={tab === "mine" ? "tab active" : "tab"}
          onClick={() => setTab("mine")}
        >
          My tickets ({mineTickets.length})
        </button>

        <button
          className={tab === "all" ? "tab active" : "tab"}
          onClick={() => setTab("all")}
        >
          All tickets ({allTickets.length})
        </button>

      </div>

      {/* ================= SEARCH ================= */}
      <input
        className="input ticket-search"
        placeholder="Search tickets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

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

        <label className="checkbox">
          <input
            type="checkbox"
            checked={lowConfidenceOnly}
            onChange={(e) =>
              setLowConfidenceOnly(e.target.checked)
            }
          />
          Low AI confidence
        </label>

      </div>

      {/* ================= LIST ================= */}
      <div className="tickets-list">

        {filteredTickets.length === 0 && (
          <p className="muted">No tickets found</p>
        )}

        {filteredTickets.map((t) => (
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