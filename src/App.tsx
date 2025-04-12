
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from './components/Navigation';
import DocumentCenter from "@/pages/DocumentCenter";
import NotFound from './pages/NotFound';
import Assessment from './pages/Assessment';
import Login from './pages/Login';
import Register from './pages/Register';
import RegisterConfirmation from './pages/RegisterConfirmation';
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
import CourseForm from './pages/admin/CourseForm';
import ModuleManagement from './pages/admin/ModuleManagement';
import TranslationAdmin from './pages/admin/TranslationAdmin';
import EmissionFactors from './pages/admin/EmissionFactors';
import Deliverables from './pages/Deliverables';
import ESGDiagnosticResults from './pages/assessment/ESGDiagnosticResults';
import CarbonEvaluationResults from './pages/assessment/CarbonEvaluationResults';
import ActionPlanResults from './pages/assessment/ActionPlanResults';
import ConsultantDashboard from './pages/consultant/ConsultantDashboard';
import ConsultantNotifications from './pages/consultant/ConsultantNotifications';
import Companies from './pages/company/Companies';
import IRO from './pages/assessment/IRO';
import Pricing from './pages/Pricing';
import SubscriptionSuccess from './pages/subscription/Success';
import SubscriptionManager from './pages/admin/SubscriptionManager';
import Index from './pages/Index';
import { HotjarTracking } from './components/analytics/HotjarTracking';

function App() {
  return (
    <div className="App">
      <AuthProvider>
        <LanguageProvider>
          {/* Add Hotjar tracking at the app level */}
          <HotjarTracking />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register/confirmation" element={<RegisterConfirmation />} />
              <Route path="/unauthorized" element={<Unauthorized />} />
              <Route path="/pricing" element={<Pricing />} />
              
              {/* Protected subscription routes */}
              <Route path="/subscription/success" element={
                <ProtectedRoute>
                  <SubscriptionSuccess />
                </ProtectedRoute>
              } />
              
              {/* Protected routes with user layout */}
              <Route element={
                <ProtectedRoute>
                  <UserLayout />
                </ProtectedRoute>
              }>
                <Route path="dashboard" element={<Dashboard />} />
                
                {/* Assessment module routes - consolidated */}
                <Route path="assessment" element={<Assessment />} />
                <Route path="assessment/esg-diagnostic" element={<Assessment />} />
                <Route path="assessment/esg-diagnostic-results" element={<ESGDiagnosticResults />} />
                <Route path="assessment/carbon-evaluation" element={<CarbonEvaluation />} />
                <Route path="assessment/carbon-evaluation-results" element={<CarbonEvaluationResults />} />
                <Route path="assessment/action-plan" element={<ActionPlan />} />
                <Route path="assessment/action-plan-results" element={<ActionPlanResults />} />
                <Route path="assessment/value-chain" element={<ValueChainModeling />} />
                <Route path="assessment/value-chain-results" element={<ValueChainResults />} />
                <Route path="assessment/materiality-analysis" element={<MaterialityAnalysis />} />
                <Route path="assessment/iro" element={<IRO />} />
                
                <Route path="training" element={<Training />} />
                <Route path="documents" element={<DocumentCenter />} />
                <Route path="deliverables" element={<Deliverables />} />
                <Route path="engagement" element={<Engagement />} />
                
                {/* Consultant routes */}
                <Route path="consultant/dashboard" element={<ConsultantDashboard />} />
                <Route path="consultant/notifications" element={<ConsultantNotifications />} />
                
                {/* Companies routes - moved inside the main protected layout */}
                <Route path="companies" element={<Companies />} />
                <Route path="profile" element={<Profile />} />
                <Route path="company/:id" element={<CompanyProfile />} />
                <Route path="company/:id/settings" element={<CompanySettings />} />
                
                {/* Admin routes integrated into the main layout */}
                <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
                <Route path="/admin/panel" element={<AdminPanel />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/training" element={<TrainingAdmin />} />
                <Route path="/admin/courses/new" element={<CourseForm />} />
                <Route path="/admin/courses/:id" element={<CourseForm />} />
                <Route path="/admin/courses/:courseId/modules" element={<ModuleManagement />} />
                <Route path="/admin/content" element={<ContentManagement />} />
                <Route path="/admin/translations" element={<TranslationAdmin />} />
                <Route path="/admin/emission-factors" element={<EmissionFactors />} />
                <Route path="/admin/subscriptions" element={<SubscriptionManager />} />
              
                {/* Legacy redirects */}
                <Route path="carbon-evaluation" element={<Navigate to="/assessment/carbon-evaluation" replace />} />
                <Route path="carbon-evaluation/results" element={<Navigate to="/assessment/carbon-evaluation-results" replace />} />
                <Route path="carbon-footprint" element={<Navigate to="/assessment/carbon-evaluation" replace />} />
                <Route path="materiality-analysis" element={<Navigate to="/assessment/materiality-analysis" replace />} />
                <Route path="assessment/iro-analysis-results" element={<Navigate to="/assessment/iro" replace />} />
                <Route path="action-plan" element={<Navigate to="/assessment/action-plan" replace />} />
                <Route path="action-plan/results" element={<Navigate to="/assessment/action-plan-results" replace />} />
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
