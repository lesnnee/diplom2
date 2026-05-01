import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // 🔥 ДОБАВИЛИ 2 СОРТИРОВКИ
  const [dateSort, setDateSort] = useState("newest");
  const [prioritySort, setPrioritySort] = useState("high");

  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
      const res = await api.get("/tickets/assigned");
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

  // ======================
  // FILTER + SORT LOGIC
  // ======================

  const filteredTickets = tickets
    .filter((t) => {
      if (tab === "all") return true;
      return t.status === tab;
    })
    .filter((t) => {
      if (priorityFilter === "all") return true;
      return t.priority === Number(priorityFilter);
    })
    .filter((t) =>
      (t.description || "")
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => {

      // 🔥 1. PRIORITY SORT
      let priorityDiff = 0;

      if (prioritySort === "high") {
        priorityDiff = a.priority - b.priority; // P1 first
      } else {
        priorityDiff = b.priority - a.priority; // P5 first
      }

      if (priorityDiff !== 0) return priorityDiff;

      // 🔥 2. DATE SORT
      if (dateSort === "newest") {
        return new Date(b.createdAt) - new Date(a.createdAt);
      } else {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
    });

  // ======================
  // COUNTERS
  // ======================

  const counts = {
    all: tickets.length,
    new: tickets.filter((t) => t.status === "new").length,
    in_progress: tickets.filter((t) => t.status === "in_progress").length,
    done: tickets.filter((t) => t.status === "done").length,
  };

  return (
    <div className="tickets-page">

      <h1>My Tickets</h1>

      {/* SEARCH */}
      <input
        className="ticket-search"
        placeholder="Search tickets..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* FILTER ROW */}
      <div className="filters-row">

        {/* PRIORITY FILTER */}
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
        >
          <option value="all">All priorities</option>
          <option value="1">P1 (Critical)</option>
          <option value="2">P2 (High)</option>
          <option value="3">P3 (Medium)</option>
          <option value="4">P4 (Low)</option>
          <option value="5">P5 (Very Low)</option>
        </select>

        {/* PRIORITY SORT */}
        <select
          value={prioritySort}
          onChange={(e) => setPrioritySort(e.target.value)}
        >
          <option value="high">High → Low (P1 first)</option>
          <option value="low">Low → High (P5 first)</option>
        </select>

        {/* DATE SORT */}
        <select
          value={dateSort}
          onChange={(e) => setDateSort(e.target.value)}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>

      </div>

      {/* TABS */}
      <div className="tabs">
        {["all", "new", "in_progress", "done"].map((t) => (
          <button
            key={t}
            className={tab === t ? "tab active" : "tab"}
            onClick={() => setTab(t)}
          >
            {t} ({counts[t]})
          </button>
        ))}
      </div>

      {/* LIST */}
      <div className="ticket-list">

        {filteredTickets.length === 0 && (
          <div className="empty">
            No tickets found
          </div>
        )}

        {filteredTickets.map((t) => (
          <div
            key={t._id}
            className="ticket-card glass"
            onClick={() => navigate(`/ticket/${t._id}`)}
          >

            <div className="ticket-top">
              <span className={`status ${t.status}`}>
                {t.status}
              </span>

              <span className="priority">
                P{t.priority}
              </span>
            </div>

            <h3 className="title">
              {(t.description || "").slice(0, 60)}
            </h3>

            <p className="desc">
              {t.description}
            </p>

            <div className="meta">
              <span>
  {t.userId?.name || "Unknown user"}
</span>
              <span>
                {new Date(t.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div
              className="actions"
              onClick={(e) => e.stopPropagation()}
            >
              {t.status !== "in_progress" && (
                <button
                  onClick={() =>
                    updateStatus(t._id, "in_progress")
                  }
                >
                  ▶ Start
                </button>
              )}

              {t.status !== "done" && (
                <button
                  onClick={() =>
                    updateStatus(t._id, "done")
                  }
                >
                  ✅ Close
                </button>
              )}
            </div>

          </div>
        ))}

      </div>
    </div>
  );
}