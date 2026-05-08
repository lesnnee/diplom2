import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function OperatorTicketCard({
  ticket,
  reload,
  currentUserId, // 👈 добавим
}) {
  const navigate = useNavigate();

  const [category, setCategory] = useState(ticket.category);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo?._id || "");

  const ai = ticket.ai || {};

  const getConfidenceColor = (c) => {
    if (c >= 0.7) return "green";
    if (c >= 0.4) return "yellow";
    return "red";
  };

  const updateTicket = async () => {
    await api.patch(`/tickets/${ticket._id}/ml-correction`, {
  category,
  priority,
  assignedTo,
});

    reload();
  };

  const closeTicket = async () => {
    await api.patch(`/tickets/${ticket._id}/status`, {
      status: "done",
    });

    reload();
  };

  const isAssignedToMe =
    ticket.assignedTo?._id === currentUserId;

  return (
    <div
      className={`op-ticket-card glass clickable ${
        isAssignedToMe ? "mine" : ""
      }`}
      onClick={() => navigate(`/ticket/${ticket._id}`)}
    >

      {/* HEADER */}
      <div className="op-header">
        <h3>{ticket.title}</h3>
        <span className={`status ${ticket.status}`}>
          {ticket.status}
        </span>
      </div>

      <p className="op-desc">{ticket.description}</p>

      <div className="op-user">
        👤 {ticket.userId?.name}
      </div>

      {/* AI */}
      <div className="op-ai-block">
        <h4>AI Decision</h4>

        <div>Category: {ai.category}</div>
        <div>Priority: {ai.priority}</div>
        <div>Assigned: {ai.assignedTo || "—"}</div>

        <div className={`confidence ${getConfidenceColor(ai.confidence)}`}>
          Confidence: {ai.confidence}
        </div>
      </div>

      {/* OVERRIDE */}
      <div className="op-override" onClick={(e) => e.stopPropagation()}>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="network">Network</option>
          <option value="software">Software</option>
          <option value="hardware">Hardware</option>
          <option value="security">Security</option>
        </select>

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <button className="save-btn" onClick={updateTicket}>
          Save
        </button>

      </div>

      {/* ACTIONS */}
      <div className="op-actions" onClick={(e) => e.stopPropagation()}>

        <button onClick={closeTicket}>
          Close
        </button>

      </div>

    </div>
  );
}