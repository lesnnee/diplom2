import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SpecialistDashboard() {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meRes, ticketsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/tickets/assigned") // 👈 ВАЖНО: реальные тикеты специалиста
      ]);

      setUser(meRes.data);
      setTickets(ticketsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) return <div className="page">Loading...</div>;

  // =========================
  // 📊 ЛОГИКА НАГРУЗКИ
  // =========================

  const workload = tickets.reduce((sum, t) => {
    switch (t.status) {
      case "new":
        return sum + 1;
      case "in_progress":
        return sum + 3;
      case "waiting_user":
        return sum + 2;
      default:
        return sum;
    }
  }, 0);

  const maxLoad = 40;
  const loadPercent = Math.min((workload / maxLoad) * 100, 100);

  const new_tickets = tickets.filter(t => t.status === "new").length;
  const inProgress = tickets.filter(t => t.status === "in_progress").length;
  const doneToday = tickets.filter(t => t.status === "done").length;

  return (
    <div className="op-dashboard">

      {/* PROFILE */}
      <div className="glass card profile-card">
        <div className="avatar">👤</div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="badge soft">{user.role}</span>
        </div>
      </div>

      {/* STATS */}
      <div className="stats-grid">

        <div className="glass card">
          <h3>New</h3>
          <p className="big">{new_tickets}</p>
        </div>

        <div className="glass card">
          <h3>In Progress</h3>
          <p className="big">{inProgress}</p>
        </div>

        <div className="glass card">
          <h3>Resolved</h3>
          <p className="big">{doneToday}</p>
        </div>

      </div>

      {/* WORKLOAD */}
      <div className="glass card status-card">

        <h3>Workload</h3>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${loadPercent}%` }}
          />
        </div>

        <p>
          {loadPercent < 40 && "Low load"}
          {loadPercent >= 40 && loadPercent < 75 && "Medium load"}
          {loadPercent >= 75 && "High load"}
        </p>


      </div>

    </div>
  );
}