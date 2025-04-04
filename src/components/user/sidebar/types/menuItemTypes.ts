
import { ReactNode } from "react";

export interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: ReactNode;
  hasSubmenu: boolean;
  submenuItems?: MenuItem[];
}

export interface MenuItemsResult {
  mainMenuItems: MenuItem[];
  companyHubItems: MenuItem[];
  adminItems: MenuItem[];
  consultantItems: MenuItem[];
  isAdmin: boolean;
  isConsultant: boolean;
}
