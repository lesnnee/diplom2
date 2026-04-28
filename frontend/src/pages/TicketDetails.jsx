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

  const reopenTicket = async () => {
  try {
    await api.patch(`/tickets/${id}/status`, {
      status: "in_progress",
    });

    loadTicket(); // обновить данные
  } catch (err) {
    console.error(err);
  }
};

useEffect(() => {
  const loadUser = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data);
  };

  loadUser();
}, []);

  const openImageViewer = (index) => {
  setCurrentIndex(index);
  setViewerOpen(true);
};

const images =
  ticket?.attachments?.filter((f) => {
    const ext = f.filename.split(".").pop().toLowerCase();
    return ["jpg", "jpeg", "png", "webp", "gif"].includes(ext);
  }) || [];

const next = () => {
  setCurrentIndex((prev) =>
    prev + 1 >= images.length ? 0 : prev + 1
  );
};

const prev = () => {
  setCurrentIndex((prev) =>
    prev - 1 < 0 ? images.length - 1 : prev - 1
  );
};

const handleKeyDown = (e) => {
  if (e.key === "Enter" && message.trim()) {
    e.preventDefault(); // чтобы не было странного поведения
    addComment();
  }
};

const formatTime = (date) => {
  const d = new Date(date);

  return d.toLocaleString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
  });
};

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

  return () => {
    socket.off("new_comment");
  };
}, [id]);

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

    

    {/* LEFT */}
    <div className="ticket-left glass">
      <div className="ticket-actions">
<button className="back-btn glass-btn" onClick={() => navigate(-1)}>
  ← Back
</button>
</div>

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
              const isImage = ["jpg","jpeg","png","webp","gif"].includes(ext);

              return (
                <div
                  key={i}
                  className="file-card"
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    if (isImage) {
                      const index = images.findIndex(img => img.url === f.url);
                      openImageViewer(index);
                    } else {
                      const url = `http://localhost:5000${f.url}`;
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = f.filename;
                      a.click();
                    }
                  }}
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

    {/* RIGHT */}
    <div className="ticket-right glass">

      <h3>Comments</h3>

      <div className="comments-list">
        {ticket.comments?.length === 0 && (
          <p className="muted">No comments yet</p>
        )}

        {ticket.comments?.map((c, i) => {
  const isMe = c.userId?._id === user?._id;

  return (
    <div
      key={i}
      className={`comment ${isMe ? "me" : "other"}`}
    >
      <div className="comment-author">
        {c.userId?.name || "Unknown"}
      </div>

      <div className="comment-text">
        {c.message}
      </div>

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
  placeholder="Write comment..."
/>

        <button onClick={addComment}>
          Send
        </button>
      </div>

    </div>

    {/* 🖼️ MODAL */}
    {viewerOpen && images.length > 0 && (
      <div
        className="modal-overlay"
        onClick={() => setViewerOpen(false)}
      >
        <div
          className="modal-content"
          onClick={(e) => e.stopPropagation()}
        >

          <button className="nav-btn" onClick={prev}>
            ←
          </button>

          <img
            src={`http://localhost:5000${images[currentIndex].url}`}
            className="modal-img"
          />

          <button className="nav-btn" onClick={next}>
            →
          </button>

          <div
            className="close"
            onClick={() => setViewerOpen(false)}
          >
            ✕
          </div>

        </div>
      </div>
    )}

  </div>
);
}