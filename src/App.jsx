// default modules imports
import { BrowserRouter as Router } from "react-router-dom";

// custom modules imports
import AppRoutes from "./routes/AppRoutes";

function App() {

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}

export default App
