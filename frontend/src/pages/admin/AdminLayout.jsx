import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="sidebar glass">

        <div className="logo">
          ⚙️ Admin Panel
        </div>

        <nav className="nav">

          <NavLink to="/admin" end>
            🏠 Dashboard
          </NavLink>

          <NavLink to="/admin/users">
            👥 Users
          </NavLink>

          <NavLink to="/admin/settings">
            ⚙️ System Settings
          </NavLink>

          <NavLink to="/admin/stats">
            📈 Statistics
          </NavLink>

          <NavLink to="/admin/logs">
            📜 Logs
          </NavLink>

        </nav>

        <div className="sidebar-bottom">
          <button
            className="logout-btn"
            onClick={() => {
              localStorage.removeItem("token");
              window.location.href = "/";
            }}
          >
            🚪 Logout
          </button>
        </div>

      </aside>

      {/* MAIN CONTENT */}
      <main className="operator-main">
        <Outlet />
      </main>

    </div>
  );
}