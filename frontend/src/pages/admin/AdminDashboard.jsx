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

const formatTime = (min) => {
  const d = Math.floor(min / 1440); // 1440 = 60 * 24
  const h = Math.floor((min % 1440) / 60);
  const m = min % 60;

  if (d === 0 && h === 0) return `${m}м`;
  if (d === 0) return `${h}ч ${m}м`;
  return `${d}д ${h}ч`;
};

  if (!stats || !user) return <div className="page">Загрузка...</div>;

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
          <h3>Пользователи</h3>
          <p className="big">{stats.users}</p>
        </div>

        <div className="glass card">
          <h3>Обращения</h3>
          <p className="big">{stats.tickets}</p>
        </div>


        <div className="glass card">
          <h3>Действующие операторы</h3>
          <p className="big">{stats.operators}</p>
        </div>

      </div>

            <div className="stats-grid">

        <div className="glass card">
          <h3>Среднее время решения</h3>
          <p className="big">
             {formatTime(stats.avgResolutionTime)}
          </p>
        </div>

        <div className="glass card">
          <h3>Процент решенных обращений</h3>
          <p className="big">
            {stats.successRate}%
          </p>
        </div>

        <div className="glass card">
          <h3>Перегруженные специалисты</h3>
          <p className="big">
            {stats.overloadedUsers}
          </p>
        </div>

      </div>

      

    </div>
  );
}