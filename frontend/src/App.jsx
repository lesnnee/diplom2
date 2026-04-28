import { BrowserRouter, Route, Routes } from "react-router-dom";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SpecialistDashboard from "./pages/SpecialistDashboard";
import TicketDetails from "./pages/TicketDetails";
import Analytics from "./pages/operator/Analytics";
import KnowledgeBase from "./pages/operator/KnowledgeBase";
import MLAssistant from "./pages/operator/MLAssistant";
import OperatorDashboard from "./pages/operator/OperatorDashboard";
import OperatorLayout from "./pages/operator/OperatorLayout";
import Tickets from "./pages/operator/Tickets";

function App() {
  return (
    <BrowserRouter>
      <Routes>
  <Route path="/" element={<Login />} />
  <Route path="/dashboard" element={<Dashboard />} />
  <Route path="/register" element={<Register />} />
  <Route path="/ticket/:id" element={<TicketDetails />} />
  <Route path="/admin" element={<AdminDashboard />} />
  <Route path="/specialist" element={<SpecialistDashboard />} />
  <Route path="/operator" element={<OperatorLayout />}>
    <Route index element={<OperatorDashboard />} />
    <Route path="tickets" element={<Tickets />} />
    <Route path="ml" element={<MLAssistant />} />
    <Route path="knowledge" element={<KnowledgeBase />} />
    <Route path="analytics" element={<Analytics />} />
  </Route>
</Routes>
    </BrowserRouter>
  );
}

export default App;