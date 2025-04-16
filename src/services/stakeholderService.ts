
import { supabase } from "@/integrations/supabase/client";
import { supabaseStorageService, UploadedDocument } from "./storage/supabaseStorageService";

export type StakeholderIdentification = {
  companyDescription: string;
  stakeholderTypes: string[];
  documents: string[];
};

export type Stakeholder = {
  id: string;
  name: string;
  type: string;
  influence: 'low' | 'medium' | 'high';
  interest: 'low' | 'medium' | 'high';
  contactCount: number;
  description?: string;
};

export type StakeholderContact = {
  id: string;
  stakeholderId: string;
  name: string;
  email: string;
  position?: string;
  phone?: string;
  notes?: string;
};

export type ManagementPractices = {
  engagementFrequency: string;
  engagementMethods: string;
  stakeholderInfluence: string;
  documentsProcesses: string;
  stakeholderFeedback: string;
  managementChallenges: string;
};

export type Survey = {
  id: string;
  templateId: string;
  name: string;
  stakeholderType: string;
  status: 'draft' | 'sent' | 'completed';
  sentCount: number;
  responseCount: number;
  createdAt: string;
  lastSentAt?: string;
};

export type SurveyTemplate = {
  id: string;
  name: string;
  description: string;
  stakeholderType: string;
  questions: SurveyQuestion[];
};

export type SurveyQuestion = {
  id: string;
  text: string;
  type: 'multiple_choice' | 'rating' | 'text';
  options?: string[];
};

export type SurveyResult = {
  id: string;
  contactId: string;
  contactName: string;
  submittedAt: string;
  answers: {
    questionId: string;
    questionText: string;
    answer: string | number;
  }[];
};

