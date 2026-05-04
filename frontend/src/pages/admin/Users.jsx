import { useEffect, useState } from "react";
import api from "../../api/axios";

const ROLES = [
  "user",
  "operator",
  "admin",
  "it_support",
  "network_admin",
  "sysadmin",
  "security",
  "hardware_support",
];

export default function Users() {
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState("list"); // list | create

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  // ======================
  // LOAD USERS
  // ======================
  const loadUsers = async () => {
    try {
      const res = await api.get("/admin/users");
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ======================
  // CREATE USER
  // ======================
  const createUser = async () => {
    try {
      await api.post("/admin/users", form);

      setForm({
        name: "",
        email: "",
        password: "",
        role: "user",
      });

      setTab("list");
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // DELETE USER
  // ======================
  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // CHANGE ROLE
  // ======================
  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // FILTERED USERS
  // ======================
  const filteredUsers = users
    .filter((u) =>
      `${u.name} ${u.email}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .filter((u) => {
      if (roleFilter === "all") return true;
      return u.role === roleFilter;
    });

  return (
    <div className="users-page glass">

      {/* ======================
          TABS
      ====================== */}
      <div className="tabs">
        <button
          className={tab === "list" ? "tab active" : "tab"}
          onClick={() => setTab("list")}
        >
          Users ({users.length})
        </button>

        <button
          className={tab === "create" ? "tab active" : "tab"}
          onClick={() => setTab("create")}
        >
          Create User
        </button>
      </div>

      {/* ======================
          LIST TAB
      ====================== */}
      {tab === "list" && (
        <>
          {/* SEARCH + FILTER */}
          <div className="filters-row">

            <input
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="all">All roles</option>
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>

          </div>

          {/* USERS LIST */}
          <div className="users-list">

            {filteredUsers.length === 0 && (
              <div className="empty">No users found</div>
            )}

            {filteredUsers.map((u) => (
              <div key={u._id} className="glass card user-card">

                <div className="user-info">
                  <h3>{u.name}</h3>
                  <p>{u.email}</p>
                  <span className="badge soft">{u.role}</span>
                </div>

                <div className="user-actions">

                  <select
                    value={u.role}
                    onChange={(e) =>
                      changeRole(u._id, e.target.value)
                    }
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>

                  <button
                    className="danger delete-btn"
                    onClick={() => deleteUser(u._id)}
                  >
                    Delete
                  </button>

                </div>

              </div>
            ))}

          </div>
        </>
      )}

      {/* ======================
          CREATE TAB
      ====================== */}
      {tab === "create" && (
        <div className="glass card user-form">

          <h2>Create User</h2>

          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Email"
            value={form.email}
            onChange={(e) =>
              setForm({ ...form, email: e.target.value })
            }
          />

          <input
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) =>
              setForm({ ...form, password: e.target.value })
            }
          />

          <select
            value={form.role}
            onChange={(e) =>
              setForm({ ...form, role: e.target.value })
            }
          >
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>

          <button onClick={createUser}>
             Create
          </button>

        </div>
      )}

    </div>
  );
}