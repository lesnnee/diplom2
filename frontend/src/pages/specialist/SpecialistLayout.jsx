import { NavLink, Outlet } from "react-router-dom";

export default function SpecialistLayout() {
  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="sidebar glass">

        <div className="logo">
          🛠 Specialist Panel
        </div>

        <nav className="nav">

          <NavLink to="/specialist" end>
            🏠 Dashboard
          </NavLink>

          <NavLink to="/specialist/tickets">
            📋 My Tickets
          </NavLink>

          <NavLink to="/specialist/knowledge">
            📚 Knowledge Base
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