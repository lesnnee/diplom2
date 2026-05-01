import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function KnowledgeBase() {
  const [tab, setTab] = useState("tickets");
  const [tickets, setTickets] = useState([]);
  const [articles, setArticles] = useState([]);
  const [user, setUser] = useState(null);

    const navigate = useNavigate();

  // ======================
  // LOAD DATA
  // ======================

  const loadData = async () => {
    try {
      const [meRes, ticketsRes, articlesRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/tickets/knowledge"),
        api.get("/articles/knowledge"),
      ]);

      setUser(meRes.data);
      setTickets(ticketsRes.data);
      setArticles(articlesRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!user) return <div className="page">Loading...</div>;

  return (
    <div className="kb-page">

      <h1>Knowledge Base</h1>

      {/* TABS */}
      <div className="tabs">
        <button
          className={tab === "tickets" ? "tab active" : "tab"}
          onClick={() => setTab("tickets")}
        >
          Closed Tickets ({tickets.length})
        </button>

        <button
          className={tab === "articles" ? "tab active" : "tab"}
          onClick={() => setTab("articles")}
        >
          Articles ({articles.length})
        </button>
      </div>

      {/* ====================== */}
      {/* TICKETS TAB */}
      {/* ====================== */}

      {tab === "tickets" && (
        <div className="ticket-list grid">

          {tickets.length === 0 && (
            <div className="empty">No knowledge yet</div>
          )}

          {tickets.map((t) => (
            <div
  key={t._id}
  className="ticket-card glass clickable"
  onClick={() => navigate(`/ticket/${t._id}`)}
>

              <div className="ticket-top">
                <span className="badge done">done</span>
                <span className="priority">P{t.priority}</span>
              </div>

              <h3 className="title">
                {(t.description || "").slice(0, 60)}
              </h3>

              <p className="desc">
                {t.description}
              </p>

              <div className="meta">
                <span>
                  {t.userId?.name || "User"}
                </span>

                <span>
                  {new Date(t.createdAt).toLocaleDateString()}
                </span>
              </div>

            </div>
          ))}

        </div>
      )}

      {/* ====================== */}
      {/* ARTICLES TAB */}
      {/* ====================== */}

      {tab === "articles" && (
        <div className="ticket-list grid">

          {articles.length === 0 && (
            <div className="empty">No articles yet</div>
          )}

          {articles.map((a) => (
            <div key={a._id} className="ticket-card glass">

              <h3 className="title">
                {a.title}
              </h3>

              <p className="desc">
                {(a.content || "").slice(0, 120)}
              </p>

              <div className="meta">
                <span>
                  {a.createdBy?.name || "Operator"}
                </span>

                <span>
                  {new Date(a.createdAt).toLocaleDateString()}
                </span>
              </div>

            </div>
          ))}

        </div>
      )}

    </div>
  );
}