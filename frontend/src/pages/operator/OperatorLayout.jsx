import { NavLink, Outlet } from "react-router-dom";

export default function OperatorLayout() {
  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="sidebar glass">

        <div className="logo">
          ⚙️ Operator Panel
        </div>

        <nav className="nav">

          <NavLink to="/operator" end>
            🏠 Dashboard
          </NavLink>

          <NavLink to="/operator/tickets">
            🎫 Tickets
          </NavLink>


          <NavLink to="/operator/knowledge">
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