
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';
import { Toaster } from './components/ui/toaster.tsx';
import { LanguageProvider } from './contexts/LanguageContext';

// Import i18n (must be before rendering App)
import './i18n/i18n';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <App />
        <Toaster />
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
