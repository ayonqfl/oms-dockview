import { Navigate, Outlet } from "react-router-dom";

interface AuthRouteProps {
  isAuthenticated: boolean;
}

const AuthRoute = ({ isAuthenticated }: AuthRouteProps) => {
    console.log("AuthRoute - isAuthenticated:", isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default AuthRoute;   
