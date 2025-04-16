
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
  MessageSquare
} from "lucide-react";
import { MenuItemType } from "../types/menuItemTypes";

const mainMenuItems: MenuItemType[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    requiresCompany: false,
  },
  {
    title: "Assessment",
    href: "/assessment",
    icon: FileCheck,
    requiresCompany: true,
    children: [
      {
        title: "ESG Diagnostic",
        href: "/assessment/esg-diagnostic",
        icon: BarChart4,
        requiresCompany: true,
      },
      {
        title: "Carbon Evaluation",
        href: "/assessment/carbon-evaluation",
        icon: BarChart4,
        requiresCompany: true,
      },
      {
        title: "IRO Analysis",
        href: "/assessment/iro",
        icon: BarChart4,
        requiresCompany: true,
      },
      {
        title: "Action Plan",
        href: "/assessment/action-plan",
        icon: FileText,
        requiresCompany: true,
      },
      {
        title: "Value Chain",
        href: "/assessment/value-chain",
        icon: FileText,
        requiresCompany: true,
      },
      {
        title: "Materiality Analysis",
        href: "/assessment/materiality-analysis",
        icon: FileText,
        requiresCompany: true,
      },
      {
        title: "Stakeholder Mapping",
        href: "/assessment/stakeholder-mapping",
        icon: Users,
        requiresCompany: true,
      },
    ],
  },
  {
    title: "Talk with Experts",
    href: "/expert/talk",
    icon: MessageSquare,
    requiresCompany: false,
    highlight: true,
  },
  {
    title: "Training",
    href: "/training",
    icon: GraduationCap,
    requiresCompany: false,
  },
  {
    title: "Documents",
    href: "/documents",
    icon: Folder,
    requiresCompany: true,
  },
  {
    title: "Deliverables",
    href: "/deliverables",
    icon: FileText,
    requiresCompany: true,
  },
  {
    title: "Engagement",
    href: "/engagement",
    icon: Award,
    requiresCompany: false,
  }
];

export default mainMenuItems;
