import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/axios";

export default function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");

  const loadTicket = async () => {
    try {
      const res = await api.get(`/tickets/${id}`);
      setTicket(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadTicket();
  }, []);

  const addComment = async () => {
    await api.post(`/tickets/${id}/comment`, { message });
    setMessage("");
    loadTicket();
  };

  const openFile = (file) => {
  const url = `http://localhost:5000${file.url}`;

  const ext = file.filename.split(".").pop().toLowerCase();

  // картинки
  if (["jpg", "jpeg", "png", "webp", "gif"].includes(ext)) {
    window.open(url, "_blank");
    return;
  }

  // pdf — открывается в браузере
  if (ext === "pdf") {
    window.open(url, "_blank");
    return;
  }

  // doc/docx — скачивание
  const a = document.createElement("a");
  a.href = url;
  a.download = file.filename;
  a.click();
};

  if (!ticket) return <div className="page">Loading...</div>;

  return (
    <div className="ticket-layout">

      {/* =========================
          LEFT SIDE - INFO
      ========================= */}
      <div className="ticket-left glass">

        <h1 className="ticket-title">{ticket.title}</h1>

        <p className="ticket-description">
          {ticket.description}
        </p>

        <div className="ticket-meta">

          <div>
            <span className="label">Status:</span>
            <span className={`badge ${ticket.status}`}>
              {ticket.status}
            </span>
          </div>

          <div>
            <span className="label">Category:</span>
            <span className="badge soft">
              {ticket.category}
            </span>
          </div>

          <div>
            <span className="label">Priority:</span>
            <span className="badge">
              {ticket.priority}
            </span>
          </div>

          <div>
            <span className="label">Assigned:</span>
            <span className="badge soft">
              {ticket.assignedTo?.name || "unassigned"}
            </span>
          </div>

        </div>

        {/* FILES */}
{ticket.attachments?.length > 0 && (
  <div className="attachments">
    <h3>Files</h3>

    <div className="attachments-grid">
      {ticket.attachments.map((f, i) => {
        const ext = f.filename.split(".").pop().toLowerCase();

        const isImage = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);

        return (
          <div
            key={i}
            className="file-card"
            onClick={() => openFile(f)}
            style={{ cursor: "pointer" }}
          >

            {isImage ? (
              <img
                src={`http://localhost:5000${f.url}`}
                className="file-thumb"
              />
            ) : (
              <div className="file-icon">
                📄 {f.filename}
              </div>
            )}

          </div>
        );
      })}
    </div>
  </div>
)}

      </div>

      {/* =========================
          RIGHT SIDE - COMMENTS
      ========================= */}
      <div className="ticket-right glass">

        <h3>Comments</h3>

        <div className="comments-list">
          {ticket.comments?.length === 0 && (
            <p className="muted">No comments yet</p>
          )}

          {ticket.comments?.map((c, i) => (
            <div key={i} className="comment">
              {c.message}
            </div>
          ))}
        </div>

        <div className="comment-box">
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write comment..."
          />

          <button onClick={addComment}>
            Send
          </button>
        </div>

      </div>

    </div>
  );
}