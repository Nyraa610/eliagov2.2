
import { LayoutDashboard, Bell } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getConsultantItems = (): MenuItem[] => {
  return [
    {
      id: "consultantDashboard",
      label: "Consultant Dashboard",
      path: "/consultant/dashboard",
      icon: <LayoutDashboard className="h-4 w-4" />,
      hasSubmenu: false
    },
    {
      id: "notifications",
      label: "Notifications",
      path: "/consultant/notifications",
      icon: <Bell className="h-4 w-4" />,
      hasSubmenu: false
    }
  ];
};
