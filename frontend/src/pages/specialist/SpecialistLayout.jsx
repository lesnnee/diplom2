import { NavLink, Outlet } from "react-router-dom";

export default function SpecialistLayout() {
  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="sidebar glass">

        <div className="logo">
          Панель специалиста
        </div>

        <nav className="nav">

          <NavLink to="/specialist" end>
            Главная
          </NavLink>

          <NavLink to="/specialist/tickets">
            Обращения
          </NavLink>

          <NavLink to="/specialist/knowledge">
            База знаний
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
            Выйти
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