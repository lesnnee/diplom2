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

  // ================= КАТЕГОРИИ =================
  const categories = [
    "network",
    "software", 
    "hardware",
    "security",
    "infrastructure",
    "manual_review"
  ];

  // ================= ПРИОРИТЕТЫ =================
  const priorities = [
    { value: "1", label: "P1 - Critical (бизнес остановлен)" },
    { value: "2", label: "P2 - High (работа сильно затруднена)" },
    { value: "3", label: "P3 - Medium (работа возможна с трудностями)" },
    { value: "4", label: "P4 - Low (незначительная проблема)" },
    { value: "5", label: "P5 - Info (вопрос/консультация)" }
  ];

  // ================= СТАТУСЫ =================
  const statuses = [
    { value: "new", label: "New" },
    { value: "in_progress", label: "In progress" },
    { value: "waiting_user", label: "Waiting user" },
    { value: "done", label: "Done" },
    { value: "rejected", label: "Rejected" }
  ];

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

        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All status</option>
          {statuses.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>

        <select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="">All categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>
              {cat === "manual_review" ? "Manual review" : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </option>
          ))}
        </select>

        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {priorities.map(p => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>

        <label className="checkbox">
          <input
            type="checkbox"
            checked={lowConfidenceOnly}
            onChange={(e) => setLowConfidenceOnly(e.target.checked)}
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