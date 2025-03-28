
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import Index from "@/pages/Index";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import RegisterConfirmation from "@/pages/RegisterConfirmation";
import ResetPassword from "@/pages/ResetPassword";
import Features from "@/pages/Features";
import Assessment from "@/pages/Assessment";
import Training from "@/pages/Training";
import Dashboard from "@/pages/Dashboard";
import AdminTraining from "@/pages/admin/Training";
import CourseForm from "@/pages/admin/CourseForm";
import ModuleManagement from "@/pages/admin/ModuleManagement";
import ContentManagement from "@/pages/admin/ContentManagement";
import NotFound from "@/pages/NotFound";
import CourseView from "@/pages/CourseView";
import QuizManagement from "@/pages/admin/QuizManagement";
import Profile from "@/pages/Profile";
import Unauthorized from "@/pages/Unauthorized";
import AdminPanel from "@/pages/admin/AdminPanel";
import UserManagement from "@/pages/admin/UserManagement";
import TranslationAdmin from "@/pages/admin/TranslationAdmin";
import EmissionFactors from "@/pages/admin/EmissionFactors";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "@/contexts/AuthContext";
import CarbonEvaluation from "@/pages/assessment/CarbonEvaluation";
import MaterialityAnalysis from "@/pages/assessment/MaterialityAnalysis";
import ActionPlan from "@/pages/assessment/ActionPlan";
import IRO from "@/pages/assessment/IRO";
import Companies from "@/pages/company/Companies";
import CompanyProfile from "@/pages/company/CompanyProfile";
import NewCompany from "@/pages/company/NewCompany";
import CompanySettings from "@/pages/company/CompanySettings";
import Engagement from "@/pages/Engagement";
import ValueChainModeling from "@/pages/assessment/ValueChainModeling";
import ValueChainResults from "@/pages/assessment/ValueChainResults";

// Initialize i18n
import './i18n/i18n';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/register/confirmation",
    element: <RegisterConfirmation />,
  },
  {
    path: "/reset-password",
    element: <ResetPassword />,
  },
  {
    path: "/features",
    element: <Features />,
  },
  {
    path: "/dashboard",
    element: <ProtectedRoute><Dashboard /></ProtectedRoute>,
  },
  {
    path: "/assessment",
    element: <ProtectedRoute><Assessment /></ProtectedRoute>,
  },
  {
    path: "/carbon-footprint",
    element: <ProtectedRoute><CarbonEvaluation /></ProtectedRoute>,
  },
  {
    path: "/materiality-analysis",
    element: <ProtectedRoute><MaterialityAnalysis /></ProtectedRoute>,
  },
  {
    path: "/action-plan",
    element: <ProtectedRoute><ActionPlan /></ProtectedRoute>,
  },
  {
    path: "/assessment/carbon-evaluation",
    element: <ProtectedRoute><CarbonEvaluation /></ProtectedRoute>,
  },
  {
    path: "/assessment/materiality-analysis",
    element: <ProtectedRoute><MaterialityAnalysis /></ProtectedRoute>,
  },
  {
    path: "/assessment/action-plan",
    element: <ProtectedRoute><ActionPlan /></ProtectedRoute>,
  },
  {
    path: "/assessment/iro",
    element: <ProtectedRoute><IRO /></ProtectedRoute>,
  },
  {
    path: "/assessment/value-chain",
    element: <ProtectedRoute><ValueChainModeling /></ProtectedRoute>,
  },
  {
    path: "/assessment/value-chain/results",
    element: <ProtectedRoute><ValueChainResults /></ProtectedRoute>,
  },
  {
    path: "/training",
    element: <ProtectedRoute><Training /></ProtectedRoute>,
  },
  {
    path: "/training/courses/:courseId",
    element: <ProtectedRoute><CourseView /></ProtectedRoute>,
  },
  {
    path: "/profile",
    element: <ProtectedRoute><Profile /></ProtectedRoute>,
  },
  {
    path: "/engagement",
    element: <ProtectedRoute><Engagement /></ProtectedRoute>,
  },
  {
    path: "/unauthorized",
    element: <Unauthorized />,
  },
  {
    path: "/admin/panel",
    element: <ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>,
  },
  {
    path: "/admin/users",
    element: <ProtectedRoute requiredRole="admin"><UserManagement /></ProtectedRoute>,
  },
  {
    path: "/admin/training",
    element: <ProtectedRoute requiredRole="admin"><AdminTraining /></ProtectedRoute>,
  },
  {
    path: "/admin/translations",
    element: <ProtectedRoute requiredRole="admin"><TranslationAdmin /></ProtectedRoute>,
  },
  {
    path: "/admin/emission-factors",
    element: <ProtectedRoute requiredRole="admin"><EmissionFactors /></ProtectedRoute>,
  },
  {
    path: "/admin/courses/:id?",
    element: <ProtectedRoute requiredRole="admin"><CourseForm /></ProtectedRoute>,
  },
  {
    path: "/admin/courses/:courseId/modules",
    element: <ProtectedRoute requiredRole="admin"><ModuleManagement /></ProtectedRoute>,
  },
  {
    path: "/admin/courses/:courseId/modules/:moduleId/content",
    element: <ProtectedRoute requiredRole="admin"><ContentManagement /></ProtectedRoute>,
  },
  {
    path: "/admin/courses/:courseId/modules/:moduleId/content/:contentId/quiz",
    element: <ProtectedRoute requiredRole="admin"><QuizManagement /></ProtectedRoute>,
  },
  {
    path: "/companies",
    element: <ProtectedRoute><Companies /></ProtectedRoute>,
  },
  {
    path: "/company/new",
    element: <ProtectedRoute><NewCompany /></ProtectedRoute>,
  },
  {
    path: "/company/:id",
    element: <ProtectedRoute><CompanyProfile /></ProtectedRoute>,
  },
  {
    path: "/company/:id/settings",
    element: <ProtectedRoute><CompanySettings /></ProtectedRoute>,
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <RouterProvider router={router} />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
