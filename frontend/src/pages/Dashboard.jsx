import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  // защита
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  // загрузка пользователя (ИЗ БД)
  const loadUser = async () => {
    try {
      const res = await api.get("/auth/me"); // 👈 НУЖЕН ЭТОТ ENDPOINT
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // тикеты
  const loadTickets = async () => {
    const res = await api.get("/tickets/my");
    setTickets(res.data);
  };

  useEffect(() => {
    loadUser();
    loadTickets();
  }, []);

  // создать тикет
  const createTicket = async (e) => {
    e.preventDefault();

    await api.post("/tickets", {
      title,
      description,
    });

    setTitle("");
    setDescription("");
    loadTickets();
  };

  // logout
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard">

      {/* PROFILE */}
      <div className="panel glass soft">
        <div className="avatar">👤</div>

        <h3 className="name">
          {user?.name || "Loading..."}
        </h3>

        <p className="email">
          {user?.email || ""}
        </p>

        <span className="logout-text" onClick={logout}>
          logout
        </span>
      </div>

      {/* CREATE TICKET (CENTER BIG) */}
      <div className="panel liquid center">
        <h2 className="title">CREATE TICKET</h2>

        <form onSubmit={createTicket} className="form">
          <input
            className="input"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <textarea
            className="input"
            placeholder="Describe your problem..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={5}
          />

          <button className="button">
            SEND
          </button>
        </form>
      </div>

      {/* TICKETS */}
      <div className="panel glass soft-right">
        <h2 className="title">TICKETS</h2>

        <div className="tickets">
         {tickets.map((t) => (
  <div
    key={t._id}
    className="ticket-card"
    onClick={() => navigate(`/ticket/${t._id}`)}
    style={{ cursor: "pointer" }}
  >
    <div>{t.title}</div>
    <div>{t.description}</div>
  </div>
))}
        </div>
      </div>

    </div>
  );
}