import { supabase } from "@/lib/supabase";

export interface MarketplacePartner {
  id: string;
  name: string;
  description?: string;
  logo_url?: string;
  website_url?: string;
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
  contact_phone?: string;
  company_website?: string;
  company_description?: string;
  services_offered?: string;
  locations: string[];
  company_sizes: string[];
  budget_ranges: string[];
  categories: string[];
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface ApplicationSubmitData {
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_website?: string;
  company_description?: string;
  services_offered?: string;
  locations: string[];
  company_sizes: string[];
  budget_ranges: string[];
  categories: string[];
}

export interface MarketplaceRecommendation {
  id: string;
  user_id: string;
  company_id?: string;
  partner_id: string;
  partner?: MarketplacePartner;
  action_plan_type?: string;
  created_at: string;
  contacted_at?: string;
  status: 'recommended' | 'contacted' | 'converted';
  match_score: number;
}

export interface MarketplaceLead {
  id: string;
  recommendation_id?: string;
  user_id: string;
  user?: { email: string };
  partner_id: string;
  partner?: MarketplacePartner;
  company_id?: string;
  company?: { id: string; name: string };
  message?: string;
  created_at: string;
  status: 'new' | 'contacted' | 'converted' | 'lost';
  commission_amount?: number;
  commission_paid: boolean;
  commission_paid_at?: string;
}

export const marketplaceService = {
  // Partner functions
  async getApprovedPartners(): Promise<MarketplacePartner[]> {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .eq('status', 'approved');

    if (error) {
      console.error('Error fetching approved partners:', error);
      throw error;
    }

    return data || [];
  },

  async getAllPartners(): Promise<MarketplacePartner[]> {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching all partners:', error);
      throw error;
    }

    return data || [];
  },

