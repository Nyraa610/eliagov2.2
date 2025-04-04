
import { Settings, Users } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getAdminItems = (): MenuItem[] => {
  return [
    {
      id: "adminPanel",
      label: "Admin Panel",
      path: "/admin/panel",
      icon: <Settings className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "userManagement",
      label: "User Management",
      path: "/admin/users",
      icon: <Users className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
};
