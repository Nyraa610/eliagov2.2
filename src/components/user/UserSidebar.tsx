
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { MenuItemsList } from "./sidebar/MenuItemsList";
import { useMenuItems } from "./sidebar/useMenuItems";
import { useSidebar } from "@/contexts/SidebarContext";

export const UserSidebar = () => {
  const { collapsed, toggleSidebar } = useSidebar();
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { mainMenuItems, companyHubItems, adminItems, consultantItems, isAdmin, isConsultant } = useMenuItems();
  
  const toggleSubmenu = (menuId: string) => {
    if (expandedSubmenu === menuId) {
      setExpandedSubmenu(null);
    } else {
      setExpandedSubmenu(menuId);
    }
  };

  // Map MenuItems to the format expected by MenuItemsList
  const mapMenuItems = (items: any[]) => {
    return items.map(item => ({
      title: item.title || item.label,
      icon: item.icon,
      path: item.path || item.href,
      submenu: item.children?.map((subItem: any) => ({
        title: subItem.title || subItem.label,
        icon: subItem.icon,
        path: subItem.path || subItem.href
      })),
      disabled: item.disabled || false
    }));
  };

  return (
    <div 
      className={cn(
        "h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
      style={{ 
        marginTop: '64px',
        position: 'fixed',
        left: 0,
        zIndex: 30
      }}
    >
      <SidebarHeader collapsed={collapsed} toggleSidebar={toggleSidebar} />
      
      <div className="py-4 flex-1 overflow-y-auto">
        <MenuItemsList 
          menuItems={mapMenuItems(mainMenuItems)} 
          collapsed={collapsed}
          expandedSubmenu={expandedSubmenu}
          toggleSubmenu={toggleSubmenu}
        />
        
        <MenuItemsList 
          menuItems={mapMenuItems(companyHubItems)} 
          collapsed={collapsed}
          expandedSubmenu={expandedSubmenu}
          toggleSubmenu={toggleSubmenu}
          sectionTitle="Company Hub"
        />

        {isAdmin && (
          <MenuItemsList 
            menuItems={mapMenuItems(adminItems)} 
            collapsed={collapsed}
            expandedSubmenu={expandedSubmenu}
            toggleSubmenu={toggleSubmenu}
            sectionTitle="Administration"
          />
        )}
        
        {isConsultant && (
          <MenuItemsList 
            menuItems={mapMenuItems(consultantItems)} 
            collapsed={collapsed}
            expandedSubmenu={expandedSubmenu}
            toggleSubmenu={toggleSubmenu}
            sectionTitle="Consultant"
          />
        )}
      </div>
    </div>
  );
};
