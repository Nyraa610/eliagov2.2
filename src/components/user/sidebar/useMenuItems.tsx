
import { useNavigate, useLocation } from "react-router-dom";
import { useRoleCheck } from "./hooks/useRoleCheck";
import { getMainMenuItems } from "./data/mainMenuItems";
import { getCompanyHubItems } from "./data/companyHubItems";
import { getAdminItems } from "./data/adminItems";
import { getConsultantItems } from "./data/consultantItems";
import { MenuItem, MenuItemsResult } from "./types/menuItemTypes";

export type { MenuItem };

export function useMenuItems(): MenuItemsResult {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAdmin, isConsultant } = useRoleCheck();
  
  const mainMenuItems = getMainMenuItems();
  const companyHubItems = getCompanyHubItems();
  const adminItems = getAdminItems();
  const consultantItems = getConsultantItems();
  
  return {
    mainMenuItems,
    companyHubItems,
    adminItems,
    consultantItems,
    isAdmin,
    isConsultant
  };
}
