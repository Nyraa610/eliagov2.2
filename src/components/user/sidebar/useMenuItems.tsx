
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
  icon: React.ElementType;
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
  const mainMenuItems = [
    {
      title: "Dashboard",
      path: "/dashboard",
      icon: BarChartBig,
    },
    {
      title: "Assessment",
      path: "/assessment",
      icon: ClipboardList,
    },
    {
      title: "Marketplace",
      path: "/marketplace",
      icon: Store,
      children: [
        {
          title: "Browse Partners",
          path: "/marketplace",
          icon: Store,
        },
        {
          title: "Become a Partner",
          path: "/marketplace/apply",
          icon: Warehouse,
        }
      ]
    },
    {
      title: "Deliverables",
      path: "/deliverables",
      icon: FileText,
    },
  ];

  // Company Hub items
  const companyHubItems = [
    {
      title: "My Company",
      path: "/company",
      icon: Building2,
    },
    {
      title: "Companies",
      path: "/companies",
      icon: Building,
    },
  ];

  // Admin items
  const adminItems = [
    {
      title: "Admin Panel",
      path: "/admin",
      icon: ShieldCheck,
    },
    {
      title: "User Management",
      path: "/admin/users",
      icon: Users,
    },
    {
      title: "Marketplace",
      path: "/admin/marketplace/partners",
      icon: Store,
      children: [
        {
          title: "Partners",
          path: "/admin/marketplace/partners",
          icon: Warehouse,
        },
        {
          title: "Applications",
          path: "/admin/marketplace/applications",
          icon: ClipboardList,
        },
        {
          title: "Leads & Commission",
          path: "/admin/marketplace/leads",
          icon: Receipt,
        }
      ]
    },
    {
      title: "Emission Factors",
      path: "/admin/emission-factors",
      icon: Database,
    },
    {
      title: "Documentation",
      path: "/admin/documentation",
      icon: Book,
    },
  ];

  // Consultant items
  const consultantItems = [
    {
      title: "Client Dashboard",
      path: "/consultant",
      icon: BarChart3,
    },
    {
      title: "Client Management",
      path: "/consultant/clients",
      icon: Users,
    },
    {
      title: "Settings",
      path: "/consultant/settings",
      icon: Settings,
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
