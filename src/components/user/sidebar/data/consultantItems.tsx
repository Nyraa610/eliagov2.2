
import { LayoutDashboard, Bell } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";

export const getConsultantItems = (): MenuItem[] => {
  return [
    {
      id: "consultantDashboard",
      title: "Consultant Dashboard",
      href: "/consultant/dashboard",
      icon: LayoutDashboard,
      hasSubmenu: false,
      label: "Consultant Dashboard",
      path: "/consultant/dashboard"
    },
    {
      id: "notifications",
      title: "Notifications",
      href: "/consultant/notifications",
      icon: Bell,
      hasSubmenu: false,
      label: "Notifications",
      path: "/consultant/notifications"
    }
  ];
};
