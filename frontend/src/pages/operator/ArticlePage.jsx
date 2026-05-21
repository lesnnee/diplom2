import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api/axios";

export default function ArticlePage() {

  const { id } = useParams();

  const navigate = useNavigate();

  const [article, setArticle] = useState(null);

  useEffect(() => {

    const load = async () => {

      try {

        const res = await api.get(`/articles/${id}`);

        setArticle(res.data);

      } catch (err) {
        console.error(err);
      }
    };

    load();

  }, [id]);

  if (!article) {
    return <div className="page">Loading...</div>;
  }

  return (

    <div className="article-page">

      {/* BACK BUTTON */}

      <button
        className="back-btn"
        onClick={() => navigate(-1)}
      >
        ← Назад
      </button>

      <div className="article-container glass">

        <h1 className="article-title">
          {article.title}
        </h1>

        <div className="article-page-meta">

          <span>
            {article.createdBy?.name}
          </span>

          <span>
            {new Date(article.createdAt)
              .toLocaleDateString()}
          </span>

          <span>
            👁 {article.views}
          </span>

        </div>

        <div className="article-page-tags">

          {article.tags?.map((tag) => (
            <span
              key={tag}
              className="tag"
            >
              #{tag}
            </span>
          ))}

        </div>

        <div className="article-content">
          {article.content}
        </div>

      </div>

    </div>

  );
}