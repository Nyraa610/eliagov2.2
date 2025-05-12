
export interface AIAnalysisRequest {
  type: 'course-summary' | 'esg-assessment' | 'esg-assistant';
  content: string;
  context?: Array<{ role: 'user' | 'assistant', content: string }>;
  additionalParams?: Record<string, any>;
  analysisType?: string;
}
