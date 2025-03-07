
import { supabase } from "@/lib/supabase";
import { companyService } from "./companyService";

export const companyStorageService = {
  async uploadLogo(companyId: string, file: File) {
    try {
      // First create a folder with the company ID
      const filePath = `${companyId}/${Date.now()}-${file.name}`;
      
      // Upload to storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('company_logos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data } = supabase.storage
        .from('company_logos')
        .getPublicUrl(filePath);
        
      // Update company with new logo URL
      await companyService.updateCompany(companyId, { logo_url: data.publicUrl });
      
      return data.publicUrl;
    } catch (error) {
      console.error("Error uploading company logo:", error);
      throw error;
    }
  }
};
