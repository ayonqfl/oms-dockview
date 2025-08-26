import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

import { ThemeProvider } from './utilities/context/ThemeProvider';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';

// Ensure the root element exists and is typed correctly
const container = document.getElementById('root');
if (!container) {
  throw new Error("Root element with id 'root' not found");
}

const root = createRoot(container);

root.render(
  <StrictMode>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </StrictMode>,
);
