
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
              <Route path="/" element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route index element={<Dashboard />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="assessment" element={<Assessment />} />
                <Route path="assessment/value-chain" element={<ValueChainModeling />} />
                <Route path="assessment/value-chain-results" element={<ValueChainResults />} />
                <Route path="assessment/carbon-evaluation" element={<CarbonEvaluation />} />
                <Route path="assessment/materiality-analysis" element={<MaterialityAnalysis />} />
                <Route path="training" element={<Training />} />
                <Route path="documents" element={<DocumentCenter />} />
                <Route path="engagement" element={<Engagement />} />
                <Route path="action-plan" element={<div>Action Plan (Coming Soon)</div>} />
                <Route path="profile" element={<Profile />} />
                
                {/* Legacy redirects */}
                <Route path="carbon-footprint" element={<Navigate to="/assessment/carbon-evaluation" replace />} />
                <Route path="materiality-analysis" element={<Navigate to="/assessment/materiality-analysis" replace />} />
                <Route path="companies" element={<Navigate to="/profile" replace />} />
                <Route path="assessment/iro" element={<Navigate to="/assessment" replace />} />
              </Route>
              
              {/* Admin routes */}
              <Route path="/admin" element={
                <ProtectedRoute requiredRole="admin">
                  <AdminLayout title="Admin Dashboard" />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<div>Admin Dashboard (Coming Soon)</div>} />
                <Route path="users" element={<div>User Management (Coming Soon)</div>} />
                <Route path="settings" element={<div>Admin Settings (Coming Soon)</div>} />
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
