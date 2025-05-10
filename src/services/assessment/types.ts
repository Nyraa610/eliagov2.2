
// Types for assessment services

// Type for assessment results
export type AssessmentType = 
  | 'rse_diagnostic' 
  | 'carbon_evaluation' 
  | 'materiality_analysis' 
  | 'action_plan' 
  | 'iro_analysis'
  | 'value_chain';

// Generic type for status
export type AssessmentStatus = 'not-started' | 'in-progress' | 'waiting-for-approval' | 'blocked' | 'completed';

// Type for assessment progress
export type AssessmentProgress = {
  status: AssessmentStatus;
  progress: number;
  form_data?: any;
};

// Type for document templates
export type DocumentTemplateTypes = 
  | 'esg-diagnostic' 
  | 'carbon-evaluation' 
  | 'materiality_analysis' 
  | 'action-plan' 
  | 'iro';
