
import { Settings, Building } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getCompanyHubItems = (): MenuItem[] => {
  return [
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
};
