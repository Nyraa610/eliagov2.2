import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toaster } from './components/ui/toaster';
import Dashboard from './pages/Dashboard';
import ActionPlan from './pages/assessment/ActionPlan';
import ActionPlanResults from './pages/assessment/ActionPlanResults';
import DeliveryProviders from './pages/assessment/DeliveryProviders';
import DeliveryProviderDetail from './pages/assessment/DeliveryProviderDetail';
import { UserLayout } from './components/user/UserLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Assessment from './pages/Assessment';
import EsgDiagnostic from './pages/assessment/EsgDiagnostic';
import ValueChain from './pages/assessment/ValueChain';
import MaterialityAnalysis from './pages/assessment/MaterialityAnalysis';
import IroAnalysis from './pages/assessment/IroAnalysis';
import StakeholderMapping from './pages/assessment/StakeholderMapping';
import CarbonEvaluation from './pages/assessment/CarbonEvaluation';
import Deliverables from './pages/Deliverables';
import Experts from './pages/Experts';
import Training from './pages/Training';
import Documents from './pages/Documents';
import Engagement from './pages/Engagement';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersAdmin from './pages/admin/UsersAdmin';
import CompaniesAdmin from './pages/admin/CompaniesAdmin';
import AssessmentsAdmin from './pages/admin/AssessmentsAdmin';
import AdminLayout from './components/admin/AdminLayout';
import CompanyHub from './pages/CompanyHub';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';
import { useAuth } from './contexts/AuthContext';
import { Navigate } from 'react-router';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/unauthorized" element={<Unauthorized />} />
        
        {/* User routes */}
        <Route path="/" element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/assessment/esg-diagnostic" element={<EsgDiagnostic />} />
          <Route path="/assessment/value-chain" element={<ValueChain />} />
          <Route path="/assessment/materiality-analysis" element={<MaterialityAnalysis />} />
          <Route path="/assessment/iro" element={<IroAnalysis />} />
          <Route path="/assessment/stakeholder-mapping" element={<StakeholderMapping />} />
          <Route path="/assessment/carbon-evaluation" element={<CarbonEvaluation />} />
          <Route path="/assessment/action-plan" element={<ActionPlan />} />
          <Route path="/assessment/action-plan-results" element={<ActionPlanResults />} />
          
          {/* New delivery providers routes */}
          <Route path="/assessment/action-plan/providers" element={<DeliveryProviders />} />
          <Route path="/assessment/action-plan/providers/:providerId" element={<DeliveryProviderDetail />} />
          
          <Route path="/deliverables" element={<Deliverables />} />
          <Route path="/experts" element={<Experts />} />
          <Route path="/training" element={<Training />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/engagement" element={<Engagement />} />
          <Route path="/company-hub" element={<CompanyHub />} />
        </Route>
        
        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UsersAdmin />} />
          <Route path="companies" element={<CompaniesAdmin />} />
          <Route path="assessments" element={<AssessmentsAdmin />} />
        </Route>
        
        {/* Catch-all route for 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      <Toaster />
    </Router>
  );
}

export default App;
