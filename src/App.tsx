
import React from 'react';
import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { LoadingScreen } from "@/components/LoadingScreen";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Import all pages here (dynamic imports)
const Home = React.lazy(() => import('./pages/Home'));
const Login = React.lazy(() => import('./pages/Login'));
const Register = React.lazy(() => import('./pages/Register'));
const ForgotPassword = React.lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = React.lazy(() => import('./pages/ResetPassword'));
const Profile = React.lazy(() => import('./pages/Profile'));
const Assessment = React.lazy(() => import('./pages/assessment/Assessment'));
const ESGDiagnostic = React.lazy(() => import('./pages/assessment/ESGDiagnostic'));
const ESGDiagnosticResults = React.lazy(() => import('./pages/assessment/ESGDiagnosticResults'));
const Training = React.lazy(() => import('./pages/Training'));
const CourseDetails = React.lazy(() => import('./pages/CourseDetails'));
const ModuleDetails = React.lazy(() => import('./pages/ModuleDetails'));
const ValueChain = React.lazy(() => import('./pages/ValueChain'));
const Engagement = React.lazy(() => import('./pages/Engagement'));
import { AdminPanel, UserManagement, DiagnosticsPage } from './pages/admin';
import { CompanyManagement } from './pages/admin/CompanyManagement';
import { CourseManagement } from './pages/admin/CourseManagement';
import ModuleManagement from './pages/admin/ModuleManagement';
import { ContentItemManagement } from './pages/admin/ContentItemManagement';
import { Certificates } from './pages/Certificates';
import { EngagementTracker } from './components/engagement/EngagementTracker';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <Home />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/login" element={
          <React.Suspense fallback={<LoadingScreen />}>
            <Login />
          </React.Suspense>
        } />
        <Route path="/register" element={
          <React.Suspense fallback={<LoadingScreen />}>
            <Register />
          </React.Suspense>
        } />
        <Route path="/forgot-password" element={
          <React.Suspense fallback={<LoadingScreen />}>
            <ForgotPassword />
          </React.Suspense>
        } />
        <Route path="/reset-password" element={
          <React.Suspense fallback={<LoadingScreen />}>
            <ResetPassword />
          </React.Suspense>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <Profile />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/assessment" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <Assessment />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/assessment/esg-diagnostic" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <ESGDiagnostic />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/assessment/esg-diagnostic/results" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <ESGDiagnosticResults />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/training" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <Training />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/training/course/:courseId" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <CourseDetails />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/training/module/:moduleId" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <ModuleDetails />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/value-chain" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <ValueChain />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/engagement" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <Engagement />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/panel" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <AdminPanel />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <UserManagement />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/companies" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <CompanyManagement />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/courses" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <CourseManagement />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/modules" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <ModuleManagement />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/content-items" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <ContentItemManagement />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/certificates" element={
          <ProtectedRoute>
            <React.Suspense fallback={<LoadingScreen />}>
              <Certificates />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/admin/diagnostics" element={
          <ProtectedRoute requiredRole="admin">
            <React.Suspense fallback={<LoadingScreen />}>
              <DiagnosticsPage />
            </React.Suspense>
          </ProtectedRoute>
        } />
        <Route path="/unauthorized" element={<div>Unauthorized</div>} />
      </Routes>
      <EngagementTracker />
    </>
  );
}

export default App;
