
export interface Company {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
  country?: string | null;
  website?: string | null;
  registry_number?: string | null;
  registry_city?: string | null;
  created_at: string;
  updated_at: string;
  
  // French Registry fields
  siren?: string | null;
  siret?: string | null;
  legal_form?: string | null;
  activity_code?: string | null;
  registry_status?: string | null;
  official_address?: string | null;
  employee_count_range?: string | null;
  creation_date?: string | null;
}

export interface CompanyWithRole extends Company {
  is_admin: boolean;
}
