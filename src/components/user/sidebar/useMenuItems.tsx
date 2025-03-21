
import { 
  BarChart3, BookOpen, Building, Globe, Home, Layers, 
  Medal, Settings, Target, Trophy, User, Share2, TrendingUp
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export const useMenuItems = () => {
  const [userCompanyId, setUserCompanyId] = useState<string | null>(null);
  
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
          title: "Impact, Risks & Opportunities",
          icon: <TrendingUp className="h-5 w-5" />,
          path: "/assessment/iro",
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
  
  return { mainMenuItems, companyHubItems, userCompanyId };
};
