import { useEffect, useState } from "react";
import { Legend } from "recharts";
import api from "../../api/axios";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart
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

  const COLORS = {
  network: "#00d4ff",
  software: "#7c3aed",
  security: "#ff4d6d",
  hardware: "#f59e0b",
  infrastructure: "#22c55e",
  unknown: "#6b7280",
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

      {/* ========================= */}
      {/* SWIPEABLE CHART CAROUSEL */}
      {/* ========================= */}

      <div className="chart-carousel">

        {/* 1 */}
        <div className="chart-slide glass card">
          <h2>Tickets Over Time</h2>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.timeline}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line
  type="monotone"
  dataKey="created"
  stroke="#4fd1ff"   // холодный неон (под твою тему)
  strokeWidth={2}
/>

<Line
  type="monotone"
  dataKey="closed"
  stroke="#ff4d6d"   // 🔴 красный (закрытые)
  strokeWidth={2}
  
/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 2 */}
        <div className="chart-slide glass card">
          <h2>Categories</h2>

<ResponsiveContainer width="100%" height={300}>
  <PieChart>

    <Pie
      data={data.categories}
      dataKey="value"
      nameKey="name"
      outerRadius={100}
      label={({ name, percent }) =>
        `${name} (${(percent * 100).toFixed(0)}%)`
      }
    >
      {data.categories.map((entry, index) => (
        <Cell
          key={index}
          fill={COLORS[entry.name] || "#8884d8"}
        />
      ))}
    </Pie>

    <Tooltip />
<Legend />
  </PieChart>
</ResponsiveContainer>
        </div>

        {/* 3 (заглушка под будущее) */}
<div className="glass card chart">
  <h2>Specialists Performance (7 days)</h2>

  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data.specialistStats}>

      <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

      <XAxis
        dataKey="name"
        stroke="#aaa"
      />

      <YAxis stroke="#aaa" />

      <Tooltip
        contentStyle={{
          background: "rgba(20,20,30,0.8)",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: "12px",
          backdropFilter: "blur(10px)",
        }}
      />

      <Bar
        dataKey="value"
        radius={[6, 6, 0, 0]}
        fill="#00d4ff"
      />

    </BarChart>
  </ResponsiveContainer>
</div>

        {/* 4 */}
          <div className="chart-slide glass card">
    <h2>SLA Resolution Time</h2>

    <ResponsiveContainer width="100%" height={300}>
      <PieChart>

        <Pie
          data={data.slaStats}
          dataKey="value"
          nameKey="name"
          outerRadius={100}
          label
        >
          {data.slaStats.map((entry, index) => (
            <Cell
              key={index}
              fill={
                entry.name === "<1h"
                  ? "#22c55e"
                  : entry.name === "1-24h"
                  ? "#f59e0b"
                  : entry.name === "1-3d"
                  ? "#ff4d6d"
                  : "#6b7280"
              }
            />
          ))}
        </Pie>

        <Tooltip />
<Legend />
      </PieChart>
    </ResponsiveContainer>
  </div>

        {/* 5 */}
  <div className="chart-slide glass card">
    <h2>Overload / Capacity</h2>

    <ResponsiveContainer width="100%" height={400}>
      <BarChart
        data={data.overload}
        layout="vertical"
        margin={{ left: 40 }}
      >
        <CartesianGrid strokeDasharray="3 3" opacity={0.1} />

        <XAxis type="number" />
        <YAxis
          type="category"
          dataKey="name"
          width={150}
          interval={0}
        />

        <Tooltip />

        <Bar
          dataKey="activeTickets"
          fill="#ff4d6d"
          radius={[0, 6, 6, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>

      </div>

    </div>
  );
}