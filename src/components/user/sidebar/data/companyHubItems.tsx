
import { User as UserIcon, Building } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getCompanyHubItems = (): MenuItem[] => {
  return [
    {
      id: "user-profile",
      title: "User Profile",
      href: "/profile",
      icon: UserIcon,
      hasSubmenu: false,
      label: "User Profile",
      path: "/profile"
    },
    {
      id: "company-profile",
      title: "Company Profile",
      href: "/companies",
      icon: Building,
      hasSubmenu: false,
      label: "Company Profile",
      path: "/companies"
    }
  ];
};
