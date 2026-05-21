import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api/axios";
import { socket } from "../api/socket";

export default function TicketDetails() {
  const { id } = useParams();

  const [ticket, setTicket] = useState(null);
  const [message, setMessage] = useState("");
  const [viewerOpen, setViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // =========================
  // LOAD USER
  // =========================
  useEffect(() => {
    const loadUser = async () => {
      const res = await api.get("/auth/me");
      setUser(res.data);
    };

    loadUser();
  }, []);

  // =========================
  // LOAD TICKET
  // =========================
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

  // =========================
  // SOCKET
  // =========================
  useEffect(() => {
    if (!id) return;
    socket.emit("join_ticket", id);
  }, [id]);

  useEffect(() => {
    socket.on("new_comment", (data) => {
      if (data.ticketId === id) {
        setTicket((prev) => ({
          ...prev,
          comments: [...(prev?.comments || []), data.comment],
        }));
      }
    });

    return () => socket.off("new_comment");
  }, [id]);

  // =========================
  // ROLE LOGIC (ВАЖНОЕ ИЗМЕНЕНИЕ)
  // =========================
  const isCreator = ticket?.userId?._id === user?._id;
  const isAssigned = ticket?.assignedTo?._id === user?._id;

  // =========================
  // ACTIONS
  // =========================
  const reopenTicket = async () => {
    try {
      await api.patch(`/tickets/${id}/status`, {
        status: "in_progress",
      });
navigate("/specialist/tickets");
      loadTicket();
    } catch (err) {
      console.error(err);
    }
  };

  const closeTicket = async () => {
    try {
      await api.patch(`/tickets/${id}/status`, {
        status: "done",
      });

      navigate("/specialist/tickets");
    } catch (err) {
      console.error(err);
    }
  };

  const addComment = async () => {
    await api.post(`/tickets/${id}/comment`, { message });
    setMessage("");
    loadTicket();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && message.trim()) {
      e.preventDefault();
      addComment();
    }
  };

  // =========================
  // IMAGE LOGIC
  // =========================
  const images =
    ticket?.attachments?.filter((f) => {
      const ext = f.filename.split(".").pop().toLowerCase();
      return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
    }) || [];

  const openImageViewer = (index) => {
    setCurrentIndex(index);
    setViewerOpen(true);
  };

  const next = () =>
    setCurrentIndex((p) => (p + 1 >= images.length ? 0 : p + 1));

  const prev = () =>
    setCurrentIndex((p) => (p - 1 < 0 ? images.length - 1 : p - 1));

  const formatTime = (date) =>
    new Date(date).toLocaleString("ru-RU", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
    });

  if (!ticket) return <div className="page">Loading...</div>;

   const isClosed = ticket?.status === "done";

  return (
    <div className="ticket-layout">

      {/* LEFT */}
      <div className="ticket-left glass">

        <button className="back-btn glass-btn" onClick={() => navigate(-1)}>
          ← Назад
        </button>

        <h1 className="ticket-title">{ticket.title}</h1>

        <p className="ticket-description">{ticket.description}</p>

        <div className="ticket-meta">

          <div>
            <span className="label">Статус:</span>
            <span className={`badge ${ticket.status}`}>
              {ticket.status}
            </span>
          </div>

          <div>
            <span className="label">Категория:</span>
            <span className="badge soft">{ticket.category}</span>
          </div>

          <div>
            <span className="label">Приоритет:</span>
            <span className="badge">{ticket.priority}</span>
          </div>

          {/* =========================
              ВАЖНАЯ ЛОГИКА ОТОБРАЖЕНИЯ
              ========================= */}

          {isCreator ? (
            <div>
              <span className="label">Ответственный специалист:</span>
              <span className="badge soft">
                {ticket.assignedTo?.name || "unassigned"}
              </span>
            </div>
          ) : (
            <div>
              <span className="label">Автор:</span>
              <span className="badge soft">
                {ticket.userId?.name || "unknown"}
              </span>
            </div>
          )}

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
                    onClick={() => {
                      if (isImage) openImageViewer(i);
                      else window.open(`http://localhost:5000${f.url}`);
                    }}
                  >
                    {isImage ? (
                      <img
                        src={`http://localhost:5000${f.url}`}
                        className="file-thumb"
                      />
                    ) : (
                      <div className="file-icon">📄 {f.filename}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* RIGHT */}
      <div className="ticket-right glass">

        <h3>Комментарии</h3>

        <div className="comments-list">
          {ticket.comments?.length === 0 && (
            <p className="muted">Пока нет комментариев</p>
          )}

          {ticket.comments?.map((c, i) => {
            const isMe = c.userId?._id === user?._id;

            return (
              <div key={i} className={`comment ${isMe ? "me" : "other"}`}>
                <div className="comment-author">
                  {c.userId?.name || "Unknown"}
                </div>

                <div className="comment-text">{c.message}</div>

                <div className="comment-time">
                  {formatTime(c.createdAt)}
                </div>
              </div>
            );
          })}
        </div>

<div className="comment-box">

  <input
    value={message}
    onChange={(e) => setMessage(e.target.value)}
    onKeyDown={handleKeyDown}
    placeholder={isClosed ? "Обращение закрыто" : "Написать комментарий..."}
    disabled={isClosed}
    className={isClosed ? "disabled-input" : ""}
  />

  <button
    onClick={addComment}
    disabled={isClosed || !message.trim()}
    className={isClosed ? "disabled-btn" : ""}
  >
    Отправить
  </button>

</div>

        {/* =========================
            CLOSE BUTTON (ТОЛЬКО ДЛЯ ASSIGNED)
            ========================= */}
        {isAssigned && (
  <>
    {ticket.status !== "done" ? (
      <button className="close-btn" onClick={closeTicket}>
        Закрыть обращение
      </button>
    ) : (
      <button className="close-btn reopen" onClick={reopenTicket}>
        Открыть обращение
      </button>
    )}
  </>
)}

      </div>

      {/* MODAL */}
      {viewerOpen && images.length > 0 && (
        <div className="modal-overlay" onClick={() => setViewerOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button onClick={prev}>←</button>

            <img
              src={`http://localhost:5000${images[currentIndex].url}`}
              className="modal-img"
            />

            <button onClick={next}>→</button>

            <div onClick={() => setViewerOpen(false)}>✕</div>
          </div>
        </div>
      )}

    </div>
  );
}