
export type UserRole = 'admin' | 'user' | 'client_admin';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  bio?: string;
  avatar_url?: string;
}
