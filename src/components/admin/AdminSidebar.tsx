
import { BookOpen, ChevronLeft, ChevronRight, Home, LayoutDashboard, Settings, Shield, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const AdminSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const location = useLocation();
  
  const toggleSubmenu = (menuId: string) => {
    if (expandedSubmenu === menuId) {
      setExpandedSubmenu(null);
    } else {
      setExpandedSubmenu(menuId);
    }
  };
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/admin/panel",
    },
    {
      title: "Training",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/admin/training",
      submenu: [
        {
          title: "Content Management",
          icon: <LayoutDashboard className="h-5 w-5" />,
          path: "/admin/content",
        },
      ],
    },
    {
      title: "Users",
      icon: <Users className="h-5 w-5" />,
      path: "/admin/users",
    },
    {
      title: "Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/admin/settings",
    },
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div 
      className={cn(
        "h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <Shield className="h-5 w-5 text-primary mr-2" />
            <span className="font-bold text-primary">Admin</span>
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar}
          className="ml-auto"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      
      <div className="py-4 flex-1">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.path} className="flex flex-col">
              <div className="flex flex-col">
                {item.submenu && !collapsed ? (
                  <div 
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm transition-colors cursor-pointer",
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                    onClick={() => toggleSubmenu(item.path)}
                  >
                    <div className="flex items-center flex-1">
                      {item.icon}
                      <span className="ml-3">{item.title}</span>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 p-0"
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
                ) : (
                  <Link 
                    to={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                      location.pathname === item.path
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-gray-600 hover:bg-gray-100",
                      collapsed ? "justify-center" : "justify-start"
                    )}
                  >
                    <div className="flex items-center">
                      {item.icon}
                      {!collapsed && <span className="ml-3">{item.title}</span>}
                    </div>
                  </Link>
                )}
                
                {!collapsed && item.submenu && expandedSubmenu === item.path && (
                  <ul className="ml-6 mt-1 space-y-1 border-l border-gray-200 pl-2">
                    {item.submenu.map((subItem) => (
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
          ))}
        </ul>
      </div>
    </div>
  );
};
