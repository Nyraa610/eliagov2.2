
import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

export interface MenuItem {
  id?: string;
  title: string;
  href?: string;
  path?: string;
  icon: LucideIcon; // This is already correct as LucideIcon
  requiresCompany?: boolean;
  highlight?: boolean;
  hasSubmenu?: boolean;
  label?: string;
  submenuItems?: MenuItem[];
  children?: MenuItem[];
}

export interface MenuItemsResult {
  mainMenuItems: MenuItem[];
  companyHubItems: MenuItem[];
  adminItems: MenuItem[];
  consultantItems: MenuItem[];
  isAdmin: boolean;
  isConsultant: boolean;
}
