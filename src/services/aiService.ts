
import { supabase } from "@/lib/supabase";

export type AIAnalysisType = 'course-summary' | 'esg-assessment';

export interface AIAnalysisRequest {
  type: AIAnalysisType;
  content: string;
  additionalParams?: Record<string, any>;
}

export interface AIAnalysisResponse {
  result: string;
  metadata?: Record<string, any>;
}

export const aiService = {
  /**
   * Analyze content using AI
   * @param request Analysis request containing type and content
   * @returns Promise with analysis result
   */
  analyzeContent: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    try {
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: request
      });
      
      if (error) throw error;
      
      return data as AIAnalysisResponse;
    } catch (error) {
      console.error("Error in AI Analysis:", error);
      throw new Error("Failed to analyze content. Please try again.");
    }
  },

  /**
   * Generate a course summary
   * @param courseContent The course content to summarize
   * @returns Promise with the summary
   */
  generateCourseSummary: async (courseContent: string): Promise<string> => {
    try {
      const response = await aiService.analyzeContent({
        type: 'course-summary',
        content: courseContent
      });
      
      return response.result;
    } catch (error) {
      console.error("Error generating course summary:", error);
      throw error;
    }
  },

  /**
   * Generate ESG analysis for assessment
   * @param assessmentData The assessment data to analyze
   * @returns Promise with the ESG analysis
   */
  generateESGAnalysis: async (assessmentData: string): Promise<string> => {
    try {
      const response = await aiService.analyzeContent({
        type: 'esg-assessment',
        content: assessmentData
      });
      
      return response.result;
    } catch (error) {
      console.error("Error generating ESG analysis:", error);
      throw error;
    }
  }
};
