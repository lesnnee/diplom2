import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function OperatorTicketCard({
  ticket,
  reload,
  currentUserId,
}) {
  const navigate = useNavigate();

  const [category, setCategory] = useState(ticket.category);
  const [priority, setPriority] = useState(ticket.priority);
  const [assignedTo, setAssignedTo] = useState(ticket.assignedTo?._id || "");
  
  // Список всех специалистов
  const [specialists, setSpecialists] = useState([]);
  const [loadingSpecialists, setLoadingSpecialists] = useState(false);

  // AI данные из mlPrediction
  const mlPrediction = ticket.mlPrediction || {};
  const priorityPrediction = mlPrediction.priorityPrediction || {};

  const confidence = mlPrediction.confidence || 0;
  const predictedCategory = mlPrediction.predictedCategory || "unknown";
  const predictedPriority = priorityPrediction.value || ticket.priority || 3;
  const predictedAssignedTo = ticket.assignedTo?.name || "—";

  console.log("🔍 Ticket debug:", {
  id: ticket._id,
  assignedTo: ticket.assignedTo,
  assignedToName: ticket.assignedTo?.name,
  assignedToId: typeof ticket.assignedTo === 'object' ? ticket.assignedTo._id : ticket.assignedTo
});

  // Загрузка всех специалистов (один раз при монтировании)
  useEffect(() => {
    const loadSpecialists = async () => {
      setLoadingSpecialists(true);
      try {
        const response = await api.get("/users/specialists");
        setSpecialists(response.data);
      } catch (err) {
        console.error("Failed to load specialists:", err);
      } finally {
        setLoadingSpecialists(false);
      }
    };
    
    loadSpecialists();
  }, []);

  const getConfidenceColor = (c) => {
    if (c >= 0.7) return "green";
    if (c >= 0.4) return "yellow";
    return "red";
  };

  const updateTicket = async () => {
    try {
      const finalAssignedTo = assignedTo && assignedTo !== "" ? assignedTo : null;

      await api.patch(`/tickets/${ticket._id}/ml-correction`, {
        category,
        priority: parseInt(priority),
        assignedTo: finalAssignedTo,
      });
      reload();
    } catch (err) {
      console.error("Update error:", err);
      if (err.response) {
        console.error("Response data:", err.response.data);
      }
    }
  };

  const closeTicket = async () => {
    try {
      await api.patch(`/tickets/${ticket._id}/status`, {
        status: "done",
      });
      reload();
    } catch (err) {
      console.error("Close error:", err);
    }
  };

  const isAssignedToMe = ticket.assignedTo?._id === currentUserId;

  // Категории для выбора
  const categories = [
    "network",
    "software",
    "hardware", 
    "security",
    "infrastructure",
    "manual_review"
  ];

  // Приоритеты для выбора (P1-P5)
  const priorities = [
    { value: 1, label: "P1 - Critical (бизнес остановлен)" },
    { value: 2, label: "P2 - High (работа сильно затруднена)" },
    { value: 3, label: "P3 - Medium (работа возможна с трудностями)" },
    { value: 4, label: "P4 - Low (незначительная проблема)" },
    { value: 5, label: "P5 - Info (вопрос/консультация)" }
  ];

  // Группировка специалистов по ролям
  const groupedSpecialists = specialists.reduce((acc, spec) => {
    const roleMap = {
      it_support: "💻 IT Support",
      network_admin: "🌐 Network Admin",
      sysadmin: "🏗️ Sysadmin",
      security: "🔐 Security",
      hardware_support: "🖥️ Hardware Support"
    };
    const roleName = roleMap[spec.role] || spec.role;
    if (!acc[roleName]) acc[roleName] = [];
    acc[roleName].push(spec);
    return acc;
  }, {});

  return (
    <div
      className={`op-ticket-card glass clickable ${isAssignedToMe ? "mine" : ""}`}
      onClick={() => navigate(`/ticket/${ticket._id}`)}
    >

      {/* HEADER */}
      <div className="op-header">
        <h3>#{ticket._id?.slice(-6)}</h3>
        <span className={`status ${ticket.status}`}>
          {ticket.status}
        </span>
      </div>

      <p className="op-desc">{ticket.description}</p>

      <div className="op-user">
        👤 {ticket.userId?.name || "Unknown"}
      </div>

      {/* AI DECISION BLOCK */}
      <div className="op-ai-block">
        <h4>🤖 ML Decision</h4>

        <div className="ai-row">
          <span className="ai-label">Category:</span>
          <span className="ai-value">{predictedCategory}</span>
        </div>

        <div className="ai-row">
          <span className="ai-label">Priority:</span>
          <span className="ai-value">P{predictedPriority}</span>
        </div>

        <div className="ai-row">
          <span className="ai-label">Assigned to:</span>
          <span className="ai-value">{predictedAssignedTo}</span>
        </div>

        <div className={`confidence ${getConfidenceColor(confidence)}`}>
          Confidence: {(confidence * 100).toFixed(1)}%
        </div>
      </div>

      {/* OVERRIDE BLOCK */}
      <div className="op-override" onClick={(e) => e.stopPropagation()}>

        <div className="override-row">
          <label>📂 Category override:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat} value={cat}>
                {cat === "manual_review" ? "Manual review" : cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="override-row">
          <label>⚡ Priority override:</label>
          <select value={priority} onChange={(e) => setPriority(parseInt(e.target.value))}>
            {priorities.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* ВЫБОР СПЕЦИАЛИСТА */}
        <div className="override-row">
          <label>👨‍💼 Assign to specialist:</label>
          <select 
            value={assignedTo} 
            onChange={(e) => setAssignedTo(e.target.value)}
            disabled={loadingSpecialists}
          >
            <option value="">— Auto-assign (ML will choose best) —</option>
            {Object.entries(groupedSpecialists).map(([roleName, specs]) => (
              <optgroup key={roleName} label={roleName}>
                {specs.map(spec => (
                  <option key={spec._id} value={spec._id}>
                    {spec.name} ({spec.activeTickets || 0} active tickets)
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {loadingSpecialists && <span className="loading">Loading specialists...</span>}
        </div>

        <button className="save-btn" onClick={updateTicket}>
          💾 Save corrections
        </button>

      </div>

      {/* ACTIONS */}
      <div className="op-actions" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closeTicket}>
          ✅ Close ticket
        </button>
      </div>

    </div>
  );
}