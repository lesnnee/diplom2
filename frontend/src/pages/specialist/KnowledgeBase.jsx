import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function KnowledgeBase() {
  const [tab, setTab] = useState("tickets");

  const [tickets, setTickets] = useState([]);
  const [articles, setArticles] = useState([]);
  const [user, setUser] = useState(null);

  const [ticketSearch, setTicketSearch] = useState("");
  const [articleSearch, setArticleSearch] = useState("");

  const navigate = useNavigate();

  // ======================
  // LOAD
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

  // ======================
  // FILTER TICKETS
  // ======================

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) =>
      (t.description || "")
        .toLowerCase()
        .includes(ticketSearch.toLowerCase())
    );
  }, [tickets, ticketSearch]);

  // ======================
  // FILTER ARTICLES
  // ======================

  const filteredArticles = useMemo(() => {
    return articles.filter((a) =>
      (a.title + " " + (a.content || ""))
        .toLowerCase()
        .includes(articleSearch.toLowerCase())
    );
  }, [articles, articleSearch]);

  // ======================

  if (!user) return <div className="page">Loading...</div>;

  return (
    <div className="kb-page">

      <h1>База знаний</h1>

      {/* TABS */}
      <div className="tabs">

        <button
          className={tab === "tickets" ? "tab active" : "tab"}
          onClick={() => setTab("tickets")}
        >
          Решенные обращения ({tickets.length})
        </button>

        <button
          className={tab === "articles" ? "tab active" : "tab"}
          onClick={() => setTab("articles")}
        >
          Статьи ({articles.length})
        </button>

      </div>

      {/* ======================
          TICKETS
      ====================== */}

      {tab === "tickets" && (
        <>

          {/* SEARCH */}
          <input
            className="input kb-search"
            placeholder="Найти обращения..."
            value={ticketSearch}
            onChange={(e) => setTicketSearch(e.target.value)}
          />

          <div className="ticket-list grid">

            {filteredTickets.length === 0 && (
              <div className="empty">Пока ничего нет</div>
            )}

            {filteredTickets.map((t) => (
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
                  <span>{t.userId?.name || "User"}</span>
                  <span>
                    {new Date(t.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>
            ))}

          </div>
        </>
      )}

      {/* ======================
          ARTICLES
      ====================== */}

      {tab === "articles" && (
        <>
          {/* SEARCH */}
          <input
            className="input kb-search"
            placeholder="Найти статьи..."
            value={articleSearch}
            onChange={(e) => setArticleSearch(e.target.value)}
          />

          <div className="ticket-list grid">

            {filteredArticles.length === 0 && (
              <div className="empty">No articles yet</div>
            )}

            {filteredArticles.map((a) => (
              <div
                key={a._id}
                className="ticket-card glass clickable"
                onClick={() => navigate(`/articles/${a._id}`)}
              >

                <h3 className="title">{a.title}</h3>

                <p className="desc">
                  {(a.content || "").slice(0, 120)}
                </p>

                <div className="meta">
                  <span>{a.createdBy?.name || "Operator"}</span>
                  <span>
                    {new Date(a.createdAt).toLocaleDateString()}
                  </span>
                </div>

              </div>
            ))}

          </div>
        </>
      )}

    </div>
  );
}