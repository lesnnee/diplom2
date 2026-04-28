import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  const loadLogs = async () => {
    try {
      const res = await api.get("/admin/logs");
      setLogs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  return (
    <div className="logs-page glass">

      <h1>System Logs</h1>

      <div className="logs-list">

        {logs.map((log) => (
          <div key={log._id} className="log-card glass">

            <div className="log-action">
              {log.action}
            </div>

            <div className="log-user">
              {log.user?.name || "System"}
            </div>

            <div className="log-time">
              {new Date(log.createdAt).toLocaleString()}
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}