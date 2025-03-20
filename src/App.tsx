
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/i18n'; // Fixed import path
import { useTheme } from './hooks/useTheme';
import { ProtectedRoute } from './components/ProtectedRoute';
import SalesOpportunities from "./pages/SalesOpportunities";

function App() {
  const { i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [locale, setLocale] = useState(i18n.language);

  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale, i18n]);

  const handleLocaleChange = (newLocale: string) => {
    setLocale(newLocale);
  };

  return (
    <Routes>
      <Route path="/" element={<div>Landing Page</div>} />
      <Route path="/login" element={<div>Login Page</div>} />
      <Route path="/register" element={<div>Register Page</div>} />
      <Route path="/terms-of-service" element={<div>Terms of Service</div>} />
      <Route path="/privacy-policy" element={<div>Privacy Policy</div>} />
      <Route path="/contact-us" element={<div>Contact Us</div>} />
      <Route path="/unauthorized" element={<div>Unauthorized</div>} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><div>User Dashboard</div></ProtectedRoute>} />

      {/* Company Routes */}
      <Route path="/companies" element={<ProtectedRoute><div>Companies</div></ProtectedRoute>} />
      <Route path="/companies/create" element={<ProtectedRoute><div>Create Company</div></ProtectedRoute>} />
      <Route path="/company/:id" element={<ProtectedRoute><div>Company Profile</div></ProtectedRoute>} />
      <Route path="/company/:id/settings" element={<ProtectedRoute><div>Company Settings</div></ProtectedRoute>} />
      <Route path="/company/:id/assessment" element={<ProtectedRoute><div>Assessment Page</div></ProtectedRoute>} />
      
      {/* Add the new route for Sales Opportunities */}
      <Route path="/company/:id/sales-opportunities" element={<SalesOpportunities />} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
