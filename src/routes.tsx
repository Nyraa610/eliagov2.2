
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { UserLayout } from './components/user/UserLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import AssessmentPage from './pages/Assessment';
import ActionPlan from './pages/assessment/ActionPlan';
import ActionPlanResults from './pages/assessment/ActionPlanResults';
import DocumentEditor from './pages/assessment/DocumentEditor';
import AdminPanel from './pages/admin/AdminPanel';
import EmissionFactors from './pages/admin/EmissionFactors';
import NotionIntegration from './components/integrations/notion/NotionIntegration';
import ActionPlanExportPage from './pages/ActionPlanExportPage';
import MarketplacePage from './pages/marketplace/MarketplacePage';
import PartnerApplicationPage from './pages/marketplace/PartnerApplicationPage';
import PartnersManagementPage from './pages/admin/marketplace/PartnersManagementPage';
import PartnerApplicationsPage from './pages/admin/marketplace/PartnerApplicationsPage';
import MarketplaceLeadsPage from './pages/admin/marketplace/MarketplaceLeadsPage';

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Protected routes - require authentication */}
      <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
        <Route element={<UserLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          
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
