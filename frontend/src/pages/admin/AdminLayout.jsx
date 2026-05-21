import { NavLink, Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="operator-layout">

      {/* SIDEBAR */}
      <aside className="sidebar glass">

        <div className="logo">
          Панель Администратора
        </div>

        <nav className="nav">

          <NavLink to="/admin" end>
            Главная
          </NavLink>

          <NavLink to="/admin/users">
            Пользователи
          </NavLink>

          <NavLink to="/admin/settings">
            Настройки системы
          </NavLink>

          <NavLink to="/admin/stats">
            Статистика
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