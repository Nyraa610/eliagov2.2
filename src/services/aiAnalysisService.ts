
import { supabase } from "@/lib/supabase";

export interface AnalysisResult {
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  keyPoints: string[];
  confidence: number;
}

export interface FileAnalysisResult extends AnalysisResult {
  fileName: string;
  fileType: string;
  fileSize: number;
}

export const aiAnalysisService = {
  /**
   * Analyze text content using AI
   */
  analyzeText: async (text: string): Promise<AnalysisResult> => {
    try {
      if (!text || text.trim().length === 0) {
        throw new Error("No text provided for analysis");
      }

      const { data, error } = await supabase.functions.invoke('analyze-text', {
        body: { text },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing text:", error);
      throw error;
    }
  },

  /**
   * Analyze file content using AI
   */
  analyzeFile: async (file: File): Promise<FileAnalysisResult> => {
    try {
      if (!file) {
        throw new Error("No file provided for analysis");
      }

      // First, upload the file to get a URL
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `ai-analysis/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('analysis-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('analysis-files')
        .getPublicUrl(filePath);

      // Now analyze the file
      const { data, error } = await supabase.functions.invoke('analyze-file', {
        body: { 
          fileUrl: urlData.publicUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size
        },
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Error analyzing file:", error);
      throw error;
    }
  },
};
