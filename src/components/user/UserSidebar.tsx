
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { MenuItemsList } from "./sidebar/MenuItemsList";
import { useMenuItems } from "./sidebar/useMenuItems";

export const UserSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { mainMenuItems, companyHubItems, adminItems, isAdmin } = useMenuItems();
  
  const toggleSubmenu = (menuId: string) => {
    if (expandedSubmenu === menuId) {
      setExpandedSubmenu(null);
    } else {
      setExpandedSubmenu(menuId);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <SidebarHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />
      
      <div className="py-4 flex-1 overflow-y-auto">
        <MenuItemsList 
          menuItems={mainMenuItems} 
          collapsed={collapsed}
          expandedSubmenu={expandedSubmenu}
          toggleSubmenu={toggleSubmenu}
        />
        
        <MenuItemsList 
          menuItems={companyHubItems} 
          collapsed={collapsed}
          expandedSubmenu={expandedSubmenu}
          toggleSubmenu={toggleSubmenu}
          sectionTitle="Company Hub"
        />

        {isAdmin && (
          <MenuItemsList 
            menuItems={adminItems} 
            collapsed={collapsed}
            expandedSubmenu={expandedSubmenu}
            toggleSubmenu={toggleSubmenu}
            sectionTitle="Administration"
          />
        )}
      </div>
    </div>
  );
};
