import React from 'react';
import { createRoot } from 'react-dom'; // Change import statement
import { BrowserRouter } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import App from './App';
import './index.css';

const root = createRoot(document.getElementById('root')); // Use createRoot directly

root.render(
  <Auth0Provider
    domain="dev-kvoeu1py20ixnbyx.us.auth0.com"
    clientId="8UmvO7eoJtdSF3LnBoRfnMvsIl2bCWPc"
    authorizationParams={{
      redirect_uri: window.location.origin
    }}
  >
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  </Auth0Provider>
);
