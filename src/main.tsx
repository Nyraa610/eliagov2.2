
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { Toaster } from './components/ui/toaster.tsx';
import { AuthProvider } from './contexts/AuthContext';

// Import i18n (must be before rendering App)
import './i18n/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <App />
      <Toaster />
    </AuthProvider>
  </React.StrictMode>,
);
