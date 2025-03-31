
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import DocumentCenter from "@/pages/DocumentCenter";
import NotFound from './pages/NotFound';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { UserLayout } from './components/user/UserLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import MaterialityAnalysis from './pages/assessment/MaterialityAnalysis';
import CarbonEvaluation from './pages/assessment/CarbonEvaluation';
import ValueChainModeling from './pages/assessment/ValueChainModeling';
import ValueChainResults from './pages/assessment/ValueChainResults';
import Dashboard from './pages/Dashboard';
import Training from './pages/Training';
import Engagement from './pages/Engagement';
import Unauthorized from './pages/Unauthorized';
import Profile from './pages/Profile';
import CompanyProfile from './pages/company/CompanyProfile';
import CompanySettings from './pages/company/CompanySettings';
import ActionPlan from './pages/assessment/ActionPlan';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <LanguageProvider>
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              
              {/* Protected routes with user layout */}
              <Route element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route path="/" element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="assessment" element={<Assessment />} />
                <Route path="assessment/value-chain" element={<ValueChainModeling />} />
                <Route path="assessment/value-chain-results" element={<ValueChainResults />} />
                <Route path="assessment/materiality-analysis" element={<MaterialityAnalysis />} />
                <Route path="carbon-evaluation" element={<CarbonEvaluation />} />
                <Route path="action-plan" element={<ActionPlan />} />
                <Route path="training" element={<Training />} />
                <Route path="documents" element={<DocumentCenter />} />
                <Route path="engagement" element={<Engagement />} />
                <Route path="profile" element={<Profile />} />
                
                {/* Company pages */}
                <Route path="company/:id" element={<CompanyProfile />} />
                <Route path="company/:id/settings" element={<CompanySettings />} />
                
                {/* Legacy redirects */}
                <Route path="carbon-footprint" element={<Navigate to="/carbon-evaluation" replace />} />
                <Route path="materiality-analysis" element={<Navigate to="/assessment/materiality-analysis" replace />} />
                <Route path="companies" element={<Navigate to="/profile" replace />} />
                <Route path="assessment/iro" element={<Navigate to="/assessment" replace />} />
                <Route path="assessment/carbon-evaluation" element={<Navigate to="/carbon-evaluation" replace />} />
              </Route>
              
              {/* Admin routes */}
              <Route element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout title="Admin Dashboard" />
                </ProtectedRoute>
              }>
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/admin/dashboard" element={<div>Admin Dashboard (Coming Soon)</div>} />
                <Route path="/admin/users" element={<div>User Management (Coming Soon)</div>} />
                <Route path="/admin/settings" element={<div>Admin Settings (Coming Soon)</div>} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </LanguageProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
