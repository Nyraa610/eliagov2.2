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
import AdminTraining from "@/pages/admin/AdminTraining";
import CourseForm from "@/pages/admin/CourseForm";
import ModuleManagement from "@/pages/admin/ModuleManagement";
import ContentManagement from "@/pages/admin/ContentManagement";
import NotFound from "@/pages/NotFound";
import CourseView from "@/pages/CourseView";

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
    element: <Training />,
  },
  {
    path: "/training/courses/:courseId",
    element: <CourseView />,
  },
  {
    path: "/admin/training",
    element: <AdminTraining />,
  },
  {
    path: "/admin/courses/:id?",
    element: <CourseForm />,
  },
  {
    path: "/admin/courses/:courseId/modules",
    element: <ModuleManagement />,
  },
  {
    path: "/admin/courses/:courseId/modules/:moduleId/content",
    element: <ContentManagement />,
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
