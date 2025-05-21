
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import { UserLayout } from './components/user/UserLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import AssessmentPage from './pages/assessment/AssessmentPage';
import ActionPlan from './pages/assessment/ActionPlan';
import ActionPlanResults from './pages/assessment/ActionPlanResults';
import DocumentEditor from './pages/assessment/DocumentEditor';
import AdminPanel from './pages/admin/AdminPanel';
import EmissionFactors from './pages/admin/EmissionFactors';
import AdminUserManagement from './pages/admin/AdminUserManagement';
import CompanyPage from './pages/CompanyPage';
import CompanyProfilePage from './pages/CompanyProfilePage';
import DocumentsPage from './pages/DocumentsPage';
import CompaniesPage from './pages/CompaniesPage';
import NotionIntegration from './components/integrations/notion/NotionIntegration';
import ActionPlanExportPage from './pages/ActionPlanExportPage';
import PartnerApplicationPage from './pages/marketplace/PartnerApplicationPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import PartnersManagementPage from './pages/admin/marketplace/PartnersManagementPage';
import PartnerApplicationsPage from './pages/admin/marketplace/PartnerApplicationsPage';
import MarketplaceLeadsPage from './pages/admin/marketplace/MarketplaceLeadsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      
      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute />}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/companies" element={<CompaniesPage />} />
          <Route path="/company/:id" element={<CompanyProfilePage />} />
          <Route path="/company" element={<CompanyPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          <Route path="/deliverables" element={<DocumentsPage />} />
          
          {/* Assessment routes */}
          <Route path="/assessment" element={<AssessmentPage />} />
          <Route path="/assessment/action-plan" element={<ActionPlan />} />
          <Route path="/assessment/action-plan-results" element={<ActionPlanResults />} />
          <Route path="/assessment/document-editor" element={<DocumentEditor />} />
          
          {/* Integrations routes */}
          <Route path="/integrations/notion" element={<NotionIntegration />} />
          <Route path="/integrations/action-plan-export" element={<ActionPlanExportPage />} />
          
          {/* Marketplace routes */}
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/marketplace/apply" element={<PartnerApplicationPage />} />
          
          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminPanel />} />
            <Route path="emission-factors" element={<EmissionFactors />} />
            <Route path="users" element={<AdminUserManagement />} />
            
            {/* Admin marketplace routes */}
            <Route path="marketplace/partners" element={<PartnersManagementPage />} />
            <Route path="marketplace/applications" element={<PartnerApplicationsPage />} />
            <Route path="marketplace/leads" element={<MarketplaceLeadsPage />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default AppRoutes;
