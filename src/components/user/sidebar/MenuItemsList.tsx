
import { useLocation } from "react-router-dom";
import { MenuItem } from "./MenuItem";

type MenuItemsListProps = {
  menuItems: {
    title: string;
    icon: React.ElementType;
    path: string;
    submenu?: {
      title: string;
      icon: React.ElementType;
      path: string;
    }[];
    disabled?: boolean;
  }[];
  collapsed: boolean;
  expandedSubmenu: string | null;
  toggleSubmenu: (menuId: string) => void;
  sectionTitle?: string;
};

export const MenuItemsList = ({ 
  menuItems, 
  collapsed, 
  expandedSubmenu, 
  toggleSubmenu,
  sectionTitle
}: MenuItemsListProps) => {
  const location = useLocation();
  
  return (
    <>
      {sectionTitle && !collapsed && (
        <div className="mt-6 mb-2 px-3">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {sectionTitle}
          </h3>
        </div>
      )}
      <ul className="space-y-1 px-2">
        {menuItems.map((item) => (
          <MenuItem
            key={item.path}
            item={item}
            isActive={location.pathname === item.path}
            collapsed={collapsed}
            expandedSubmenu={expandedSubmenu}
            toggleSubmenu={toggleSubmenu}
          />
        ))}
      </ul>
    </>
  );
};
