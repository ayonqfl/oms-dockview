// default modules imports
import { BrowserRouter as Router } from "react-router-dom";
import { useTheme } from "./utilities/context/ThemeContext";
import AppRoutes from "./routes/AppRoutes";
import { useEffect, useState } from "react"; 
import { ToastContainer } from "react-toastify";
import "../node_modules/react-toastify/dist/ReactToastify.css";
import { useSelector } from "react-redux";
import { RootState } from "./store/index";

// custom modules imports
import "./styles/theme.css";

function App(): JSX.Element {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  
  // ✅ Get authentication state from Redux instead of localStorage
  const user = useSelector((state: RootState) => state.user);
  const isAuthenticated = user.isLoggedIn;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="app" data-theme={theme}>
      <Router>
        <AppRoutes isAuthenticated={isAuthenticated} />
      </Router>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;