import { ThemeProvider } from './utilities/context/ThemeProvider';
import { createRoot } from 'react-dom/client';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { setConfig } from './slices/configSlicer';
import { brokerConfiguration } from './utilities/apiRequest/settings';
import store from './store/index';  
import App from './App';

import '../node_modules/ag-grid-community/styles/ag-theme-alpine.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';
import adminServer from './utilities/server/serverAdmin';

const container = document.getElementById('root');
if (!container) {
  throw new Error("Root element with id 'root' not found");
}

const root = createRoot(container);



const bootstrapApplication = async () => {
  try {
 
    const config_res = await adminServer.get(`${brokerConfiguration}`);
    store.dispatch(setConfig(config_res.data.data))

    // Now render the full app
    root.render(
      <StrictMode>
        <Provider store={store}>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </Provider>
      </StrictMode>
    );
  } catch (error) {
    console.error('Failed to load config:', error);
    root.render(
      <div style={{ color: 'red', padding: '20px' }}>
        <h2>Application failed to start</h2>
        <p>Could not load configuration or connect to server. Please try again later.</p>
      </div>
    );
  }
};

// Start bootstrapping
bootstrapApplication();
