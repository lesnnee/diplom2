import { useEffect, useState } from "react";
import api from "../../api/axios";

export default function Settings() {
  const [roles, setRoles] = useState([]);
  const [categories, setCategories] = useState([]);
  const [priorities, setPriorities] = useState([]);

  const [newRole, setNewRole] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [newPriority, setNewPriority] = useState("");

  // ======================
  // LOAD SETTINGS
  // ======================
  const loadSettings = async () => {
    try {
      const res = await api.get("/admin/settings");

      setRoles(res.data.roles || []);
      setCategories(res.data.categories || []);
      setPriorities(res.data.priorities || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  // ======================
  // HELPERS
  // ======================
  const refresh = () => loadSettings();

  // ======================
  // ROLES
  // ======================
  const addRole = async () => {
    if (!newRole.trim()) return;

    try {
      await api.post("/admin/settings/roles", {
        role: newRole.trim(),
      });

      setNewRole("");
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteRole = async (role) => {
    try {
      await api.delete(`/admin/settings/roles/${role}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // CATEGORIES
  // ======================
  const addCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await api.post("/admin/settings/categories", {
        category: newCategory.trim(),
      });

      setNewCategory("");
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const deleteCategory = async (cat) => {
    try {
      await api.delete(`/admin/settings/categories/${cat}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // PRIORITIES
  // ======================
  const addPriority = async () => {
    const value = Number(newPriority);

    if (!value || value < 1) return;

    try {
      await api.post("/admin/settings/priorities", {
        priority: value,
      });

      setNewPriority("");
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const deletePriority = async (p) => {
    try {
      await api.delete(`/admin/settings/priorities/${p}`);
      refresh();
    } catch (err) {
      console.error(err);
    }
  };

  // ======================
  // UI
  // ======================
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
              <span>P{p}</span>
              <button onClick={() => deletePriority(p)}>🗑</button>
            </div>
          ))}
        </div>

        <input
          value={newPriority}
          onChange={(e) => setNewPriority(e.target.value)}
          placeholder="New priority (1-5)"
        />

        <button onClick={addPriority}>Add Priority</button>
      </div>

    </div>
  );
}