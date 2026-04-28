import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [statsRes, meRes] = await Promise.all([
          api.get("/admin/stats"),
          api.get("/auth/me"),
        ]);

        setStats(statsRes.data);
        setUser(meRes.data);
      } catch (err) {
        console.error(err);
      }
    };

    loadData();
  }, []);

  if (!stats || !user) return <div className="page">Loading...</div>;

  return (
    <div className="op-dashboard">

      {/* PROFILE CARD */}
      <div className="glass card profile-card">

        <div className="avatar">👤</div>

        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
          <span className="badge soft">{user.role}</span>
        </div>

      </div>

      {/* STATS GRID */}
      <div className="stats-grid">

        <div className="glass card">
          <h3>Users</h3>
          <p className="big">{stats.users}</p>
        </div>

        <div className="glass card">
          <h3>Tickets</h3>
          <p className="big">{stats.tickets}</p>
        </div>

        <div className="glass card">
          <h3>Open Tickets</h3>
          <p className="big">{stats.openTickets}</p>
        </div>

        <div className="glass card">
          <h3>Active Operators</h3>
          <p className="big">{stats.operators}</p>
        </div>

      </div>

      

    </div>
  );
}