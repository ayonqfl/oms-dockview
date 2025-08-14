// default modules imports
import { BrowserRouter as Router } from "react-router-dom";
import { useTheme } from "./utilities/context/ThemeContext"
// custom modules imports
import AppRoutes from "./routes/AppRoutes";
import './styles/theme.css';
import './styles/app.css';

function App() {
const { theme } = useTheme();
  return (
    <div  className="app" data-theme={theme}>
      <Router>
        <AppRoutes />
      </Router>
    </div>
   
  );
}

export default App
