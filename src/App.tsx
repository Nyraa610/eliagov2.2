
import React, { Suspense } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Navigation } from "./components/Navigation";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GlobalAIAssistant } from "./components/ai/GlobalAIAssistant";
import { ClientProvider } from "@/contexts/ClientContext";
import { Toaster } from "sonner";
import { HotjarTracking } from "./components/analytics/HotjarTracking";

// Pages
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
import OnlineReport from "./pages/assessment/OnlineReportViewer";
import Engagement from "./pages/Engagement";
import MarkdownDocumentEditor from "./pages/assessment/MarkdownDocumentEditor";
import { UserLayout } from "./components/user/UserLayout";
import { AdminLayout } from "./components/admin/AdminLayout";
import ESGLaunchpadPage from "./pages/ESGLaunchpad";
import ESGStrategy from "./pages/ESGStrategy";
import Integrations from "./pages/Integrations";
import ActionPlanExportPage from "./pages/ActionPlanExportPage";

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

// Create a Suspense Provider component
function SuspenseProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={<div className="flex justify-center p-8">Loading...</div>}>
      {children}
    </Suspense>
  );
}

// Create a Query Provider component
function QueryProvider({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
      },
    },
  });

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

function App() {
  return (
    <QueryProvider>
      <AuthProvider>
        <LanguageProvider>
          <ClientProvider>
            <Router>
              <HotjarTracking />
              <Navigation />
              <SuspenseProvider>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<Index />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register/validate" element={<RegisterValidation />} />
                  <Route path="/register/confirmation" element={<RegisterConfirmation />} />
                  {/* Routes pour la réinitialisation de mot de passe */}
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/reset/password" element={<ResetPassword />} />
                  <Route path="/features" element={<Features />} />
                  <Route path="/pricing" element={<Pricing />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />
                  <Route path="/subscription/success" element={<Success />} />

                  {/* Protected routes - User */}
                  <Route path="/dashboard" element={<ProtectedRoute><UserLayout><Dashboard /></UserLayout></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><UserLayout><Profile /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment" element={<ProtectedRoute><UserLayout><Assessment /></UserLayout></ProtectedRoute>} />
                  <Route path="/esg-launchpad" element={<ProtectedRoute><UserLayout><ESGLaunchpadPage /></UserLayout></ProtectedRoute>} />
                  <Route path="/esg-strategy" element={<ProtectedRoute><UserLayout><ESGStrategy /></UserLayout></ProtectedRoute>} />
                  
                  {/* Assessment routes */}
                  <Route path="/assessment/esg-diagnostic" element={<ProtectedRoute><UserLayout><Assessment /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/value-chain" element={<ProtectedRoute><UserLayout><ValueChainModeling /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/esg-diagnostic-results" element={<ProtectedRoute><UserLayout><ESGDiagnosticResults /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/carbon-evaluation" element={<ProtectedRoute><UserLayout><CarbonEvaluation /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/carbon-evaluation-results" element={<ProtectedRoute><UserLayout><CarbonEvaluationResults /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/materiality-analysis" element={<ProtectedRoute><UserLayout><MaterialityAnalysis /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/action-plan" element={<ProtectedRoute><UserLayout><ActionPlan /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/action-plan-results" element={<ProtectedRoute><UserLayout><ActionPlanResults /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/document-editor/:assessmentType" element={<ProtectedRoute><UserLayout><DocumentEditor /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/markdown-editor/:assessmentType" element={<ProtectedRoute><UserLayout><MarkdownDocumentEditor /></UserLayout></ProtectedRoute>} />
                  {/* Ensure this specific route exists for direct navigation */}
                  <Route path="/assessment/markdown-editor/action-plan" element={<Navigate replace to="/assessment/markdown-editor/action_plan" />} />
                  <Route path="/assessment/report/:assessmentType" element={<ProtectedRoute><UserLayout><OnlineReport /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/iro" element={<ProtectedRoute><UserLayout><IRO /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/stakeholder-mapping" element={<ProtectedRoute><UserLayout><StakeholderMapping /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/value-chain-modeling" element={<ProtectedRoute><UserLayout><ValueChainModeling /></UserLayout></ProtectedRoute>} />
                  <Route path="/assessment/value-chain-results" element={<ProtectedRoute><UserLayout><ValueChainResults /></UserLayout></ProtectedRoute>} />
                  
                  {/* Deliverables and Integrations routes */}
                  <Route path="/integrations/:integrationTab" element={<ProtectedRoute><UserLayout><Integrations /></UserLayout></ProtectedRoute>} />
                  <Route path="/integrations" element={<Navigate to="/integrations/notion" replace />} />
                  <Route path="/action-plan-export" element={<ProtectedRoute><UserLayout><ActionPlanExportPage /></UserLayout></ProtectedRoute>} />
                  
                  <Route path="/training" element={<ProtectedRoute><UserLayout><Training /></UserLayout></ProtectedRoute>} />
                  <Route path="/course/:courseId" element={<ProtectedRoute><UserLayout><CourseView /></UserLayout></ProtectedRoute>} />
                  <Route path="/documents" element={<ProtectedRoute><UserLayout><DocumentCenter /></UserLayout></ProtectedRoute>} />
                  <Route path="/company/new" element={<ProtectedRoute><UserLayout><NewCompany /></UserLayout></ProtectedRoute>} />
                  <Route path="/companies" element={<ProtectedRoute><UserLayout><Companies /></UserLayout></ProtectedRoute>} />
                  <Route path="/company/:companyId" element={<ProtectedRoute><UserLayout><CompanyProfile /></UserLayout></ProtectedRoute>} />
                  <Route path="/company/:companyId/settings" element={<ProtectedRoute><UserLayout><CompanySettings /></UserLayout></ProtectedRoute>} />
                  <Route path="/engagement" element={<ProtectedRoute><UserLayout><Engagement /></UserLayout></ProtectedRoute>} />
                  <Route path="/experts" element={<ProtectedRoute><UserLayout><TalkWithExperts /></UserLayout></ProtectedRoute>} />

                  {/* Protected routes - Admin */}
                  {/* Fixed admin panel route with explicit admin role check */}
                  <Route path="/admin/panel" element={<ProtectedRoute requireAdmin={true}><AdminPanel /></ProtectedRoute>} />
                  <Route path="/admin" element={<Navigate to="/admin/panel" replace />} />
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
              </SuspenseProvider>
              <GlobalAIAssistant />
              <Toaster />
            </Router>
          </ClientProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryProvider>
  );
}

export default App;
