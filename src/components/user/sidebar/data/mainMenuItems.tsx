import {
  LayoutDashboard,
  FileText,
  Folder,
  GraduationCap,
  Users,
  BarChart4,
  Award,
  FileCheck,
  LucideIcon,
  Sparkles,
  MessageSquare,
  CheckSquare,
  Target,
  List,
  FileCheck2
} from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

/**
 * Main menu items configuration
 * Each item defines a section in the main navigation sidebar
 */
const mainMenuItems: MenuItem[] = [
  // Dashboard - Main entry point
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiresCompany: false,
  },
  
  // Assessments section with multiple sub-items
  {
    title: "Assessments",
    href: "/assessment",
    icon: CheckSquare,
    requiresCompany: true,
    children: [
      {
        title: "ESG Diagnostic",
        href: "/assessment/esg-diagnostic",
        icon: FileText,
        requiresCompany: true,
      },
      {
        title: "Value Chain",
        href: "/assessment/value-chain",
        icon: List,
        requiresCompany: true,
      },
      {
        title: "Materiality Analysis",
        href: "/assessment/materiality-analysis",
        icon: CheckSquare,
        requiresCompany: true,
      },
      {
        title: "IRO Analysis",
        href: "/assessment/iro",
        icon: Target,
        requiresCompany: true,
      },
      {
        title: "Stakeholder Mapping",
        href: "/assessment/stakeholder-mapping",
        icon: Users,
        requiresCompany: true,
      },
      {
        title: "Carbon Evaluation",
        href: "/assessment/carbon-evaluation",
        icon: FileText,
        requiresCompany: true,
      },
      {
        title: "Assessment Results",
        href: "/assessment/action-plan-results",
        icon: FileText,
        requiresCompany: true,
      },
    ],
  },
  
  // ESG Strategy section
  {
    title: "ESG Strategy",
    href: "/esg-strategy",
    icon: Sparkles,
    requiresCompany: true,
  },
  
  // Action Plan section
  {
    title: "Action Plan",
    href: "/assessment/action-plan",
    icon: FileCheck2,
    requiresCompany: true,
  },
  
  // Talk with Experts - Highlighted feature
  {
    title: "Talk with Experts",
    href: "/expert/talk",
    icon: MessageSquare,
    requiresCompany: false,
    highlight: true,
  },
  
  // Training resources
  {
    title: "Training",
    href: "/training",
    icon: GraduationCap,
    requiresCompany: false,
  },
  
  // Documents repository
  {
    title: "Documents",
    href: "/documents",
    icon: Folder,
    requiresCompany: true,
  },
  
  // Deliverables section
  {
    title: "Deliverables",
    href: "/deliverables",
    icon: FileText,
    requiresCompany: true,
  },
  
  // Engagement tracking
  {
    title: "Engagement",
    href: "/engagement",
    icon: Award,
    requiresCompany: false,
  }
];

/**
 * Returns the main menu items configuration
 * @returns {MenuItem[]} Array of menu items
 */
export const getMainMenuItems = () => {
  return mainMenuItems;
};

export default mainMenuItems;
