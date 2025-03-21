
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type MenuItemProps = {
  item: {
    title: string;
    icon: React.ReactNode;
    path: string;
    submenu?: {
      title: string;
      icon: React.ReactNode;
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
  
  if (hasSubmenu && !collapsed) {
    return (
      <li className="flex flex-col">
        <div className="flex flex-col">
          <div className="flex items-center">
            <Link 
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm transition-colors flex-1",
                isActive
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              {item.icon}
              <span className="ml-3">{item.title}</span>
            </Link>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 p-0 ml-1"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                toggleSubmenu(item.path);
              }}
            >
              {expandedSubmenu === item.path ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {expandedSubmenu === item.path && (
            <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-2">
              {item.submenu?.map((subItem) => (
                <li key={subItem.path}>
                  <Link 
                    to={subItem.path}
                    className={cn(
                      "flex items-center px-3 py-1.5 rounded-md text-sm transition-colors",
                      location.pathname === subItem.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    {subItem.icon}
                    <span className="ml-3">{subItem.title}</span>
                  </Link>
                </li>
              ))}
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
          {item.icon}
          {!collapsed && <span className="ml-3">{item.title}</span>}
        </div>
      </Link>
    </li>
  );
};
