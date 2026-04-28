import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Settings() {
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [newRole, setNewRole] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState("");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get("/admin/settings");

      setRoles(res.data.roles);
      setCategories(res.data.categories);
      setPriorities(res.data.priorities);
    } catch (err) {
      console.error(err);
    }
  };

  // ROLES
  const addRole = async () => {
    await api.post("/admin/settings/roles", { role: newRole });
    setNewRole("");
    loadSettings();
  };

  const deleteRole = async (role) => {
    await api.delete(`/admin/settings/roles/${role}`);
    loadSettings();
  };

  // CATEGORIES
  const addCategory = async () => {
    await api.post("/admin/settings/categories", {
      category: newCategory,
    });
    setNewCategory("");
    loadSettings();
  };

  const deleteCategory = async (cat) => {
    await api.delete(`/admin/settings/categories/${cat}`);
    loadSettings();
  };

  // PRIORITIES
  const addPriority = async () => {
    await api.post("/admin/settings/priorities", {
      priority: newPriority,
    });
    setNewPriority("");
    loadSettings();
  };

  const deletePriority = async (p) => {
    await api.delete(`/admin/settings/priorities/${p}`);
    loadSettings();
  };

  return (
    <div className="settings-page glass">

      {/* ROLES */}
      <div className="card glass block">
        <h2>Roles</h2>

        <div className="list">
          {roles.map((r) => (
            <div key={r} className="item">
              <span>{r}</span>
              <button onClick={() => deleteRole(r)}>🗑</button>
            </div>
          ))}
        </div>

        <input
          value={newRole}
          onChange={(e) => setNewRole(e.target.value)}
          placeholder="New role"
        />

        <button onClick={addRole}>Add Role</button>
      </div>

      {/* CATEGORIES */}
      <div className="card glass block">
        <h2>Categories</h2>

        <div className="list">
          {categories.map((c) => (
            <div key={c} className="item">
              <span>{c}</span>
              <button onClick={() => deleteCategory(c)}>🗑</button>
            </div>
          ))}
        </div>

        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="New category"
        />

        <button onClick={addCategory}>Add Category</button>
      </div>

      {/* PRIORITIES */}
      <div className="card glass block">
        <h2>Priorities</h2>

        <div className="list">
          {priorities.map((p) => (
            <div key={p} className="item">
              <span>{p}</span>
              <button onClick={() => deletePriority(p)}>🗑</button>
            </div>
          ))}
        </div>

        <input
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          placeholder="New priority"
        />

        <button onClick={addPriority}>Add Priority</button>
      </div>

    </div>
  );
}