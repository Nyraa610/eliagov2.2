
import { Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Features from "./pages/Features";
import Pricing from "./pages/Pricing";
import Assessment from "./pages/Assessment";
import Profile from "./pages/Profile";
import Training from "./pages/Training";
import CourseView from "./pages/CourseView";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Deliverables from "./pages/Deliverables";
import RegisterValidation from "./pages/RegisterValidation";
import RegisterConfirmation from "./pages/RegisterConfirmation";
import ResetPassword from "./pages/ResetPassword";
import DocumentCenter from "./pages/DocumentCenter";
import NewCompany from "./pages/company/NewCompany";
import Companies from "./pages/company/Companies";
import CompanyProfile from "./pages/company/CompanyProfile";
import AdminPanel from "./pages/admin/AdminPanel";
import ESGDiagnosticResults from "./pages/assessment/ESGDiagnosticResults";
import CarbonEvaluation from "./pages/assessment/CarbonEvaluation";
import CarbonEvaluationResults from "./pages/assessment/CarbonEvaluationResults";
import MaterialityAnalysis from "./pages/assessment/MaterialityAnalysis";
import ActionPlan from "./pages/assessment/ActionPlan";
import ActionPlanResults from "./pages/assessment/ActionPlanResults";
import IRO from "./pages/assessment/IRO";
import StakeholderMapping from "./pages/assessment/StakeholderMapping";
import ValueChainModeling from "./pages/assessment/ValueChainModeling";
import ValueChainResults from "./pages/assessment/ValueChainResults";
import CompanySettings from "./pages/company/CompanySettings";
import DocumentEditor from "./pages/assessment/DocumentEditor";
import Engagement from "./pages/Engagement";
import { UserLayout } from "./components/user/UserLayout";
import { AdminLayout } from "./components/admin/AdminLayout";

// Admin pages
import UserManagement from "./pages/admin/UserManagement";
import ContentManagement from "./pages/admin/ContentManagement";
import CourseForm from "./pages/admin/CourseForm";
import ModuleManagement from "./pages/admin/ModuleManagement";
import QuizManagement from "./pages/admin/QuizManagement";
import EmissionFactors from "./pages/admin/EmissionFactors";
import MigrationTools from "./pages/admin/MigrationTools";
import TranslationAdmin from "./pages/admin/TranslationAdmin";
import SubscriptionManager from "./pages/admin/SubscriptionManager";
import AdminTraining from "./pages/admin/Training";

// Consultant pages
import ConsultantDashboard from "./pages/consultant/ConsultantDashboard";
import ConsultantNotifications from "./pages/consultant/ConsultantNotifications";
import TalkWithExperts from "./pages/expert/TalkWithExperts";

// Subscription pages
import Success from "./pages/subscription/Success";

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/register/validate" element={<RegisterValidation />} />
      <Route path="/register/confirm" element={<RegisterConfirmation />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/features" element={<Features />} />
      <Route path="/pricing" element={<Pricing />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="/subscription/success" element={<Success />} />

      {/* Protected routes - User */}
      <Route path="/dashboard" element={<ProtectedRoute><UserLayout><Dashboard /></UserLayout></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment" element={<ProtectedRoute><UserLayout><Assessment /></UserLayout></ProtectedRoute>} />
      
      {/* Assessment routes */}
      <Route path="/assessment/esg-diagnostic-results" element={<ProtectedRoute><UserLayout><ESGDiagnosticResults /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/carbon-evaluation" element={<ProtectedRoute><UserLayout><CarbonEvaluation /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/carbon-evaluation-results" element={<ProtectedRoute><UserLayout><CarbonEvaluationResults /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/materiality-analysis" element={<ProtectedRoute><UserLayout><MaterialityAnalysis /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/action-plan" element={<ProtectedRoute><UserLayout><ActionPlan /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/action-plan-results" element={<ProtectedRoute><UserLayout><ActionPlanResults /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/document-editor/:assessmentType" element={<ProtectedRoute><UserLayout><DocumentEditor /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/iro" element={<ProtectedRoute><UserLayout><IRO /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/stakeholder-mapping" element={<ProtectedRoute><UserLayout><StakeholderMapping /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/value-chain-modeling" element={<ProtectedRoute><UserLayout><ValueChainModeling /></UserLayout></ProtectedRoute>} />
      <Route path="/assessment/value-chain-results" element={<ProtectedRoute><UserLayout><ValueChainResults /></UserLayout></ProtectedRoute>} />
      
      <Route path="/training" element={<ProtectedRoute><UserLayout><Training /></UserLayout></ProtectedRoute>} />
      <Route path="/course/:courseId" element={<ProtectedRoute><UserLayout><CourseView /></UserLayout></ProtectedRoute>} />
      <Route path="/deliverables" element={<ProtectedRoute><UserLayout><Deliverables /></UserLayout></ProtectedRoute>} />
      <Route path="/documents" element={<ProtectedRoute><UserLayout><DocumentCenter /></UserLayout></ProtectedRoute>} />
      <Route path="/company/new" element={<ProtectedRoute><UserLayout><NewCompany /></UserLayout></ProtectedRoute>} />
      <Route path="/companies" element={<ProtectedRoute><UserLayout><Companies /></UserLayout></ProtectedRoute>} />
      <Route path="/company/:companyId" element={<ProtectedRoute><UserLayout><CompanyProfile /></UserLayout></ProtectedRoute>} />
      <Route path="/company/:companyId/settings" element={<ProtectedRoute><UserLayout><CompanySettings /></UserLayout></ProtectedRoute>} />
      <Route path="/engagement" element={<ProtectedRoute><UserLayout><Engagement /></UserLayout></ProtectedRoute>} />
      <Route path="/experts" element={<ProtectedRoute><UserLayout><TalkWithExperts /></UserLayout></ProtectedRoute>} />

      {/* Protected routes - Admin */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminPanel /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/users" element={<ProtectedRoute requireAdmin={true}><AdminLayout><UserManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/content" element={<ProtectedRoute requireAdmin={true}><AdminLayout><ContentManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/course/new" element={<ProtectedRoute requireAdmin={true}><AdminLayout><CourseForm /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/course/:courseId" element={<ProtectedRoute requireAdmin={true}><AdminLayout><CourseForm /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/modules" element={<ProtectedRoute requireAdmin={true}><AdminLayout><ModuleManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/quizzes" element={<ProtectedRoute requireAdmin={true}><AdminLayout><QuizManagement /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/emission-factors" element={<ProtectedRoute requireAdmin={true}><AdminLayout><EmissionFactors /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/migration" element={<ProtectedRoute requireAdmin={true}><AdminLayout><MigrationTools /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/translations" element={<ProtectedRoute requireAdmin={true}><AdminLayout><TranslationAdmin /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/subscriptions" element={<ProtectedRoute requireAdmin={true}><AdminLayout><SubscriptionManager /></AdminLayout></ProtectedRoute>} />
      <Route path="/admin/training" element={<ProtectedRoute requireAdmin={true}><AdminLayout><AdminTraining /></AdminLayout></ProtectedRoute>} />

      {/* Protected routes - Consultant */}
      <Route path="/consultant/dashboard" element={<ProtectedRoute requireConsultant={true}><UserLayout><ConsultantDashboard /></UserLayout></ProtectedRoute>} />
      <Route path="/consultant/notifications" element={<ProtectedRoute requireConsultant={true}><UserLayout><ConsultantNotifications /></UserLayout></ProtectedRoute>} />

      {/* Fallback routes */}
      <Route path="/dashboard/*" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
