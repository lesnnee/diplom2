import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import OperatorDashboard from "./pages/OperatorDashboard";
import Register from "./pages/Register";
import SpecialistDashboard from "./pages/SpecialistDashboard";
import TicketDetails from "./pages/TicketDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/register" element={<Register />} />
  <Route path="/ticket/:id" element={<TicketDetails />} />
  <Route path="/operator" element={<OperatorDashboard />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/specialist" element={<SpecialistDashboard />} />
</Routes>
    </BrowserRouter>
  );
}

export default App;