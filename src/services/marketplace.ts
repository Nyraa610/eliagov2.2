
import { supabase } from "@/lib/supabase";

export interface MarketplacePartner {
  id: string;
  name: string;
  description: string;
  logo_url: string | null;
  website_url: string | null;
  contact_email: string;
  locations: string[];
  company_sizes: string[];
  budget_ranges: string[];
  categories: string[];
  services: string[];
  status: 'pending' | 'approved' | 'rejected';
  commission_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface PartnerApplication {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  company_website: string | null;
  company_description: string | null;
  services_offered: string | null;
  locations: string[];
  company_sizes: string[];
  budget_ranges: string[];
  categories: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface MarketplaceRecommendation {
  id: string;
  user_id: string;
  company_id: string | null;
  partner_id: string;
  partner?: MarketplacePartner;
  action_plan_type: string | null;
  created_at: string;
  contacted_at: string | null;
  status: 'recommended' | 'contacted' | 'engaged';
  match_score: number;
}

export interface MarketplaceLead {
  id: string;
  recommendation_id: string | null;
  user_id: string;
  partner_id: string;
  company_id: string | null;
  message: string | null;
  created_at: string;
  status: 'new' | 'contacted' | 'converted' | 'closed';
  commission_amount: number | null;
  commission_paid: boolean;
  commission_paid_at: string | null;
}

export type ApplicationSubmitData = Omit<PartnerApplication, 'id' | 'status' | 'created_at' | 'updated_at'>;

class MarketplaceService {
  async getApprovedPartners() {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .eq('status', 'approved');
    
    if (error) throw error;
    return data as MarketplacePartner[];
  }

  async getPartnerById(id: string) {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as MarketplacePartner;
  }

  async getRecommendationsForUser(userId: string) {
    const { data, error } = await supabase
      .from('marketplace_recommendations')
      .select(`
        *,
        partner:partner_id(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as MarketplaceRecommendation[];
  }

  async submitApplication(application: ApplicationSubmitData) {
    const { data, error } = await supabase
      .from('partner_applications')
      .insert([application])
      .select()
      .single();
    
    if (error) throw error;
    return data as PartnerApplication;
  }

  async createLead(lead: {
    user_id: string;
    partner_id: string;
    company_id?: string;
    recommendation_id?: string;
    message?: string;
  }) {
    const { data, error } = await supabase
      .from('marketplace_leads')
      .insert([lead])
      .select()
      .single();
    
    if (error) throw error;
    return data as MarketplaceLead;
  }

  async getUserLeads(userId: string) {
    const { data, error } = await supabase
      .from('marketplace_leads')
      .select(`
        *,
        partner:partner_id(*)
      `)
      .eq('user_id', userId);
    
    if (error) throw error;
    return data;
  }

  // Admin methods
  async getAllPartners() {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data as MarketplacePartner[];
  }

  async createPartner(partner: Omit<MarketplacePartner, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .insert([partner])
      .select()
      .single();
    
    if (error) throw error;
    return data as MarketplacePartner;
  }

  async updatePartner(id: string, updates: Partial<MarketplacePartner>) {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as MarketplacePartner;
  }

  async getAllApplications() {
    const { data, error } = await supabase
      .from('partner_applications')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as PartnerApplication[];
  }

  async updateApplicationStatus(id: string, status: 'pending' | 'approved' | 'rejected') {
    const { data, error } = await supabase
      .from('partner_applications')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as PartnerApplication;
  }

  async getAllLeads() {
    const { data, error } = await supabase
      .from('marketplace_leads')
      .select(`
        *,
        partner:partner_id(*),
        user:user_id(email, full_name),
        company:company_id(name)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async updateLeadStatus(id: string, updates: {
    status?: 'new' | 'contacted' | 'converted' | 'closed';
    commission_amount?: number;
    commission_paid?: boolean;
    commission_paid_at?: string | null;
  }) {
    const { data, error } = await supabase
      .from('marketplace_leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async generateRecommendations(userId: string, companyId: string | null, actionPlanData: any) {
    // This would be a more complex algorithm in production to match users with partners
    // For now, we'll just recommend all approved partners with a basic scoring mechanism
    
    try {
      const partners = await this.getApprovedPartners();
      
      // Create recommendations
      const recommendations = partners.map(partner => ({
        user_id: userId,
        company_id: companyId,
        partner_id: partner.id,
        action_plan_type: actionPlanData?.type || 'general',
        status: 'recommended',
        match_score: Math.floor(Math.random() * 100) // Simplified scoring
      }));
      
      if (recommendations.length > 0) {
        const { data, error } = await supabase
          .from('marketplace_recommendations')
          .insert(recommendations)
          .select();
        
        if (error) throw error;
        return data;
      }
      return [];
    } catch (error) {
      console.error("Error generating recommendations:", error);
      throw error;
    }
  }
}

export const marketplaceService = new MarketplaceService();
