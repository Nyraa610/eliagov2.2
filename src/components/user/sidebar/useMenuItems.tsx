
import { 
  BarChart3, BookOpen, Building, Globe, Home, Layers, 
  Medal, Settings, Target, Trophy, User, Share2, TrendingUp, FileText, ShieldCheck
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useMenuItems = () => {
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('company_id, role')
          .eq('id', user.id)
          .single();
          
        if (data) {
          setUserCompanyId(data.company_id);
          setUserRole(data.role);
        }
      }
    };
    
    fetchUserData();
  }, []);

  const mainMenuItems = [
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
        {
          title: "Materiality Analysis",
          icon: <Layers className="h-5 w-5" />,
          path: "/assessment/materiality-analysis",
        },
      ],
    },
    {
      title: "Carbon Evaluation",
      icon: <Globe className="h-5 w-5" />,
      path: "/carbon-evaluation",
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
    {
      title: "Document Center",
      icon: <FileText className="h-5 w-5" />,
      path: "/documents",
    },
  ];
  
  const companyHubItems = [
    {
      title: "Company Profile",
      icon: <Building className="h-5 w-5" />,
      path: userCompanyId ? `/company/${userCompanyId}` : "/profile",
      disabled: !userCompanyId,
    },
    {
      title: "Personal Profile",
      icon: <User className="h-5 w-5" />,
      path: "/profile",
    },
  ];
  
  const adminItems = [
    {
      title: "Admin Panel",
      icon: <ShieldCheck className="h-5 w-5" />,
      path: "/admin",
      disabled: userRole !== 'admin',
    },
    {
      title: "User Management",
      icon: <User className="h-5 w-5" />,
      path: "/admin/users",
      disabled: userRole !== 'admin',
    },
  ];
  
  return { 
    mainMenuItems, 
    companyHubItems, 
    adminItems,
    userCompanyId,
    isAdmin: userRole === 'admin'
  };
};
