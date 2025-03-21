
import { 
  BarChart3, BookOpen, Building, ChevronLeft, ChevronRight, 
  Globe, Home, Layers, LineChart, Medal, Settings, 
  Target, Trophy, User, Share2, TrendingUp
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const UserSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);
  const location = useLocation();
  
  useEffect(() => {
    const fetchUserCompany = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('company_id')
          .eq('id', user.id)
          .single();
          
        if (data && data.company_id) {
          setUserCompanyId(data.company_id);
        }
      }
    };
    
    fetchUserCompany();
  }, []);

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
      submenu: [
        {
          title: "Value Chain Modeling",
          icon: <Share2 className="h-5 w-5" />,
          path: "/assessment/value-chain",
        },
      ],
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
      submenu: [
        {
          title: "Impact, Risks & Opportunities",
          icon: <TrendingUp className="h-5 w-5" />,
          path: "/assessment/iro",
        },
      ],
    },
    {
      title: "Action Plan",
      icon: <Target className="h-5 w-5" />,
      path: "/action-plan",
    },
    {
      title: "Engagement & Rewards",
      icon: <Trophy className="h-5 w-5" />,
      path: "/engagement",
    },
  ];
  
  const companyHubItems = [
    {
      title: "Company Profile",
      icon: <Building className="h-5 w-5" />,
      path: "/companies",
    },
    {
      title: "Company Settings",
      icon: <Settings className="h-5 w-5" />,
      path: userCompanyId ? `/company/${userCompanyId}/settings` : "/companies",
      disabled: !userCompanyId,
    },
    {
      title: "Personal Profile",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
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
                      collapsed ? "justify-center" : "justify-between"
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
                  item.disabled ? "opacity-50 pointer-events-none" : "",
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
