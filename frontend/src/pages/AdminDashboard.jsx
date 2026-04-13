import { useEffect, useState } from "react";
import api from "../api/axios";

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);

  const loadUsers = async () => {
    const res = await api.get("/users");
    setUsers(res.data);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const changeRole = async (id, role) => {
    await api.patch(`/users/${id}/role`, { role });
    loadUsers();
  };

  return (
    <div className="admin-page">
      <h1>Admin Panel</h1>

      <div className="user-list">
        {users.map((u) => (
          <div key={u._id} className="user-card">

            <h3>{u.name}</h3>
            <p>{u.email}</p>

            <p>Role: {u.role}</p>

            <select
              onChange={(e) => changeRole(u._id, e.target.value)}
              defaultValue={u.role}
            >
              <option value="user">user</option>
              <option value="operator">operator</option>
              <option value="admin">admin</option>
            </select>

          </div>
        ))}
      </div>
    </div>
  );
}