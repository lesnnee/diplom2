import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

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

  const createUser = async () => {
    try {
      await api.post("/admin/users", form);
      setForm({ name: "", email: "", password: "", role: "user" });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteUser = async (id) => {
    try {
      await api.delete(`/admin/users/${id}`);
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const changeRole = async (id, role) => {
    try {
      await api.patch(`/admin/users/${id}`, { role });
      loadUsers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="users-page glass">

      {/* CREATE USER */}
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
          <option value="user">User</option>
          <option value="operator">Operator</option>
          <option value="specialist">Specialist</option>
          <option value="admin">Admin</option>
        </select>

        <button onClick={createUser}>
          ➕ Create
        </button>

      </div>

      {/* USERS LIST */}
      <div className="users-list">

        {users.map((u) => (
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
                <option value="user">user</option>
                <option value="operator">operator</option>
                <option value="specialist">specialist</option>
                <option value="admin">admin</option>
              </select>

              <button
                className="danger"
                onClick={() => deleteUser(u._id)}
              >
                🗑 Delete
              </button>

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}