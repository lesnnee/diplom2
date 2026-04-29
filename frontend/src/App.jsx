import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminLayout from "./pages/admin/AdminLayout";
import Logs from "./pages/admin/Logs";
import Settings from "./pages/admin/Settings";
import Statistics from "./pages/admin/Statistics";
import Users from "./pages/admin/Users";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Analytics from "./pages/operator/Analytics";
import MLAssistant from "./pages/operator/MLAssistant";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import OperatorKnowledgeBase from "./pages/operator/OperatorKnowledgeBase";
import OperatorLayout from "./pages/operator/OperatorLayout";
import Tickets from "./pages/operator/Tickets";
import Register from "./pages/Register";
import KnowledgeBase from "./pages/specialist/KnowledgeBase";
import MyTickets from "./pages/specialist/MyTickets";
import SpecialistDashboard from "./pages/specialist/SpecialistDashboard";
import SpecialistLayout from "./pages/specialist/SpecialistLayout";
import TicketDetails from "./pages/TicketDetails";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/register" element={<Register />} />
  <Route path="/ticket/:id" element={<TicketDetails />} />
  <Route path="/specialist" element={<SpecialistDashboard />} />
  <Route path="/operator" element={<OperatorLayout />}>
    <Route index element={<OperatorDashboard />} />
    <Route path="tickets" element={<Tickets />} />
    <Route path="ml" element={<MLAssistant />} />
    <Route path="knowledge" element={<OperatorKnowledgeBase />} />
    <Route path="analytics" element={<Analytics />} />
  </Route>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="users" element={<Users />} />
    <Route path="settings" element={<Settings />} />
    <Route path="stats" element={<Statistics />} />
    <Route path="logs" element={<Logs />} />
  </Route>
  <Route path="/specialist" element={<SpecialistLayout />}>
  <Route index element={<SpecialistDashboard />} />
  <Route path="tickets" element={<MyTickets />} />
  <Route path="knowledge" element={<KnowledgeBase />} />
</Route>
</Routes>
    </BrowserRouter>
  );
}

export default App;