  async getPartnerById(id: string): Promise<MarketplacePartner> {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching partner with id ${id}:`, error);
      throw error;
    }

    return data;
  },

  async updatePartner(partner: MarketplacePartner): Promise<MarketplacePartner> {
    const { data, error } = await supabase
      .from('marketplace_partners')
      .update({
        name: partner.name,
        description: partner.description,
        logo_url: partner.logo_url,
        website_url: partner.website_url,
        contact_email: partner.contact_email,
        locations: partner.locations,
        company_sizes: partner.company_sizes,
        budget_ranges: partner.budget_ranges,
        categories: partner.categories,
        services: partner.services,
        commission_percentage: partner.commission_percentage,
        updated_at: new Date().toISOString(),
      })
      .eq('id', partner.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating partner:', error);
      throw error;
    }

    return data;
  },

  async updatePartnerStatus(partnerId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> {
    const { error } = await supabase
      .from('marketplace_partners')
      .update({
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', partnerId);

    if (error) {
      console.error(`Error updating status for partner ${partnerId}:`, error);
      throw error;
    }
  },

  async deletePartner(partnerId: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_partners')
      .delete()
      .eq('id', partnerId);

    if (error) {
      console.error(`Error deleting partner ${partnerId}:`, error);
      throw error;
    }
  },

  // Partner application functions
  async submitPartnerApplication(application: ApplicationSubmitData): Promise<PartnerApplication> {
    const { data, error } = await supabase
      .from('partner_applications')
      .insert({
        ...application,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting partner application:', error);
      throw error;
    }

    return data;
  },

  async getPartnerApplications(): Promise<PartnerApplication[]> {
    const { data, error } = await supabase
      .from('partner_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching partner applications:', error);
      throw error;
    }

    return data || [];
  },

  async approveApplication(applicationId: string): Promise<void> {
    // 1. Get the application details
    const { data: application, error: fetchError } = await supabase
      .from('partner_applications')
      .select('*')
      .eq('id', applicationId)
      .single();

    if (fetchError) {
      console.error(`Error fetching application ${applicationId}:`, fetchError);
      throw fetchError;
    }

    // 2. Create a new partner from the application
    const { error: insertError } = await supabase
      .from('marketplace_partners')
      .insert({
        name: application.company_name,
        description: application.company_description,
        website_url: application.company_website,
        contact_email: application.contact_email,
        locations: application.locations,
        company_sizes: application.company_sizes,
        budget_ranges: application.budget_ranges,
        categories: application.categories,
        services: application.services_offered ? application.services_offered.split('\n').map(s => s.trim()).filter(s => s) : [],
        status: 'approved',
        commission_percentage: 10, // Default commission percentage
      });

    if (insertError) {
      console.error('Error creating partner from application:', insertError);
      throw insertError;
    }

    // 3. Update the application status
    const { error: updateError } = await supabase
      .from('partner_applications')
      .update({
        status: 'approved',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (updateError) {
      console.error(`Error updating application status ${applicationId}:`, updateError);
      throw updateError;
    }
  },

  async rejectApplication(applicationId: string): Promise<void> {
    const { error } = await supabase
      .from('partner_applications')
      .update({
        status: 'rejected',
        updated_at: new Date().toISOString(),
      })
      .eq('id', applicationId);

    if (error) {
      console.error(`Error rejecting application ${applicationId}:`, error);
      throw error;
    }
  },

  // Recommendation functions
  async getRecommendationsForUser(userId: string): Promise<MarketplaceRecommendation[]> {
    const { data, error } = await supabase
      .from('marketplace_recommendations')
      .select(`
        *,
        partner:partner_id(*)
      `)
      .eq('user_id', userId)
      .order('match_score', { ascending: false });

    if (error) {
      console.error(`Error fetching recommendations for user ${userId}:`, error);
      throw error;
    }

    return data || [];
  },

  async generateRecommendations(userId: string, companyId: string | null, actionPlanData: any): Promise<void> {
    // In a real implementation, this would analyze the action plan data
    // and match with appropriate partners based on categories, needs, etc.
    
    // For now, we'll just fetch all approved partners and create basic recommendations
    const { data: partners, error: partnersError } = await supabase
      .from('marketplace_partners')
      .select('*')
      .eq('status', 'approved')
      .limit(3);

    if (partnersError) {
      console.error('Error fetching partners for recommendations:', partnersError);
      throw partnersError;
    }

    if (partners && partners.length > 0) {
      // Create recommendations for top partners
      const recommendations = partners.map((partner, index) => ({
        user_id: userId,
        company_id: companyId,
        partner_id: partner.id,
        action_plan_type: 'general',
        status: 'recommended',
        match_score: 100 - (index * 10), // Simple scoring for demonstration
      }));

      const { error: insertError } = await supabase
        .from('marketplace_recommendations')
        .insert(recommendations);

      if (insertError) {
        console.error('Error creating recommendations:', insertError);
        throw insertError;
      }
    }
  },

  // Lead functions
  async createLead(lead: {
    partner_id: string;
    user_id: string;
    company_id?: string;
    message?: string;
  }): Promise<MarketplaceLead> {
    const { data, error } = await supabase
      .from('marketplace_leads')
      .insert({
        ...lead,
        status: 'new',
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw error;
    }

    return data;
  },

  async getMarketplaceLeads(): Promise<MarketplaceLead[]> {
    const { data, error } = await supabase
      .from('marketplace_leads')
      .select(`
        *,
        partner:partner_id(*),
        user:user_id(email),
        company:company_id(id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace leads:', error);
      throw error;
    }

    return data || [];
  },

  async updateLeadStatus(leadId: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_leads')
      .update({
        status,
      })
      .eq('id', leadId);

    if (error) {
      console.error(`Error updating lead status ${leadId}:`, error);
      throw error;
    }
  },

  async setLeadCommission(leadId: string, amount: number): Promise<void> {
    const { error } = await supabase
      .from('marketplace_leads')
      .update({
        commission_amount: amount,
      })
      .eq('id', leadId);

    if (error) {
      console.error(`Error setting lead commission ${leadId}:`, error);
      throw error;
    }
  },

  async markCommissionPaid(leadId: string): Promise<void> {
    const { error } = await supabase
      .from('marketplace_leads')
      .update({
        commission_paid: true,
        commission_paid_at: new Date().toISOString(),
      })
      .eq('id', leadId);

    if (error) {
      console.error(`Error marking commission as paid ${leadId}:`, error);
      throw error;
    }
  },
};
