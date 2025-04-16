
export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  size: number;
  created_at: string;
  updated_at: string;
  company_id: string;
  folder_id?: string | null;
  user_id: string;
  description?: string | null;
  tags?: string[] | null;
  metadata?: Record<string, any> | null;
}

export interface DocumentFolder {
  id: string;
  name: string;
  company_id: string;
  parent_id?: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  description?: string | null;
}

export interface Deliverable {
  id: string;
  company_id: string;
  name: string;
  description?: string | null;
  file_path: string;
  file_type: string;
  created_at: string;
  updated_at?: string | null;
  assessment_type?: string | null;
  assessment_id?: string | null;
  category?: string | null;
  status?: string;
  metadata?: Record<string, any> | null;
}

export interface DeliverableInput {
  company_id: string;
  name: string;
  description?: string | null;
  file_path: string;
  file_type: string;
  assessment_type?: string | null;
  assessment_id?: string | null;
  category?: string | null;
  status?: string;
  metadata?: Record<string, any> | null;
}
