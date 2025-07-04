
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface CompanyMember {
  id: string;
  full_name?: string;
  email: string;
  avatar_url?: string;
  is_company_admin: boolean;
  role?: string;
}

interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  status: string;
}

export function useMembersList(companyId: string) {
  const [members, setMembers] = useState<CompanyMember[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMembers = async () => {
    if (!companyId) {
      console.log("No company ID provided, skipping member fetch");
      setLoading(false);
      return;
    }
    
    console.log("Fetching members for company:", companyId);
    setLoading(true);
    setError(null);
    
    try {
      // Get all profiles associated with this company
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name, avatar_url, is_company_admin, role')
        .eq('company_id', companyId)
        .order('is_company_admin', { ascending: false }) // List admins first
        .order('full_name', { ascending: true });
        
      if (error) {
        console.error("Error fetching company members:", error);
        setError(error.message);
        throw error;
      }
      
      console.log(`Found ${data?.length || 0} members for company ${companyId}`);
      setMembers(data as CompanyMember[]);
      
      // Get pending invitations for this company
      const { data: invitations, error: invitationsError } = await supabase
        .from('invitations')
        .select('id, email, role, created_at, status')
        .eq('company_id', companyId)
        .eq('status', 'pending');
        
      if (invitationsError) {
        console.error("Error fetching invitations:", invitationsError);
        // Continue without invitations data
        setError(prev => prev || invitationsError.message);
      } else {
        console.log(`Found ${invitations?.length || 0} pending invitations for company ${companyId}`);
        setPendingInvitations(invitations as PendingInvitation[]);
      }
      
    } catch (error: any) {
      console.error("Error in fetchMembers:", error);
      setError(error.message || "Failed to load company members");
      
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
    if (companyId) {
      fetchMembers();
    }
  }, [companyId]);

  return {
    members,
    pendingInvitations,
    loading,
    error,
    fetchMembers
  };
}
