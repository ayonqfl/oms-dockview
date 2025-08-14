import { Routes, Route, Navigate } from "react-router-dom";
// layouts
import DashboardLayout from "../layouts/DashboardLayout";
// pages
import Dashboard from "../pages/Dashboard";
import TradeView from "../pages/TradeView";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardLayout />}>
        <Route index element={<Navigate to="/trade" />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="trade" element={<TradeView />} />
      </Route>
    </Routes>
  );
}

export default AppRoutes;
