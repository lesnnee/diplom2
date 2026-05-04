import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Logs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/admin/logs");
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    load();
  }, []);

  return (
    <div className="logs-page glass">

      <h1>System Logs</h1>

      <div className="logs-list">

        {logs.map((l, i) => (
          <div key={i} className="log-item glass">

            <div className="log-top">
              <span className="badge soft">{l.action}</span>
              <span className="time">
                {new Date(l.timestamp).toLocaleString()}
              </span>
            </div>

            <div className="log-body">
              <p>
                <b>{l.user}</b> ({l.role}) changed ticket
                <span className="ticket-id"> {l.ticketId}</span>
              </p>

              <p className="change">
                {l.oldValue} → <b>{l.newValue}</b>
              </p>
            </div>

          </div>
        ))}

      </div>

    </div>
  );
}