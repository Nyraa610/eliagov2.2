
import { BarChart3, BookOpen, Building, ChevronLeft, ChevronRight, Globe, Home, Layers, LineChart, Settings, Target, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";

export const UserSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  const menuItems = [
    {
      title: "Dashboard",
      icon: <Home className="h-5 w-5" />,
      path: "/dashboard",
    },
    {
      title: "Training",
      icon: <BookOpen className="h-5 w-5" />,
      path: "/training",
    },
    {
      title: "Assessment",
      icon: <BarChart3 className="h-5 w-5" />,
      path: "/assessment",
    },
    {
      title: "Carbon Footprint",
      icon: <Globe className="h-5 w-5" />,
      path: "/carbon-footprint",
    },
    {
      title: "Materiality Analysis",
      icon: <Layers className="h-5 w-5" />,
      path: "/materiality-analysis",
    },
    {
      title: "Action Plan",
      icon: <Target className="h-5 w-5" />,
      path: "/action-plan",
    },
  ];
  
  const companyHubItems = [
    {
      title: "Company Profile",
      icon: <Building className="h-5 w-5" />,
      path: "/companies",
    },
    {
      title: "Personal Profile",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
    },
    {
      title: "Company Settings",
      icon: <Settings className="h-5 w-5" />,
      path: "/company-settings",
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
            <img src="/lovable-uploads/bf07f304-1895-4f5e-a378-715282528884.png" alt="Logo" className="h-6 w-6 mr-2" />
            <span className="font-bold text-primary">ELIA GO</span>
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
            <li key={item.path}>
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
                {item.icon}
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
        
        {/* Company Hub Section */}
        {!collapsed && (
          <div className="mt-6 mb-2 px-3">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Company Hub
            </h3>
          </div>
        )}
        <ul className="space-y-1 px-2">
          {companyHubItems.map((item) => (
            <li key={item.path}>
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
                {item.icon}
                {!collapsed && <span className="ml-3">{item.title}</span>}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
