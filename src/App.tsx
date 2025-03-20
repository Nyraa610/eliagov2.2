
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './i18n/i18n'; // Fixed import path
import { useTheme } from './hooks/useTheme';
import { ThemeProvider } from './components/ui/theme-provider';
import { SiteHeader } from './components/layout/SiteHeader';
import { SiteFooter } from './components/layout/SiteFooter';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { UserDashboard } from './pages/user/UserDashboard';
import { CompanyDashboard } from './pages/company/CompanyDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserRole } from './services/base/profileTypes';
import { CompanyProfile } from './pages/company/CompanyProfile';
import { CompanySettings } from './pages/company/CompanySettings';
import { Companies } from './pages/Companies';
import { CreateCompany } from './pages/CreateCompany';
import { TermsOfService } from './pages/TermsOfService';
import { PrivacyPolicy } from './pages/PrivacyPolicy';
import { ContactUs } from './pages/ContactUs';
import { Unauthorized } from './pages/Unauthorized';
import { AssessmentPage } from './pages/assessment/AssessmentPage';
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
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* User Routes */}
      <Route path="/dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />

      {/* Company Routes */}
      <Route path="/companies" element={<ProtectedRoute><Companies /></ProtectedRoute>} />
      <Route path="/companies/create" element={<ProtectedRoute requiredRole={UserRole.ADMIN}><CreateCompany /></ProtectedRoute>} />
      <Route path="/company/:id" element={<ProtectedRoute><CompanyProfile /></ProtectedRoute>} />
      <Route path="/company/:id/settings" element={<ProtectedRoute><CompanySettings /></ProtectedRoute>} />
      <Route path="/company/:id/assessment" element={<ProtectedRoute><AssessmentPage /></ProtectedRoute>} />
      
      {/* Add the new route for Sales Opportunities */}
      <Route path="/company/:id/sales-opportunities" element={<SalesOpportunities />} />
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;
