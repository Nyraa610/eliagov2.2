
import { supabase } from "@/lib/supabase";

export interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder_id: string | null;
  company_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentFolder {
  id: string;
  name: string;
  company_id: string;
  parent_id: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Deliverable {
  id: string;
  name: string;
  description: string | null;
  file_path: string;
  document_type: string;
  company_id: string;
  created_at: string;
  updated_at: string;
}
