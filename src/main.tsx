import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import '../node_modules/ag-grid-community/styles/ag-theme-alpine.css';

import { ThemeProvider } from './utilities/context/ThemeProvider';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import App from './App';

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
