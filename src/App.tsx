import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from "@/components/ui/toaster"
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Home from './pages/Home';
import Assessment from './pages/Assessment';
import Training from './pages/Training';
import Engagement from './pages/Engagement';
import Documents from './pages/Documents';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import AdminPanel from './pages/admin/AdminPanel';
import Users from './pages/admin/Users';
import NewCompany from './pages/company/NewCompany';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanySettings from './pages/company/CompanySettings';
import Companies from './pages/company/Companies';
import ConsultantDashboard from './pages/consultant/ConsultantDashboard';
import Notifications from './pages/consultant/Notifications';
import Features from './pages/Features';
import Deliverables from './pages/Deliverables';
import CompanyProfileRedirect from './pages/company/CompanyProfileRedirect';

function App() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="App">
      <Toaster />
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Home />} />
          <Route path="/features" element={<Features />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/training" element={<Training />} />
            <Route path="/engagement" element={<Engagement />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/deliverables" element={<Deliverables />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin routes */}
            <Route path="/admin/panel" element={<AdminPanel />} />
            <Route path="/admin/users" element={<Users />} />
            
            {/* Consultant routes */}
            <Route path="/consultant/dashboard" element={<ConsultantDashboard />} />
            <Route path="/consultant/notifications" element={<Notifications />} />
            
            {/* Company routes */}
            <Route path="/companies" element={<Companies />} />
            <Route path="/company/profile" element={<React.lazy(() => import('./pages/company/CompanyProfileRedirect'))} />
            <Route path="/company/new" element={<React.lazy(() => import('./pages/company/NewCompany'))} />
            <Route path="/company/:id" element={<React.lazy(() => import('./pages/company/CompanyProfile'))} />
            <Route path="/company/:id/settings" element={<React.lazy(() => import('./pages/company/CompanySettings'))} />
          </Route>

          {/* Fallback route */}
          <Route path="*" element={<div>Page not found</div>} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
