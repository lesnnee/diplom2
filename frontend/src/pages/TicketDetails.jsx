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

  if (!ticket) return <div className="page">Loading...</div>;

  return (
    <div className="ticket-page">

      <div className="ticket-header glass">
        <h1>{ticket.title}</h1>
        <p>{ticket.description}</p>

        <div className="meta">
          <span className="badge">{ticket.status}</span>
          <span className="badge soft">{ticket.category}</span>
        </div>
      </div>

      <div className="ticket-body">

        <div className="comments glass">
          <h3>Comments</h3>

          {ticket.comments?.length === 0 && (
            <p className="muted">No comments yet</p>
          )}

          {ticket.comments?.map((c, i) => (
            <div key={i} className="comment">
              {c.message}
            </div>
          ))}
        </div>

        <div className="comment-box glass">
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