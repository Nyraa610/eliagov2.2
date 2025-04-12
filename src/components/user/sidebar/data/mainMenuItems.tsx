
import { LayoutDashboard, BookOpen, FileText, Trophy, UserIcon } from "lucide-react";
import { MenuItem } from "../types/menuItemTypes";
import { useTranslation } from "react-i18next";

export const getMainMenuItems = (): MenuItem[] => {
  const { t } = useTranslation();
  
  return [
    {
      id: "dashboard",
      label: t('navigation.dashboard'),
      icon: <LayoutDashboard className="h-5 w-5" />,
      path: "/dashboard",
      hasSubmenu: false
    },
    {
      id: "training",
      label: t('navigation.training'),
      icon: <BookOpen className="h-5 w-5" />,
      path: "/training",
      hasSubmenu: false
    },
    {
      id: "documents",
      label: t('navigation.documents'),
      icon: <FileText className="h-5 w-5" />,
      path: "/documents",
      hasSubmenu: false
    },
    {
      id: "deliverables",
      label: t('navigation.deliverables'),
      icon: <FileText className="h-5 w-5" />,
      path: "/deliverables",
      hasSubmenu: false
    },
    {
      id: "engagement",
      label: t('navigation.engagement'),
      icon: <Trophy className="h-5 w-5" />,
      path: "/engagement",
      hasSubmenu: false
    },
    {
      id: "profile",
      label: t('navigation.profile'),
      icon: <UserIcon className="h-5 w-5" />,
      path: "/profile",
      hasSubmenu: false
    }
  ];
};
