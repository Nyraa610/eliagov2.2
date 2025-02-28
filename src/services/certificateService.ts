
import { supabaseService } from "./base/supabaseService";
import { Certificate } from "@/types/training";

const { supabase } = supabaseService;

export const certificateService = {
  async getUserCertificates(): Promise<Certificate[]> {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error("User not authenticated");

    const { data, error } = await supabase
      .from('certificates')
      .select('*')
      .eq('user_id', user.user.id);
    
    if (error) throw error;
    return data as Certificate[];
  }
};
