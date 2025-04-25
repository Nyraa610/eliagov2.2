
import { supabase } from "@/integrations/supabase/client";

export type AIAnalysisType = 'course-summary' | 'esg-assessment' | 'iro-analysis' | 'esg-assistant';

export interface AIAnalysisRequest {
  type: AIAnalysisType;
  content: string;
  context?: Array<{ role: 'user' | 'assistant', content: string }>;
  additionalParams?: Record<string, any>;
  analysisType?: string;
}

export interface AIAnalysisResponse {
  result: string;
  metadata?: Record<string, any>;
}

export interface ChatHistoryItem {
  id: string;
  user_id: string;
  user_message: string;
  assistant_response: string;
  created_at: string;
  tag?: 'esg' | 'app' | 'general';
}

export const aiService = {
  /**
   * Analyze content using AI
   * @param request Analysis request containing type and content
   * @returns Promise with analysis result
   */
  analyzeContent: async (request: AIAnalysisRequest): Promise<AIAnalysisResponse> => {
    try {
      console.log("Sending AI analysis request:", {
        type: request.type,
        contentLength: request.content.length,
        contextSize: request.context?.length || 0
      });
      
      const startTime = Date.now();
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: request
      });
      const endTime = Date.now();
      
      console.log(`AI analysis response received in ${endTime - startTime}ms`);
      
      if (error) {
        console.error("Supabase function error:", error);
        throw error;
      }
      
      console.log("AI analysis response:", data);
      
      if (!data) {
        console.error("Empty response from AI service");
        throw new Error("Empty response from AI service");
      }
      
      if (typeof data.result !== 'string') {
        console.error("Invalid AI analysis response format:", data);
        throw new Error("Invalid response format from AI service");
      }
      
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
  },
  
  /**
   * Generate Risks and Opportunities analysis
   * @param businessContext The business context to analyze
   * @returns Promise with the risks and opportunities analysis
   */
  generateIROAnalysis: async (businessContext: string): Promise<string> => {
    try {
      const response = await aiService.analyzeContent({
        type: 'esg-assessment',
        content: `IRO Analysis: ${businessContext}`
      });
      
      return response.result;
    } catch (error) {
      console.error("Error generating IRO analysis:", error);
      throw error;
    }
  },

  /**
   * Generate IRO items formatted for the IRO analysis form
   * @param businessContext The business context to analyze
   * @returns Promise with the analysis response
   */
  generateIROItems: async (businessContext: string): Promise<AIAnalysisResponse> => {
    try {
      const response = await aiService.analyzeContent({
        type: 'esg-assessment',
        content: `IRO Analysis: ${businessContext}`
      });
      
      return response;
    } catch (error) {
      console.error("Error generating IRO items:", error);
      throw error;
    }
  },

  /**
   * Get ESG assistant response
   * @param query The user's query
   * @param context Previous conversation context
   * @returns Promise with the assistant's response
   */
  getAssistantResponse: async (
    query: string, 
    context?: Array<{ role: 'user' | 'assistant', content: string }>
  ): Promise<string> => {
    try {
      const response = await aiService.analyzeContent({
        type: 'esg-assistant',
        content: query,
        context: context
      });
      
      return response.result;
    } catch (error) {
      console.error("Error getting assistant response:", error);
      throw error;
    }
  },

  /**
   * Get chat history from the database
   * @returns Promise with the chat history
   */
  getChatHistory: async (): Promise<ChatHistoryItem[]> => {
    try {
      console.log("Fetching chat history from database");
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(50);
      
      if (error) {
        console.error("Error fetching chat history:", error);
        throw error;
      }
      
      console.log(`Retrieved ${data?.length || 0} chat history items`);
      return data || [];
    } catch (error) {
      console.error("Error in getChatHistory:", error);
      throw error;
    }
  }
};
