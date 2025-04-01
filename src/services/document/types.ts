
import { Database } from "@/integrations/supabase/types";

export type Document = {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  folder_id?: string | null;
  company_id?: string | null;
  created_by: string;
  created_at: string;
  is_personal?: boolean;
};

export type DocumentFolder = {
  id: string;
  name: string;
  parent_id: string | null;
  company_id: string;
  created_at: string;
  created_by: string;
};

export type Deliverable = {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  created_at: string;
  company_id: string;
  category: string;
};
