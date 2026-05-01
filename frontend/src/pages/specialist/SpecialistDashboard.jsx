import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function SpecialistDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [meRes, statsRes] = await Promise.all([
        api.get("/auth/me"),
        api.get("/operator/stats") // временно используем тот же endpoint
      ]);

      setUser(meRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user || !stats) return <div className="page">Loading...</div>;

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
          <h3>Assigned</h3>
          <p className="big">{stats.assigned}</p>
        </div>

        <div className="glass card">
          <h3>In Progress</h3>
          <p className="big">{stats.inProgress}</p>
        </div>

        <div className="glass card">
          <h3>Resolved</h3>
          <p className="big">{stats.doneToday}</p>
        </div>

      </div>

      <div className="glass card status-card">

        <h3>Workload</h3>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${stats.loadPercent}%` }}
          />
        </div>

        <p>
          {stats.loadPercent < 40 && "Low load"}
          {stats.loadPercent >= 40 && stats.loadPercent < 75 && "Medium load"}
          {stats.loadPercent >= 75 && "High load"}
        </p>

      </div>

    </div>
  );
}