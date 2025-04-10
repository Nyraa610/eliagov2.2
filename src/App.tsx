import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { LoadingScreen } from "@/components/LoadingScreen";

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
import { ModuleManagement } from './pages/admin/ModuleManagement';
import { ContentItemManagement } from './pages/admin/ContentItemManagement';
import { Certificates } from './pages/Certificates';
import { EngagementTracker } from './components/engagement/EngagementTracker';

// Protected route component
const ProtectedRoute = ({ children, requiredRoles }: {
  children: React.ReactNode;
  requiredRoles?: string[];
}) => {
  const { isAuthenticated, hasRole, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRoles && !requiredRoles.every(role => hasRole(role))) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <Home />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <React.Suspense fallback={<LoadingScreen />}>
        <Login />
      </React.Suspense>
    ),
  },
  {
    path: "/register",
    element: (
      <React.Suspense fallback={<LoadingScreen />}>
        <Register />
      </React.Suspense>
    ),
  },
  {
    path: "/forgot-password",
    element: (
      <React.Suspense fallback={<LoadingScreen />}>
        <ForgotPassword />
      </React.Suspense>
    ),
  },
  {
    path: "/reset-password",
    element: (
      <React.Suspense fallback={<LoadingScreen />}>
        <ResetPassword />
      </React.Suspense>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <Profile />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assessment",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <Assessment />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assessment/esg-diagnostic",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <ESGDiagnostic />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assessment/esg-diagnostic/results",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <ESGDiagnosticResults />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/training",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <Training />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/training/course/:courseId",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <CourseDetails />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/training/module/:moduleId",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <ModuleDetails />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/value-chain",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <ValueChain />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/engagement",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <Engagement />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/panel",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <AdminPanel />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <UserManagement />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/companies",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <CompanyManagement />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/courses",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <CourseManagement />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/modules",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <ModuleManagement />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/content-items",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <ContentItemManagement />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  {
    path: "/certificates",
    element: (
      <ProtectedRoute>
        <React.Suspense fallback={<LoadingScreen />}>
          <Certificates />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
  
  // Add the diagnostics page route
  {
    path: "/admin/diagnostics",
    element: (
      <ProtectedRoute requiredRoles={["admin"]}>
        <React.Suspense fallback={<LoadingScreen />}>
          <DiagnosticsPage />
        </React.Suspense>
      </ProtectedRoute>
    ),
  },
]);

function App() {
  return (
    <>
      <RouterProvider router={router} />
      <EngagementTracker />
    </>
  );
}

export default App;