export const stakeholderService = {
  /**
   * Upload documents related to stakeholders
   * @param files Array of files to upload
   * @returns Promise with array of uploaded document file names
   */
  async uploadStakeholderDocuments(files: File[]): Promise<UploadedDocument[]> {
    try {
      // Get company ID for the current user
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get user's profile to find their company ID
      const { data: profile } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', userData.user.id)
        .single();
        
      if (!profile || !profile.company_id) {
        throw new Error("User is not associated with a company");
      }
      
      // Define a folder path using the company ID
      const folderPath = `company-${profile.company_id}/stakeholders`;
      
      // Upload files using storage service
      return await supabaseStorageService.uploadDocuments(files, folderPath);
    } catch (error) {
      console.error("Error uploading stakeholder documents:", error);
      throw error;
    }
  },
  
  /**
   * Save identified stakeholders information
   * @param data Stakeholder identification data
   * @returns Promise indicating success
   */
  async saveIdentifiedStakeholders(data: StakeholderIdentification): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get current assessment progress
      const { data: progress, error: progressError } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('assessment_type', 'stakeholder_mapping')
        .single();
        
      const formData = {
        identification: {
          companyDescription: data.companyDescription,
          stakeholderTypes: data.stakeholderTypes,
          documents: data.documents
        }
      };
      
      if (progressError || !progress) {
        // Create new assessment progress
        await supabase
          .from('assessment_progress')
          .insert({
            user_id: userData.user.id,
            assessment_type: 'stakeholder_mapping',
            status: 'in_progress',
            progress: 25,
            form_data: formData
          });
      } else {
        // Update existing assessment progress
        const existingData = progress.form_data || {};
        
        await supabase
          .from('assessment_progress')
          .update({
            progress: Math.max(progress.progress, 25),
            form_data: {
              ...existingData,
              identification: formData.identification
            }
          })
          .eq('id', progress.id);
      }
    } catch (error) {
      console.error("Error saving stakeholder identification:", error);
      throw error;
    }
  },
  
  /**
   * Auto-identify stakeholders based on company description
   * @param companyDescription Description of the company
   * @returns Object with identified stakeholders
   */
  async autoIdentifyStakeholders(companyDescription: string): Promise<{ stakeholders: string[] }> {
    // This is a simplified implementation - in a real app, you might use an AI service
    // to analyze the company description and identify relevant stakeholders
    
    const companyDescLower = companyDescription.toLowerCase();
    const identifiedStakeholders: string[] = [];
    
    // Simple keyword matching
    if (companyDescLower.includes("employee") || companyDescLower.includes("staff") || 
        companyDescLower.includes("personnel") || companyDescLower.includes("workforce")) {
      identifiedStakeholders.push("Employees");
    }
    
    if (companyDescLower.includes("investor") || companyDescLower.includes("shareholder") || 
        companyDescLower.includes("stock") || companyDescLower.includes("ownership")) {
      identifiedStakeholders.push("Shareholders/Investors");
    }
    
    if (companyDescLower.includes("customer") || companyDescLower.includes("client") || 
        companyDescLower.includes("consumer") || companyDescLower.includes("buyer")) {
      identifiedStakeholders.push("Customers/Clients");
    }
    
    if (companyDescLower.includes("supplier") || companyDescLower.includes("vendor") || 
        companyDescLower.includes("provider") || companyDescLower.includes("distributor")) {
      identifiedStakeholders.push("Suppliers/Vendors");
    }
    
    if (companyDescLower.includes("community") || companyDescLower.includes("neighborhood") || 
        companyDescLower.includes("local") || companyDescLower.includes("resident")) {
      identifiedStakeholders.push("Local Communities");
    }
    
    if (companyDescLower.includes("government") || companyDescLower.includes("authority") || 
        companyDescLower.includes("public sector") || companyDescLower.includes("official")) {
      identifiedStakeholders.push("Government Bodies");
    }
    
    if (companyDescLower.includes("regulator") || companyDescLower.includes("compliance") || 
        companyDescLower.includes("standard") || companyDescLower.includes("regulation")) {
      identifiedStakeholders.push("Regulators");
    }
    
    if (companyDescLower.includes("ngo") || companyDescLower.includes("non-profit") || 
        companyDescLower.includes("organization") || companyDescLower.includes("advocacy")) {
      identifiedStakeholders.push("NGOs/Civil Society Organizations");
    }
    
    return { stakeholders: identifiedStakeholders };
  },
  
  /**
   * Save management practices information
   * @param data Management practices data
   * @returns Promise indicating success
   */
  async saveManagementPractices(data: ManagementPractices): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get current assessment progress
      const { data: progress, error: progressError } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('assessment_type', 'stakeholder_mapping')
        .single();
        
      const formData = {
        management: {
          ...data
        }
      };
      
      if (progressError || !progress) {
        // Create new assessment progress
        await supabase
          .from('assessment_progress')
          .insert({
            user_id: userData.user.id,
            assessment_type: 'stakeholder_mapping',
            status: 'in_progress',
            progress: 50,
            form_data: formData
          });
      } else {
        // Update existing assessment progress
        const existingData = progress.form_data || {};
        
        await supabase
          .from('assessment_progress')
          .update({
            progress: Math.max(progress.progress, 50),
            form_data: {
              ...existingData,
              management: formData.management
            }
          })
          .eq('id', progress.id);
      }
    } catch (error) {
      console.error("Error saving management practices:", error);
      throw error;
    }
  },
  
  /**
   * Get stakeholder map data
   * @returns Promise with nodes and edges for the stakeholder map
   */
  async getStakeholderMap(): Promise<{ nodes: any[], edges: any[] }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get current assessment progress
      const { data: progress, error: progressError } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('assessment_type', 'stakeholder_mapping')
        .single();
        
      if (progressError || !progress || !progress.form_data || !progress.form_data.visual_map) {
        return { nodes: [], edges: [] };
      }
      
      return progress.form_data.visual_map || { nodes: [], edges: [] };
    } catch (error) {
      console.error("Error getting stakeholder map:", error);
      throw error;
    }
  },
  
  /**
   * Save stakeholder map data
   * @param nodes Array of node objects
   * @param edges Array of edge objects
   * @returns Promise indicating success
   */
  async saveStakeholderMap(nodes: any[], edges: any[]): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // Get current assessment progress
      const { data: progress, error: progressError } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('user_id', userData.user.id)
        .eq('assessment_type', 'stakeholder_mapping')
        .single();
        
      const formData = {
        visual_map: {
          nodes,
          edges
        }
      };
      
      if (progressError || !progress) {
        // Create new assessment progress
        await supabase
          .from('assessment_progress')
          .insert({
            user_id: userData.user.id,
            assessment_type: 'stakeholder_mapping',
            status: 'in_progress',
            progress: 75,
            form_data: formData
          });
      } else {
        // Update existing assessment progress
        const existingData = progress.form_data || {};
        
        await supabase
          .from('assessment_progress')
          .update({
            progress: Math.max(progress.progress, 75),
            form_data: {
              ...existingData,
              visual_map: formData.visual_map
            }
          })
          .eq('id', progress.id);
      }
    } catch (error) {
      console.error("Error saving stakeholder map:", error);
      throw error;
    }
  },
  
  /**
   * Get stakeholders
   * @returns Promise with array of stakeholders
   */
  async getStakeholders(): Promise<Stakeholder[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll return mock data
      // In a real app, this would fetch from Supabase
      return [
        {
          id: '1',
          name: 'Employees',
          type: 'Internal',
          influence: 'high',
          interest: 'high',
          contactCount: 2
        },
        {
          id: '2',
          name: 'Customers',
          type: 'External',
          influence: 'high',
          interest: 'medium',
          contactCount: 3
        },
        {
          id: '3',
          name: 'Suppliers',
          type: 'External',
          influence: 'medium',
          interest: 'low',
          contactCount: 1
        }
      ];
    } catch (error) {
      console.error("Error getting stakeholders:", error);
      throw error;
    }
  },
  
  /**
   * Add a new stakeholder
   * @param stakeholder Stakeholder data
   * @returns Promise with the added stakeholder
   */
  async addStakeholder(stakeholder: Omit<Stakeholder, 'id'>): Promise<Stakeholder> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll return mock data
      // In a real app, this would insert into Supabase
      const newId = Date.now().toString();
      return {
        id: newId,
        ...stakeholder
      };
    } catch (error) {
      console.error("Error adding stakeholder:", error);
      throw error;
    }
  },
  
  /**
   * Delete a stakeholder
   * @param id Stakeholder ID
   * @returns Promise indicating success
   */
  async deleteStakeholder(id: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll just log
      // In a real app, this would delete from Supabase
      console.log(`Deleting stakeholder with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting stakeholder:", error);
      throw error;
    }
  },
  
  /**
   * Get stakeholder contacts
   * @returns Promise with array of stakeholder contacts
   */
  async getStakeholderContacts(): Promise<StakeholderContact[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll return mock data
      // In a real app, this would fetch from Supabase
      return [
        {
          id: '1',
          stakeholderId: '1',
          name: 'John Doe',
          email: 'john@example.com',
          position: 'HR Manager'
        },
        {
          id: '2',
          stakeholderId: '1',
          name: 'Jane Smith',
          email: 'jane@example.com',
          position: 'Employee Representative'
        },
        {
          id: '3',
          stakeholderId: '2',
          name: 'Alice Johnson',
          email: 'alice@customer.com',
          position: 'Procurement Manager'
        }
      ];
    } catch (error) {
      console.error("Error getting stakeholder contacts:", error);
      throw error;
    }
  },
  
  /**
   * Add a new stakeholder contact
   * @param contact Contact data
   * @returns Promise with the added contact
   */
  async addStakeholderContact(contact: Omit<StakeholderContact, 'id'>): Promise<StakeholderContact> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll return mock data
      // In a real app, this would insert into Supabase
      const newId = Date.now().toString();
      return {
        id: newId,
        ...contact
      };
    } catch (error) {
      console.error("Error adding contact:", error);
      throw error;
    }
  },
  
  /**
   * Delete a stakeholder contact
   * @param id Contact ID
   * @returns Promise indicating success
   */
  async deleteStakeholderContact(id: string): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll just log
      // In a real app, this would delete from Supabase
      console.log(`Deleting contact with ID: ${id}`);
    } catch (error) {
      console.error("Error deleting contact:", error);
      throw error;
    }
  },
  
  /**
   * Get survey templates
   * @returns Promise with array of survey templates
   */
  async getSurveyTemplates(): Promise<SurveyTemplate[]> {
    try {
      // In a real app, this would fetch from Supabase
      return [
        {
          id: '1',
          name: 'General Stakeholder Feedback',
          description: 'Basic template for collecting feedback from any stakeholder type',
          stakeholderType: 'All',
          questions: [
            {
              id: '1-1',
              text: 'How satisfied are you with our engagement?',
              type: 'rating'
            },
            {
              id: '1-2',
              text: 'What areas could we improve?',
              type: 'text'
            }
          ]
        },
        {
          id: '2',
          name: 'Customer Sustainability Survey',
          description: 'Survey focused on customer perception of sustainability initiatives',
          stakeholderType: 'Customers/Clients',
          questions: [
            {
              id: '2-1',
              text: 'How important is sustainability to your purchasing decisions?',
              type: 'rating'
            },
            {
              id: '2-2',
              text: 'Which sustainability aspects matter most to you?',
              type: 'multiple_choice',
              options: ['Carbon footprint', 'Ethical sourcing', 'Waste reduction', 'Social impact']
            }
          ]
        }
      ];
    } catch (error) {
      console.error("Error getting survey templates:", error);
      throw error;
    }
  },
  
  /**
   * Get surveys
   * @returns Promise with array of surveys
   */
  async getSurveys(): Promise<Survey[]> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll return mock data
      // In a real app, this would fetch from Supabase
      return [
        {
          id: '1',
          templateId: '1',
          name: 'Annual Stakeholder Feedback 2025',
          stakeholderType: 'All',
          status: 'sent',
          sentCount: 10,
          responseCount: 4,
          createdAt: '2025-03-15T12:00:00Z',
          lastSentAt: '2025-03-20T09:30:00Z'
        },
        {
          id: '2',
          templateId: '2',
          name: 'Customer Sustainability Perception',
          stakeholderType: 'Customers/Clients',
          status: 'draft',
          sentCount: 0,
          responseCount: 0,
          createdAt: '2025-03-18T15:45:00Z'
        }
      ];
    } catch (error) {
      console.error("Error getting surveys:", error);
      throw error;
    }
  },
  
  /**
   * Create a new survey
   * @param survey Survey data
   * @returns Promise with the created survey
   */
  async createSurvey(survey: Omit<Survey, 'id'>): Promise<Survey> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll create a mock survey
      // In a real app, this would insert into Supabase
      const newId = Date.now().toString();
      return {
        id: newId,
        ...survey
      };
    } catch (error) {
      console.error("Error creating survey:", error);
      throw error;
    }
  },
  
  /**
   * Send a survey to contacts
   * @param surveyId Survey ID
   * @param contactIds Array of contact IDs
   * @returns Promise indicating success
   */
  async sendSurvey(surveyId: string, contactIds: string[]): Promise<void> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      
      if (!userData.user) {
        throw new Error("User not authenticated");
      }
      
      // For this example, we'll just log
      // In a real app, this would update Supabase and possibly trigger emails
      console.log(`Sending survey ${surveyId} to contacts: ${contactIds.join(', ')}`);
    } catch (error) {
      console.error("Error sending survey:", error);
      throw error;
    }
  },
  
  /**
   * Get survey results
   * @param surveyId Survey ID
   * @returns Promise with array of survey results
   */
  async getSurveyResults(surveyId: string): Promise<SurveyResult[]> {
    try {
      // For this example, we'll return mock data
      // In a real app, this would fetch from Supabase
      if (surveyId === '1') {
        return [
          {
            id: '1-1',
            contactId: '3',
            contactName: 'Alice Johnson',
            submittedAt: '2025-03-22T14:30:00Z',
            answers: [
              {
                questionId: '1-1',
                questionText: 'How satisfied are you with our engagement?',
                answer: 4
              },
              {
                questionId: '1-2',
                questionText: 'What areas could we improve?',
                answer: 'More regular updates on sustainability initiatives.'
              }
            ]
          }
        ];
      }
      return [];
    } catch (error) {
      console.error("Error getting survey results:", error);
      throw error;
    }
  }
};
