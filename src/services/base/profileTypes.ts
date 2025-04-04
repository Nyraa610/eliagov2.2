
export type UserRole = 'admin' | 'user' | 'client_admin' | 'consultant';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
  company_id?: string;
  company_name?: string;
  is_company_admin?: boolean;
}
