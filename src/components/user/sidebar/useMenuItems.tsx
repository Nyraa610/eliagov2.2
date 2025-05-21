
import React from "react";
import { useEffect, useState } from "react";
import { 
  BarChartBig, 
  Building2, 
  FileText, 
  ClipboardList, 
  User, 
  Users, 
  BarChart3, 
  Settings, 
  Database, 
  Book, 
  ShieldCheck, 
  Building, 
  Receipt,
  Store,
  Warehouse
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

export type MenuItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  children?: MenuItem[];
};

export const useMenuItems = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConsultant, setIsConsultant] = useState(false);
  
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsAdmin(false);
        setIsConsultant(false);
        return;
      }
      
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setIsAdmin(profile?.role === 'admin');
        setIsConsultant(profile?.role === 'consultant');
      } catch (error) {
        console.error('Error fetching user role:', error);
      }
    };
    
    checkUserRole();
  }, [user]);

  // Main navigation items
  const mainMenuItems: MenuItem[] = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: <BarChartBig className="h-5 w-5" />,
    },
    {
      title: "Assessment",
      path: "/assessment",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Marketplace",
      path: "/marketplace",
      icon: <Store className="h-5 w-5" />,
      children: [
        {
          title: "Browse Partners",
          path: "/marketplace",
          icon: <Store className="h-4 w-4" />,
        },
        {
          title: "Become a Partner",
          path: "/marketplace/apply",
          icon: <Warehouse className="h-4 w-4" />,
        }
      ]
    },
    {
      title: "Deliverables",
      path: "/deliverables",
      icon: <FileText className="h-5 w-5" />,
    },
  ];

  // Company Hub items
  const companyHubItems: MenuItem[] = [
    {
      title: "My Company",
      path: "/company",
      icon: <Building2 className="h-5 w-5" />,
    },
    {
      title: "Companies",
      path: "/companies",
      icon: <Building className="h-5 w-5" />,
    },
  ];

  // Admin items
  const adminItems: MenuItem[] = [
    {
      title: "Admin Panel",
      path: "/admin",
      icon: <ShieldCheck className="h-5 w-5" />,
    },
    {
      title: "User Management",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Marketplace",
      path: "/admin/marketplace/partners",
      icon: <Store className="h-5 w-5" />,
      children: [
        {
          title: "Partners",
          path: "/admin/marketplace/partners",
          icon: <Warehouse className="h-4 w-4" />,
        },
        {
          title: "Applications",
          path: "/admin/marketplace/applications",
          icon: <ClipboardList className="h-4 w-4" />,
        },
        {
          title: "Leads & Commission",
          path: "/admin/marketplace/leads",
          icon: <Receipt className="h-4 w-4" />,
        }
      ]
    },
    {
      title: "Emission Factors",
      path: "/admin/emission-factors",
      icon: <Database className="h-5 w-5" />,
    },
    {
      title: "Documentation",
      path: "/admin/documentation",
      icon: <Book className="h-5 w-5" />,
    },
  ];

  // Consultant items
  const consultantItems: MenuItem[] = [
    {
      title: "Client Dashboard",
      path: "/consultant",
      icon: <BarChart3 className="h-5 w-5" />,
    },
    {
      title: "Client Management",
      path: "/consultant/clients",
      icon: <Users className="h-5 w-5" />,
    },
    {
      title: "Settings",
      path: "/consultant/settings",
      icon: <Settings className="h-5 w-5" />,
    },
  ];

  return {
    mainMenuItems,
    companyHubItems,
    adminItems,
    consultantItems,
    isAdmin,
    isConsultant,
  };
};
