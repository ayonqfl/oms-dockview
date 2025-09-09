import { Routes, Route, Navigate } from "react-router-dom";
// layouts
import DashboardLayout from "../layouts/DashboardLayout";

// pages
import Dashboard from "../pages/Dashboard";
import TradeView from "../pages/TradeView";
import Login from "../pages/Login";
import Logout from "../pages/Logout";

// auth
import AuthRoute from "../routes/AuthRoute";

interface AppRoutesProps {
  isAuthenticated: boolean;
}

function AppRoutes({ isAuthenticated }: AppRoutesProps): JSX.Element {
  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <Login />}
      />

      {/* Protected routes */}
      <Route element={<AuthRoute isAuthenticated={isAuthenticated} />}>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/trade" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="trade" element={<TradeView />} />
          <Route path="logout" element={<Logout />} />
        </Route>
      </Route>

      {/* Catch all */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />}
      />
    </Routes>
  );
}

export default AppRoutes;
