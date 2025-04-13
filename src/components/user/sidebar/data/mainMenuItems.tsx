
import { LayoutDashboard, ClipboardCheck, BookOpen, FileText, Trophy, BarChartHorizontal, FileBarChart, TargetIcon, UserIcon } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";
import { useTranslation } from "react-i18next";

export const getMainMenuItems = (): MenuItem[] => {
  const { t } = useTranslation();
  
  return [
    {
      id: "dashboard",
      label: t('navigation.dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      hasSubmenu: false
    },
    {
      id: "assessments",
      label: "Assessments",
      icon: <ClipboardCheck className="h-5 w-5" />,
      path: "/assessment",
      hasSubmenu: true,
      submenuItems: [
        {
          id: "esg-diagnostic",
          label: "ESG Diagnostic",
          icon: <ClipboardCheck className="h-4 w-4" />,
          path: "/assessment/esg-diagnostic",
          hasSubmenu: false
        },
        {
          id: "value-chain",
          label: "Value Chain",
          icon: <BarChartHorizontal className="h-4 w-4" />,
          path: "/assessment/value-chain",
          hasSubmenu: false
        },
        {
          id: "materiality-analysis",
          label: "Materiality Analysis",
          icon: <ClipboardCheck className="h-4 w-4" />,
          path: "/assessment/materiality-analysis",
          hasSubmenu: false
        },
        {
          id: "iro-analysis",
          label: "IRO Analysis",
          icon: <TargetIcon className="h-4 w-4" />,
          path: "/assessment/iro",
          hasSubmenu: false
        },
        {
          id: "carbon-evaluation",
          label: "Carbon Evaluation",
          icon: <BarChartHorizontal className="h-4 w-4" />,
          path: "/assessment/carbon-evaluation",
          hasSubmenu: false
        },
        {
          id: "action-plan",
          label: "Action Plan",
          icon: <FileText className="h-4 w-4" />,
          path: "/assessment/action-plan",
          hasSubmenu: false
        },
        {
          id: "assessment-results",
          label: "Assessment Results",
          icon: <FileBarChart className="h-4 w-4" />,
          path: "/assessment",
          hasSubmenu: false
        }
      ]
    },
    {
      id: "carbon-evaluation",
      label: "Carbon Evaluation",
      icon: <BarChartHorizontal className="h-5 w-5" />,
      path: "/assessment/carbon-evaluation",
      hasSubmenu: false
    },
    {
      id: "action-plan",
      label: "Action Plan",
      icon: <FileText className="h-5 w-5" />,
      path: "/assessment/action-plan",
      hasSubmenu: false
    },
    {
      id: "training",
      label: t('navigation.training'),
      icon: <BookOpen className="h-5 w-5" />,
      path: "/training",
      hasSubmenu: false
    },
    {
      id: "engagement",
      label: t('navigation.engagement'),
      icon: <Trophy className="h-5 w-5" />,
      path: "/engagement",
      hasSubmenu: false
    },
    {
      id: "document-center",
      label: "Document Center",
      icon: <FileText className="h-5 w-5" />,
      path: "/documents",
      hasSubmenu: false
    },
    {
      id: "deliverables",
      label: t('navigation.deliverables'),
      icon: <FileText className="h-5 w-5" />,
      path: "/deliverables",
      hasSubmenu: false
    }
  ];
};
