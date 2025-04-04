
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
import UserManagement from './pages/admin/UserManagement';
import AdminPanel from './pages/admin/AdminPanel';
import ContentManagement from './pages/admin/ContentManagement';
import TrainingAdmin from './pages/admin/Training';
import TranslationAdmin from './pages/admin/TranslationAdmin';
import EmissionFactors from './pages/admin/EmissionFactors';
import Deliverables from './pages/Deliverables';
import ESGDiagnosticResults from './pages/assessment/ESGDiagnosticResults';
import CarbonEvaluationResults from './pages/assessment/CarbonEvaluationResults';
import ActionPlanResults from './pages/assessment/ActionPlanResults';

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
                <Route path="carbon-evaluation" element={<CarbonEvaluation />} />
                <Route path="carbon-evaluation/results" element={<CarbonEvaluationResults />} />
                <Route path="action-plan" element={<ActionPlan />} />
                <Route path="action-plan/results" element={<ActionPlanResults />} />
                <Route path="training" element={<Training />} />
                <Route path="documents" element={<DocumentCenter />} />
                <Route path="deliverables" element={<Deliverables />} />
                <Route path="engagement" element={<Engagement />} />
                
                {/* Assessment module routes */}
                <Route path="assessment/materiality-analysis" element={<MaterialityAnalysis />} />
                <Route path="assessment/results" element={<ESGDiagnosticResults />} />
                
                {/* Legacy redirects */}
                <Route path="carbon-footprint" element={<Navigate to="/carbon-evaluation" replace />} />
                <Route path="materiality-analysis" element={<Navigate to="/assessment/materiality-analysis" replace />} />
                <Route path="companies" element={<Navigate to="/profile" replace />} />
                <Route path="assessment/iro" element={<Navigate to="/assessment" replace />} />
                <Route path="assessment/carbon-evaluation" element={<Navigate to="/carbon-evaluation" replace />} />
              </Route>
              
              {/* Profile and Company pages use UserLayout directly */}
              <Route path="profile" element={<Profile />} />
              <Route path="company/:id" element={<CompanyProfile />} />
              <Route path="company/:id/settings" element={<CompanySettings />} />
              
              {/* Admin routes */}
              <Route element={
                <ProtectedRoute requiredRole="admin">
                  <UserLayout title="Admin Dashboard" />
                </ProtectedRoute>
              }>
                <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/training" element={<TrainingAdmin />} />
                <Route path="/admin/content" element={<ContentManagement />} />
                <Route path="/admin/translations" element={<TranslationAdmin />} />
                <Route path="/admin/emission-factors" element={<EmissionFactors />} />
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
