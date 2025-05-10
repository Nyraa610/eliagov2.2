
// Main export file for assessment services
import { getAssessmentResults, getAssessmentProgress, saveAssessmentProgress } from './assessmentProgressService';
import { getDocumentTemplate, saveDocumentData } from './documentTemplateService';
import { exportDocument, getDocumentPreview } from './documentExportService';
import { AssessmentType, AssessmentStatus, AssessmentProgress, DocumentTemplateTypes } from './types';

// Export all services as a single object
export const assessmentService = {
  getAssessmentResults,
  getAssessmentProgress,
  saveAssessmentProgress,
  getDocumentTemplate,
  saveDocumentData,
  exportDocument,
  getDocumentPreview
};

// Export types
export type {
  AssessmentType,
  AssessmentStatus,
  AssessmentProgress,
  DocumentTemplateTypes
};
