import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const navigate = useNavigate();

  const loadTickets = async () => {
    try {
        console.log("TOKEN:", localStorage.getItem("token"));
      const res = await api.get("/tickets/assigned"); // важно
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
    <div className="tickets-page">

      <h1>My Tickets</h1>

      <div className="ticket-list">

        {tickets.map((t) => (
          <div
            key={t._id}
            className="ticket-card glass"
            onClick={() => navigate(`/ticket/${t._id}`)}
          >

            <h3>{t.description.slice(0, 50)}</h3>
            <p>{t.description}</p>

            <div className="meta">
              <span>{t.status}</span>
              <span>{t.category}</span>
              <span>priority: {t.priority}</span>
            </div>

            {/* ACTIONS */}
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
                  ▶ In Progress
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