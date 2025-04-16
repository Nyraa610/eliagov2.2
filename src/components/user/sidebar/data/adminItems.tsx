
import { Settings } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getAdminItems = (): MenuItem[] => {
  return [
    {
      id: "adminPanel",
      title: "Admin Panel",
      href: "/admin/panel",
      icon: Settings,
      hasSubmenu: false,
      label: "Admin Panel",
      path: "/admin/panel"
    }
  ];
};
