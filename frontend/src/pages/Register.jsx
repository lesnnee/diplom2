import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    company: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

  try {
    // 1. создаём пользователя
    const res = await api.post("/auth/register", form);

    // 2. если backend возвращает token — используем его
    if (res.data.token) {
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
      return;
    }

    // 3. если token НЕ возвращается — делаем login вручную
    const loginRes = await api.post("/auth/login", {
      email: form.email,
      password: form.password,
    });

    localStorage.setItem("token", loginRes.data.token);

    navigate("/dashboard");

  } catch (err) {
    setError(err.response?.data?.message || "Register failed");
  }
};

  return (
    <div className="page">
      <form className="liquid" onSubmit={handleRegister}>
        <h2 className="title">SIGN UP</h2>

        {error && <div className="error">{error}</div>}

        <input
          className="input"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
        />

        <input
          className="input"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
        />

        <input
          className="input"
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
        />

        <input
          className="input"
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />

        <button className="button" type="submit">
          CREATE ACCOUNT
        </button>

        <div
          className="link"
          onClick={() => navigate("/")}
        >
          Already have account? Sign in
        </div>
      </form>
    </div>
  );
}