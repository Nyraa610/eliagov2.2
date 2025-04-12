
import { UserIcon, Building } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getCompanyHubItems = (): MenuItem[] => {
  return [
    {
      id: "user-profile",
      label: "User Profile",
      path: "/profile",
      icon: <UserIcon className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "company-profile",
      label: "Company Profile",
      path: "/companies",
      icon: <Building className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
};
