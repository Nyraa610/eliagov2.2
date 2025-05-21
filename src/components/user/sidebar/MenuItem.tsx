
import { ChevronDown, ChevronRight } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type MenuItemProps = {
  item: {
    title: string;
    icon: React.ElementType; // Using ElementType for components
    path: string;
    submenu?: {
      title: string;
      icon: React.ElementType; // Using ElementType for components
      path: string;
    }[];
    disabled?: boolean;
  };
  isActive: boolean;
  collapsed: boolean;
  expandedSubmenu: string | null;
  toggleSubmenu: (menuId: string) => void;
};

export const MenuItem = ({ 
  item, 
  isActive, 
  collapsed, 
  expandedSubmenu, 
  toggleSubmenu 
}: MenuItemProps) => {
  const hasSubmenu = item.submenu && item.submenu.length > 0;
  const location = useLocation();
  const isExpanded = expandedSubmenu === item.path;
  const submenuActive = item.submenu?.some(subItem => 
    location.pathname.startsWith(subItem.path)
  );
  
  // Create an instance of the icon component
  const IconComponent = item.icon;
  
  if (hasSubmenu && !collapsed) {
    return (
      <li className="flex flex-col">
        <div className="flex flex-col">
          <button
            onClick={() => toggleSubmenu(item.path)}
            className={cn(
              "flex items-center px-3 py-2 rounded-md text-sm transition-colors justify-between",
              (isActive || submenuActive || isExpanded)
                ? "text-primary font-medium"
                : "text-gray-600 hover:bg-gray-100"
            )}
          >
            <div className="flex items-center">
              <IconComponent className="h-4 w-4" />
              <span className="ml-3">{item.title}</span>
            </div>
            {isExpanded ? 
              <ChevronDown className="h-4 w-4" /> : 
              <ChevronRight className="h-4 w-4" />
            }
          </button>
          
          {isExpanded && (
            <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-2">
              {item.submenu?.map((subItem) => {
                const SubIconComponent = subItem.icon;
                return (
                  <li key={subItem.path}>
                    <Link 
                      to={subItem.path}
                      className={cn(
                        "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                        location.pathname.startsWith(subItem.path)
                          ? "bg-primary/10 text-primary font-medium"
                          : "text-gray-600 hover:bg-gray-100"
                      )}
                    >
                      <SubIconComponent className="h-4 w-4" />
                      <span className="ml-3">{subItem.title}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </li>
    );
  }
  
  return (
    <li>
      <Link 
        to={item.path}
        className={cn(
          "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary/10 text-primary font-medium"
            : "text-gray-600 hover:bg-gray-100",
          collapsed ? "justify-center" : "justify-between",
          item.disabled ? "opacity-50 pointer-events-none" : ""
        )}
      >
        <div className="flex items-center">
          <IconComponent className="h-4 w-4" />
          {!collapsed && <span className="ml-3">{item.title}</span>}
        </div>
        {hasSubmenu && !collapsed && <ChevronRight className="h-4 w-4" />}
      </Link>
    </li>
  );
};
