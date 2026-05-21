import { NavLink, Outlet } from "react-router-dom";

export default function OperatorLayout() {
  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="sidebar glass">

        <div className="logo">
          Панель оператора
        </div>

        <nav className="nav">

          <NavLink to="/operator" end>
            Главная
          </NavLink>

          <NavLink to="/operator/tickets">
            Обращения
          </NavLink>


          <NavLink to="/operator/knowledge">
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