
import { useState } from "react";
import { cn } from "@/lib/utils";
import { SidebarHeader } from "./sidebar/SidebarHeader";
import { MenuItemsList } from "./sidebar/MenuItemsList";
import { useMenuItems, MenuItem } from "./sidebar/useMenuItems";

export const UserSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const { mainMenuItems, companyHubItems, adminItems, consultantItems, isAdmin, isConsultant } = useMenuItems();
  
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

  // Map MenuItems to the format expected by MenuItemsList
  const mapMenuItems = (items: MenuItem[]) => {
    return items.map(item => ({
      title: item.label,
      icon: item.icon,
      path: item.path,
      submenu: item.submenuItems?.map(subItem => ({
        title: subItem.label,
        icon: subItem.icon,
        path: subItem.path
      })),
      disabled: false
    }));
  };

  return (
    <div 
      className={cn(
        "h-[calc(100vh-64px)] bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
      style={{ marginTop: '64px' }} // Added to position sidebar below header
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
