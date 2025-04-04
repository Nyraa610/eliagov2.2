
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { roleService } from "@/services/base/roleService";
import {
  LayoutDashboard,
  FileText,
  BarChart,
  Book,
  Award,
  Settings,
  Building,
  Truck,
  LineChart,
  ClipboardCheck,
  CheckSquare,
  Users,
  Bell,
  Activity,
  Clipboard
} from "lucide-react";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: JSX.Element;
  hasSubmenu: boolean;
  submenuItems?: MenuItem[];
}

export function useMenuItems() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConsultant, setIsConsultant] = useState(false);
  
  useEffect(() => {
    const checkRoles = async () => {
      try {
        const adminCheck = await roleService.hasRole('admin');
        setIsAdmin(adminCheck);
        
        const consultantCheck = await roleService.hasRole('consultant');
        setIsConsultant(consultantCheck);
      } catch (error) {
        console.error("Error checking user roles:", error);
      }
    };
    
    checkRoles();
  }, []);
  
  const mainMenuItems: MenuItem[] = [
    {
      id: "dashboard",
      label: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "assessments",
      label: "Assessments",
      path: "/assessment",
      icon: <ClipboardCheck className="h-4 w-4" />,
      hasSubmenu: true,
      submenuItems: [
        {
          id: "esgDiagnostic",
          label: "ESG Diagnostic",
          path: "/assessment/esg-diagnostic",
          icon: <CheckSquare className="h-4 w-4" />,
          hasSubmenu: false
        },
        {
          id: "valueChain",
          label: "Value Chain",
          path: "/assessment/value-chain",
          icon: <Truck className="h-4 w-4" />,
          hasSubmenu: false
        },
        {
          id: "materialityAnalysis",
          label: "Materiality Analysis",
          path: "/assessment/materiality-analysis",
          icon: <CheckSquare className="h-4 w-4" />,
          hasSubmenu: false
        },
        {
          id: "results",
          label: "Assessment Results",
          path: "/assessment/esg-diagnostic-results",
          icon: <LineChart className="h-4 w-4" />,
          hasSubmenu: true,
          submenuItems: [
            {
              id: "esgResults",
              label: "ESG Diagnostic",
              path: "/assessment/esg-diagnostic-results",
              icon: <CheckSquare className="h-4 w-4" />,
              hasSubmenu: false
            },
            {
              id: "carbonResults",
              label: "Carbon Evaluation",
              path: "/assessment/carbon-evaluation-results",
              icon: <BarChart className="h-4 w-4" />,
              hasSubmenu: false
            },
            {
              id: "actionPlanResults",
              label: "Action Plan",
              path: "/assessment/action-plan-results",
              icon: <CheckSquare className="h-4 w-4" />,
              hasSubmenu: false
            },
            {
              id: "valueChainResults",
              label: "Value Chain",
              path: "/assessment/value-chain-results",
              icon: <Truck className="h-4 w-4" />,
              hasSubmenu: false
            }
          ]
        }
      ]
    },
    {
      id: "carbonEvaluation",
      label: "Carbon Evaluation",
      path: "/assessment/carbon-evaluation",
      icon: <BarChart className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "actionPlan",
      label: "Action Plan",
      path: "/assessment/action-plan",
      icon: <Clipboard className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "training",
      label: "Training",
      path: "/training",
      icon: <Book className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "engagement",
      label: "Engagement",
      path: "/engagement",
      icon: <Award className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "documents",
      label: "Document Center",
      path: "/documents",
      icon: <FileText className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "deliverables",
      label: "Deliverables",
      path: "/deliverables",
      icon: <FileText className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
  
  const companyHubItems: MenuItem[] = [
    {
      id: "profile",
      label: "User Profile",
      path: "/profile",
      icon: <Settings className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "companies",
      label: "Company Profile",
      path: "/companies",
      icon: <Building className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
  
  const adminItems: MenuItem[] = [
    {
      id: "adminPanel",
      label: "Admin Panel",
      path: "/admin/panel",
      icon: <Settings className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "userManagement",
      label: "User Management",
      path: "/admin/users",
      icon: <Users className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
  
  const consultantItems: MenuItem[] = [
    {
      id: "consultantDashboard",
      label: "Consultant Dashboard",
      path: "/consultant/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "notifications",
      label: "Notifications",
      path: "/consultant/notifications",
      icon: <Bell className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
  
  return {
    mainMenuItems,
    companyHubItems,
    adminItems,
    consultantItems,
    isAdmin,
    isConsultant
  };
}
