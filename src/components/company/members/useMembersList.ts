
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CompanyMember {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  is_company_admin: boolean;
}

export function useMembersList(companyId: string) {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembers = async () => {
    try {
      setLoading(true);
      
      // Get all profiles associated with this company
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, is_company_admin')
        .eq('company_id', companyId);
        
      if (error) {
        console.error("Error fetching company members:", error);
        throw error;
      }
      
      setMembers(data as CompanyMember[]);
    } catch (error) {
      console.error("Error fetching members:", error);
      toast({
        title: "Error",
        description: "Failed to load company members.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [companyId]);

  return {
    members,
    loading,
    fetchMembers
  };
}
