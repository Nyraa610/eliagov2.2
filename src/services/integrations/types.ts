
export interface HubspotIntegration {
  id: string;
  company_id: string;
  access_token: string;
  refresh_token: string;
  token_expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface HubspotContact {
  id: string;
  company_id: string;
  hubspot_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  company_name: string | null;
  sustainability_score: number;
  last_synced_at: string;
  raw_data: any;
  created_at: string;
  updated_at: string;
}

export interface HubspotNote {
  id: string;
  company_id: string;
  contact_id: string;
  hubspot_id: string;
  content: string | null;
  sustainability_keywords: string[] | null;
  sustainability_score: number;
  analyzed: boolean;
  last_synced_at: string;
  raw_data: any;
  created_at: string;
  updated_at: string;
  hubspot_contacts?: HubspotContact;
}

export interface SustainabilityOpportunity {
  id: string;
  company_id: string;
  contact_id: string | null;
  title: string;
  description: string | null;
  opportunity_score: number;
  opportunity_status: 'new' | 'in-progress' | 'completed' | 'dismissed';
  source: 'hubspot' | 'manual' | 'ai';
  created_at: string;
  updated_at: string;
  hubspot_contacts?: HubspotContact | null;
}
