import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function OperatorKnowledgeBase() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("tickets");

  const [tickets, setTickets] = useState([]);
  const [articles, setArticles] = useState([]);

  // ticket filters
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  // article filters
  const [articleSearch, setArticleSearch] = useState("");

  // create article
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [articleCategory, setArticleCategory] = useState("software");
  const [tags, setTags] = useState("");

  // ======================
  // LOAD
  // ======================

  const loadData = async () => {
    try {
      const [ticketsRes, articlesRes] = await Promise.all([
        api.get("/tickets/knowledge/all"),
        api.get("/articles"),
      ]);

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
    return tickets.filter((t) => {

      const matchesSearch =
        t.description
          ?.toLowerCase()
          .includes(search.toLowerCase());

      const matchesCategory =
        category === "all" ||
        t.category === category;

      return matchesSearch && matchesCategory;
    });
  }, [tickets, search, category]);

  // ======================
  // FILTER ARTICLES
  // ======================

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {

      const q = articleSearch.toLowerCase();

      return (
        a.title?.toLowerCase().includes(q) ||
        a.content?.toLowerCase().includes(q) ||
        a.category?.toLowerCase().includes(q) ||
        a.tags?.join(" ").toLowerCase().includes(q)
      );
    });
  }, [articles, articleSearch]);

  // ======================
  // CREATE ARTICLE
  // ======================

  const createArticle = async () => {
    try {

      await api.post("/articles", {
        title,
        content,
        category: articleCategory,
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      });

      setTitle("");
      setContent("");
      setTags("");
      setArticleCategory("software");

      loadData();

      setTab("articles");

    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // CATEGORIES
  // ======================

  const categories = [
    "all",
    ...new Set(tickets.map((t) => t.category).filter(Boolean)),
  ];

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

        <button
          className={tab === "create" ? "tab active" : "tab"}
          onClick={() => setTab("create")}
        >
          + Create Article
        </button>

      </div>

      {/* ====================== */}
      {/* TICKETS */}
      {/* ====================== */}

      {tab === "tickets" && (
        <>

          <div className="kb-controls">

            <input
              type="text"
              placeholder="Search tickets..."
              className="input kb-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              className="input kb-select"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

          </div>

          <div className="ticket-list grid">

            {filteredTickets.length === 0 && (
              <div className="empty">
                No tickets found
              </div>
            )}

            {filteredTickets.map((t) => (

              <div
                key={t._id}
                className="ticket-card glass clickable"
                onClick={() => navigate(`/ticket/${t._id}`)}
              >

                <div className="ticket-top">

                  <span className="badge done">
                    done
                  </span>

                  <span className="priority">
                    P{t.priority}
                  </span>

                </div>

                <h3 className="title">
                  {(t.description || "").slice(0, 70)}
                </h3>

                <p className="desc">
                  {t.description}
                </p>

                <div className="meta">

                  <span>
                    {t.category}
                  </span>

                  <span>
                    {new Date(
                      t.closedAt || t.createdAt
                    ).toLocaleDateString()}
                  </span>

                </div>

              </div>

            ))}

          </div>

        </>
      )}

      {/* ====================== */}
      {/* ARTICLES */}
      {/* ====================== */}

      {tab === "articles" && (

        <>

          <div className="kb-controls">

            <input
              type="text"
              placeholder="Search articles..."
              className="input kb-search"
              value={articleSearch}
              onChange={(e) => setArticleSearch(e.target.value)}
            />

          </div>

          <div className="articles-feed">

            {filteredArticles.length === 0 && (
              <div className="empty">
                No articles yet
              </div>
            )}

            {filteredArticles.map((a) => (

              <div
                key={a._id}
                className="article-card glass"
                onClick={() => navigate(`/articles/${a._id}`)}
              >

                <div className="article-header">

                  <h2>{a.title}</h2>

                  <div className="article-meta">

                    <span>
                      {a.createdBy?.name || "Operator"}
                    </span>

                    <span>
                      {new Date(a.createdAt)
                        .toLocaleDateString()}
                    </span>

                  </div>

                </div>

                <div className="article-category">
                  {a.category}
                </div>

                <div className="article-tags">

                  {a.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="tag"
                    >
                      #{tag}
                    </span>
                  ))}

                </div>

                <div className="article-preview">
                  {a.content.slice(0, 300)}...
                </div>

              </div>

            ))}

          </div>

        </>

      )}

      {/* ====================== */}
      {/* CREATE */}
      {/* ====================== */}

      {tab === "create" && (

        <div className="create-article glass">

          <input
            type="text"
            placeholder="Article title..."
            className="input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <select
            className="input"
            value={articleCategory}
            onChange={(e) => setArticleCategory(e.target.value)}
          >
            <option value="software">software</option>
            <option value="network">network</option>
            <option value="infrastructure">infrastructure</option>
            <option value="security">security</option>
            <option value="hardware">hardware</option>
            <option value="unknown">unknown</option>
          </select>

          <input
            type="text"
            placeholder="Tags separated by comma..."
            className="input"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />

          <textarea
            placeholder="Write article..."
            className="input article-editor"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <button
            className="liquid-btn"
            onClick={createArticle}
          >
            Publish Article
          </button>

        </div>

      )}

    </div>
  );
}