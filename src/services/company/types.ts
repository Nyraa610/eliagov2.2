
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
}

export interface CompanyWithRole extends Company {
  is_admin: boolean;
}
