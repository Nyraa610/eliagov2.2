
// Type definitions for our request
export interface AIAnalysisRequest {
  type: 'course-summary' | 'esg-assessment' | 'esg-assistant';
  content: string;
  context?: any[];
  analysisType?: 'integrated';
  additionalParams?: Record<string, any>;
}
