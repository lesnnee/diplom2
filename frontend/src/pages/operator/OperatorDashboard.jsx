import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function OperatorDashboard() {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const load = async () => {
      const me = await api.get("/auth/me");
      setUser(me.data);

      const res = await api.get("/operator/stats"); 
      setStats(res.data);
    };

    load();
  }, []);

  if (!user || !stats) return <div>Loading...</div>;

  return (
    <div className="op-dashboard">

      {/* ================= PROFILE ================= */}
      <div className="glass card profile-card">

        <div className="avatar">👤</div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="badge soft">{user.role}</span>
        </div>

      </div>

      {/* ================= LOAD ================= */}
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
          <h3>Done</h3>
          <p className="big">{stats.doneToday}</p>
        </div>

      </div>

      {/* ================= STATUS ================= */}
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