// default modules imports
import { BrowserRouter as Router } from "react-router-dom";
import { useTheme } from "./utilities/context/ThemeContext"
import { useEffect, useState } from "react";

// custom modules imports
import AppRoutes from "./routes/AppRoutes";

// custom styles imports
import './styles/theme.css';
import './styles/app.css';

function App() {
 const { theme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);


  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div  className="app" data-theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
    </div>
   
  );
}

export default App
