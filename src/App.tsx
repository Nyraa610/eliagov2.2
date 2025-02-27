
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Register from "./pages/Register";
import RegisterConfirmation from "./pages/RegisterConfirmation";
import Assessment from "./pages/Assessment";
import Features from "./pages/Features";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import ResetPassword from "./pages/ResetPassword";
import Training from "./pages/Training";

// Admin Routes
import AdminTraining from "./pages/admin/Training";
import CourseForm from "./pages/admin/CourseForm";
import ModuleManagement from "./pages/admin/ModuleManagement";
import ContentManagement from "./pages/admin/ContentManagement";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register/confirmation" element={<RegisterConfirmation />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/features" element={<Features />} />
          
          {/* Training Routes */}
          <Route path="/training" element={<Training />} />
          
          {/* Admin Routes */}
          <Route path="/admin/training" element={<AdminTraining />} />
          <Route path="/admin/courses/:id" element={<CourseForm />} />
          <Route path="/admin/courses/:courseId/modules" element={<ModuleManagement />} />
          <Route path="/admin/courses/:courseId/modules/:moduleId/content" element={<ContentManagement />} />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
