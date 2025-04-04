
import {
  LayoutDashboard,
  BarChart,
  Book,
  Award,
  FileText,
  Truck,
  LineChart,
  ClipboardCheck,
  CheckSquare,
  Clipboard
} from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getMainMenuItems = (): MenuItem[] => {
  return [
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
};
