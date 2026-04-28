import { useEffect, useState } from "react";
import api from "../../api/axios";

import {
    Cell,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";

export default function Statistics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/admin/statistics");
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="page">Loading...</div>;

  return (
    <div className="stats-page">

      <h1>System Statistics</h1>

      {/* TOP CARDS */}
      <div className="stats-grid">

        <div className="glass card">
          <h3>Users</h3>
          <p className="big">{data.users}</p>
        </div>

        <div className="glass card">
          <h3>Tickets</h3>
          <p className="big">{data.tickets}</p>
        </div>

        <div className="glass card">
          <h3>Open</h3>
          <p className="big">{data.open}</p>
        </div>

        <div className="glass card">
          <h3>Closed</h3>
          <p className="big">{data.closed}</p>
        </div>

      </div>

      {/* LINE CHART */}
      <div className="glass card chart">
        <h2>Tickets Over Time</h2>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.timeline}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="created" />
            <Line type="monotone" dataKey="closed" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* PIE CHART */}
      <div className="glass card chart">
        <h2>Categories</h2>

        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data.categories}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
            >
              {data.categories.map((entry, index) => (
                <Cell key={index} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}