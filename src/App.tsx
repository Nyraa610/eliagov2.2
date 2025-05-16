
import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Account } from './pages/Account';
import { Home } from './pages/Home';
import { Pricing } from './pages/Pricing';
import { Contact } from './pages/Contact';
import { About } from './pages/About';
import { Dashboard } from './pages/Dashboard';
import { useTranslation } from 'react-i18next';
import './i18n';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { DocumentCenter } from './pages/DocumentCenter';
import { Login } from './pages/Login';

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  const { t } = useTranslation();
  
  if (isLoading) {
    return <div>{t('common.loading', 'Loading...')}</div>;
  }
  
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/about" element={<About />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/account" element={
          <ProtectedRoute>
            <Account />
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />
        } />
        <Route path="/documents/personal" element={
          <ProtectedRoute>
            <DocumentCenter />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
