import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Dashboard() {
  const [tickets, setTickets] = useState([]);
  const [description, setDescription] = useState("");
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [search, setSearch] = useState("");
  const [files, setFiles] = useState([]);
  const [sortOrder, setSortOrder] = useState("new"); 
  const [statusFilter, setStatusFilter] = useState("all");

  const navigate = useNavigate();

  // auth check
  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/");
    }
  }, []);

  // load user
  const loadUser = async () => {
    const res = await api.get("/auth/me");
    setUser(res.data);
  };

  // load tickets
  const loadTickets = async () => {
    const res = await api.get("/tickets/my");
    setTickets(res.data);
  };

  useEffect(() => {
    loadUser();
    loadTickets();
  }, []);

  // =========================
  // 📎 FILES FIXED (IMPORTANT)
  // =========================
const handleFileChange = (e) => {
  const selected = Array.from(e.target.files);

  setFiles((prev) => {
    const remainingSlots = 5 - prev.length;

    if (remainingSlots <= 0) {
      alert("Можно прикрепить максимум 5 файлов");
      return prev;
    }

    const allowed = selected.slice(0, remainingSlots);

    const mapped = allowed.map((file) => ({
      file,
      url: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : null,
      name: file.name,
      type: file.type,
    }));

    return [...prev, ...mapped];
  });

  e.target.value = null;
};

  // ❌ remove file
  const removeFile = (index) => {
    setFiles((prev) => {
      const updated = [...prev];

      // cleanup blob url
      if (updated[index]?.url) {
        URL.revokeObjectURL(updated[index].url);
      }

      updated.splice(index, 1);
      return updated;
    });
  };

  // create ticket
  const createTicket = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("description", description);

    files.forEach((f) => {
      formData.append("files", f.file);
    });

    await api.post("/tickets", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setDescription("");

    // cleanup previews
    files.forEach((f) => {
      if (f.url) URL.revokeObjectURL(f.url);
    });

    setFiles([]);
    loadTickets();
  };

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

const filteredTickets = tickets
  .filter((t) => {
    if (activeTab === "active") return t.status !== "done";
    return t.status === "done";
  })
  .filter((t) => {
    if (statusFilter === "all") return true;
    return t.status === statusFilter;
  })
  .filter((t) =>
    t.description.toLowerCase().includes(search.toLowerCase())
  )
  .sort((a, b) => {
    if (sortOrder === "new") {
      return new Date(b.createdAt) - new Date(a.createdAt);
    } else {
      return new Date(a.createdAt) - new Date(b.createdAt);
    }
  });

  return (
    <div className="dashboard">

      {/* PROFILE */}
      <div className="panel glass soft">
        <div className="avatar">👤</div>

        <h3 className="name">{user?.name || "Loading..."}</h3>
        <p className="email">{user?.email}</p>

        <span className="logout-text" onClick={logout}>
          Выйти
        </span>
      </div>

      {/* CREATE */}
      <div className="panel liquid center">
        <h2 className="title">СОЗДАТЬ ОБРАЩЕНИЕ</h2>

        <form onSubmit={createTicket} className="form glass-form">

          <textarea
            name="description"
            className="input no-resize"
            placeholder="Опишите вашу проблему..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
          />

          {/* FILE PREVIEW */}
          {files.length > 0 && (
            <div className="file-preview-row">
              {files.map((f, i) => (
                <div className="file-preview" key={i}>

                  <div
                    className="remove-file"
                    onClick={() => removeFile(i)}
                  >
                    ✕
                  </div>

                  {f.type.startsWith("image/") ? (
                    <img src={f.url} className="preview-img" />
                  ) : (
                    <div className="file-name">
                      📄 {f.name}
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}

          <div className="form-bottom">

            <label className="clip">
              📎
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                hidden
              />
            </label>

            <button className="button liquid-btn">
              ОТПРАВИТЬ
            </button>

          </div>
        </form>
      </div>

      {/* TICKETS */}
      <div className="panel glass soft-right">

        <h2 className="title">ОБРАЩЕНИЯ</h2>

        <input
          className="input search"
          placeholder="Найти обращение..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="tabs">
          <button
            className={activeTab === "active" ? "tab active" : "tab"}
            onClick={() => setActiveTab("active")}
          >
            Активные
          </button>

          <button
            className={activeTab === "done" ? "tab active" : "tab"}
            onClick={() => setActiveTab("done")}
          >
            Закрытые
          </button>
        </div>

        <div className="filters-row">

  {/* SORT */}
  <select
    className="input"
    value={sortOrder}
    onChange={(e) => setSortOrder(e.target.value)}
  >
    <option value="new">Сначала новые</option>
    <option value="old">Сначала старые</option>
  </select>

  {/* STATUS */}
  <select
    className="input"
    value={statusFilter}
    onChange={(e) => setStatusFilter(e.target.value)}
  >
    <option value="all">Все статусы</option>
    <option value="new">Новые</option>
    <option value="in_progress">В процессе</option>
  </select>

</div>

        <div className="tickets">
          {filteredTickets.map((t) => (
            <div
              key={t._id}
              className="ticket-card glass-card"
              onClick={() => navigate(`/ticket/${t._id}`)}
            >
              <div>{t.description}</div>
              <div className={`status ${t.status}`}>
                {t.status}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}