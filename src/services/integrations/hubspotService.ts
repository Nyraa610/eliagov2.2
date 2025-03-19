
import { supabase } from "@/integrations/supabase/client";
import { Company } from "@/services/company/types";
import { HubspotIntegration, HubspotContact, HubspotNote, SustainabilityOpportunity } from "./types";

// Base URL for HubSpot API
const HUBSPOT_API_BASE = "https://api.hubapi.com";

export const hubspotService = {
  // Get the HubSpot integration for a company
  async getIntegration(companyId: string): Promise<HubspotIntegration | null> {
    const { data, error } = await supabase
      .from('hubspot_integrations')
      .select('*')
      .eq('company_id', companyId)
      .single();
    
    if (error) {
      console.error("Error fetching HubSpot integration:", error);
      return null;
    }
    
    return data as HubspotIntegration;
  },
  
  // Save or update HubSpot integration
  async saveIntegration(companyId: string, accessToken: string, refreshToken: string, expiresAt: Date): Promise<HubspotIntegration | null> {
    const { data, error } = await supabase
      .from('hubspot_integrations')
      .upsert({
        company_id: companyId,
        access_token: accessToken,
        refresh_token: refreshToken,
        token_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'company_id'
      })
      .select()
      .single();
    
    if (error) {
      console.error("Error saving HubSpot integration:", error);
      return null;
    }
    
    return data as HubspotIntegration;
  },
  
  // Sync contacts from HubSpot
  async syncContacts(companyId: string): Promise<HubspotContact[]> {
    try {
      // This would normally use the HubSpot API directly
      // For now, we'll use our Edge Function to proxy the request
      const response = await fetch(`/api/hubspot/sync-contacts?companyId=${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to sync contacts: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.contacts as HubspotContact[];
    } catch (error) {
      console.error("Error syncing HubSpot contacts:", error);
      throw error;
    }
  },
  
  // Get cached contacts for a company
  async getContacts(companyId: string): Promise<HubspotContact[]> {
    const { data, error } = await supabase
      .from('hubspot_contacts')
      .select('*')
      .eq('company_id', companyId)
      .order('last_name', { ascending: true });
    
    if (error) {
      console.error("Error fetching HubSpot contacts:", error);
      return [];
    }
    
    return data as HubspotContact[];
  },
  
  // Get cached notes for a company
  async getNotes(companyId: string): Promise<HubspotNote[]> {
    const { data, error } = await supabase
      .from('hubspot_notes')
      .select('*, hubspot_contacts!inner(*)')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error("Error fetching HubSpot notes:", error);
      return [];
    }
    
    return data as HubspotNote[];
  },
  
  // Get sustainability opportunities
  async getOpportunities(companyId: string): Promise<SustainabilityOpportunity[]> {
    const { data, error } = await supabase
      .from('sustainability_opportunities')
      .select('*, hubspot_contacts(*)')
      .eq('company_id', companyId)
      .order('opportunity_score', { ascending: false });
    
    if (error) {
      console.error("Error fetching sustainability opportunities:", error);
      return [];
    }
    
    return data as SustainabilityOpportunity[];
  },
  
  // Analyze notes for sustainability opportunities
  async analyzeSustainability(companyId: string): Promise<void> {
    try {
      const response = await fetch(`/api/hubspot/analyze-sustainability?companyId=${companyId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to analyze sustainability: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error analyzing sustainability:", error);
      throw error;
    }
  }
};
