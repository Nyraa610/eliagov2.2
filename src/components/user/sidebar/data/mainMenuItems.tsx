
import { LayoutDashboard, BookOpen, FileText, Trophy, UserIcon } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

export const getMainMenuItems = (): MenuItem[] => {
  const { t } = useTranslation();
  const location = useLocation();
  
  return [
    {
      label: t('navigation.dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      active: location.pathname === "/dashboard"
    },
    {
      label: t('navigation.training'),
      icon: <BookOpen className="h-5 w-5" />,
      path: "/training",
      active: location.pathname === "/training"
    },
    {
      label: t('navigation.documents'),
      icon: <FileText className="h-5 w-5" />,
      path: "/documents",
      active: location.pathname === "/documents"
    },
    {
      label: t('navigation.deliverables'),
      icon: <FileText className="h-5 w-5" />,
      path: "/deliverables",
      active: location.pathname === "/deliverables"
    },
    {
      label: t('navigation.engagement'),
      icon: <Trophy className="h-5 w-5" />,
      path: "/engagement",
      active: location.pathname === "/engagement"
    },
    {
      label: t('navigation.profile'),
      icon: <UserIcon className="h-5 w-5" />,
      path: "/profile",
      active: location.pathname === "/profile"
    }
  ];
};
