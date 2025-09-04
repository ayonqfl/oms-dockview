// default modules imports
import { BrowserRouter as Router } from "react-router-dom";
import { useTheme }  from "./utilities/context/ThemeContext";
import { useEffect, useState } from "react"; 
import { ToastContainer } from "react-toastify";
import "../node_modules/react-toastify/dist/ReactToastify.css";

// custom modules imports
import AppRoutes from "./routes/AppRoutes";
// custom styles imports
import "./styles/theme.css";

function App(): JSX.Element {
  const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // or you can return a <Loader /> component
  }

  return (
    <div className="app" data-theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
       <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}

export default App;
