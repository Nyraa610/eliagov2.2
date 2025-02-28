
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
import { ProtectedRoute } from "@/components/ProtectedRoute";

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
    path: "/assessment",
    element: <Assessment />,
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
    path: "*",
    element: <NotFound />,
  },
]);

function App() {
  return (
    <RouterProvider router={router} />
  );
}

export default App;
