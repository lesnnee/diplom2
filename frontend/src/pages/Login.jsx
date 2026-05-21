import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
      });

          const { token, role } = res.data;

    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    console.log("ROLE FROM BACK:", role);

    const userRole = role?.toLowerCase().trim();

if (userRole === "operator") {
  navigate("/operator");
} else if (userRole === "admin") {
  navigate("/admin");
} else if (
  userRole === "it_support" ||
  userRole === "network_admin" ||
  userRole === "sysadmin" ||
  userRole === "security" ||
  userRole === "hardware_support"
) {
  navigate("/specialist");
}
else {
  navigate("/dashboard");
}
    } catch (err) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="page">
      <form className="liquid" onSubmit={handleLogin}>
        <h2 className="title">ВХОД</h2>

        {error && <div className="error">{error}</div>}

        <input
          className="input"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="input"
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button className="button" type="submit">
          ВОЙТИ
        </button>

        <div
          className="link"
          onClick={() => navigate("/register")}
        >
          Создать аккаунт
        </div>
      </form>
    </div>
  );
}