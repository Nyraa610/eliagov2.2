
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";
import { Stakeholder, StakeholderContact } from "@/components/assessment/stakeholder-mapping/StakeholderDatabase";
import { Survey, SurveyTemplate } from "@/components/assessment/stakeholder-mapping/StakeholderSurveys";
import { Node, Edge } from "@xyflow/react";

// Mock data for stakeholder templates
const SURVEY_TEMPLATES: SurveyTemplate[] = [
  {
    id: "template-1",
    name: "General Stakeholder Feedback",
    description: "Basic feedback on sustainability initiatives and company performance",
    stakeholderType: "All Stakeholders",
    questions: [
      {
        id: "q1-1",
        text: "How would you rate our overall sustainability performance?",
        type: "rating",
      },
      {
        id: "q1-2",
        text: "Which of our sustainability initiatives are you most familiar with?",
        type: "multiple_choice",
        options: ["Carbon Reduction", "Waste Management", "Community Engagement", "Diversity & Inclusion", "Other/None"]
      },
      {
        id: "q1-3",
        text: "What sustainability issues should we prioritize in the coming year?",
        type: "text",
      }
    ]
  },
  {
    id: "template-2",
    name: "Employee Sustainability Survey",
    description: "Gather feedback from employees on internal sustainability practices",
    stakeholderType: "Employees",
    questions: [
      {
        id: "q2-1",
        text: "How satisfied are you with the company's sustainability initiatives?",
        type: "rating",
      },
      {
        id: "q2-2",
        text: "Which sustainable practices do you regularly engage in at work?",
        type: "multiple_choice",
        options: ["Recycling", "Energy Conservation", "Sustainable Transportation", "Waste Reduction", "None"]
      },
      {
        id: "q2-3",
        text: "What additional sustainability resources would you like to see?",
        type: "text",
      }
    ]
  },
  {
    id: "template-3",
    name: "Supplier Sustainability Assessment",
    description: "Evaluate supplier sustainability practices and performance",
    stakeholderType: "Suppliers",
    questions: [
      {
        id: "q3-1",
        text: "Do you have a formal sustainability policy?",
        type: "multiple_choice",
        options: ["Yes, comprehensive", "Yes, limited", "In development", "No"]
      },
      {
        id: "q3-2",
        text: "How do you measure your environmental impact?",
        type: "text",
      },
      {
        id: "q3-3",
        text: "What sustainability certifications does your company hold?",
        type: "multiple_choice",
        options: ["ISO 14001", "B Corp", "Carbon Trust", "FSC", "Other", "None"]
      }
    ]
  },
  {
    id: "template-4",
    name: "Community Impact Survey",
    description: "Assess perception of the company's local community impact",
    stakeholderType: "Local Communities",
    questions: [
      {
        id: "q4-1",
        text: "How would you rate our company's positive impact on the local community?",
        type: "rating",
      },
      {
        id: "q4-2",
        text: "Which community initiatives have you participated in or benefited from?",
        type: "multiple_choice",
        options: ["Education Programs", "Environmental Projects", "Charitable Donations", "Local Employment", "None"]
      },
      {
        id: "q4-3",
        text: "What additional community programs would you like to see from our company?",
        type: "text",
      }
    ]
  },
  {
    id: "template-5",
    name: "Customer Sustainability Survey",
    description: "Gather feedback on sustainability aspects of products and services",
    stakeholderType: "Customers",
    questions: [
      {
        id: "q5-1",
        text: "How important are sustainability considerations in your purchasing decisions?",
        type: "rating",
      },
      {
        id: "q5-2",
        text: "Which sustainability aspects of our products/services are most important to you?",
        type: "multiple_choice",
        options: ["Carbon Footprint", "Recyclability", "Ethical Sourcing", "Longevity/Durability", "Other"]
      },
      {
        id: "q5-3",
        text: "How can we improve the sustainability of our products/services?",
        type: "text",
      }
    ]
  }
];

// Local storage keys for mock data
const STORAGE_KEYS = {
  IDENTIFIED_STAKEHOLDERS: "identified_stakeholders",
  MANAGEMENT_PRACTICES: "stakeholder_management_practices",
  STAKEHOLDER_MAP: "stakeholder_map",
  STAKEHOLDER_MAP_VERSIONS: "stakeholder_map_versions",
  STAKEHOLDERS: "stakeholders_list",
  STAKEHOLDER_CONTACTS: "stakeholder_contacts",
  SURVEYS: "stakeholder_surveys",
  SURVEY_RESPONSES: "stakeholder_survey_responses"
};

// Initialize local storage with empty arrays/objects if needed
const initializeLocalStorage = () => {
  if (!localStorage.getItem(STORAGE_KEYS.IDENTIFIED_STAKEHOLDERS)) {
    localStorage.setItem(STORAGE_KEYS.IDENTIFIED_STAKEHOLDERS, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MANAGEMENT_PRACTICES)) {
    localStorage.setItem(STORAGE_KEYS.MANAGEMENT_PRACTICES, JSON.stringify({}));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_MAP)) {
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_MAP, JSON.stringify({ nodes: [], edges: [] }));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_MAP_VERSIONS)) {
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_MAP_VERSIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAKEHOLDERS)) {
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS)) {
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SURVEYS)) {
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.SURVEY_RESPONSES)) {
    localStorage.setItem(STORAGE_KEYS.SURVEY_RESPONSES, JSON.stringify({}));
  }
};

export const stakeholderService = {
  // Step 1: Stakeholder Identification
  saveIdentifiedStakeholders: async (data: {
    companyDescription: string;
    stakeholderTypes: string[];
    documents: string[];
  }) => {
    initializeLocalStorage();
    localStorage.setItem(STORAGE_KEYS.IDENTIFIED_STAKEHOLDERS, JSON.stringify(data));
    
    // In a real implementation, we would save this to Supabase
    // const { data: { session } } = await supabase.auth.getSession();
    // if (!session) throw new Error("No authenticated session");
    
    // const { error } = await supabase.from('stakeholder_identification').upsert({
    //   user_id: session.user.id,
    //   company_description: data.companyDescription,
    //   stakeholder_types: data.stakeholderTypes,
    //   documents: data.documents,
    //   updated_at: new Date().toISOString()
    // });
    
    // if (error) throw error;
    
    return true;
  },
  
  uploadStakeholderDocuments: async (files: File[]) => {
    // In a real implementation, this would upload to Supabase storage
    // For now, we'll just return mock data
    return files.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file) // This would be a real URL in production
    }));
  },
  
  autoIdentifyStakeholders: async (companyDescription: string) => {
    // In a real implementation, this might use AI to identify stakeholders
    // For now, return mock data
    return {
      stakeholders: [
        "Employees",
        "Shareholders/Investors",
        "Customers/Clients",
        "Suppliers/Vendors",
        "Local Communities"
      ]
    };
  },
  
  // Step 2: Stakeholder Management Practices
  saveManagementPractices: async (data: any) => {
    initializeLocalStorage();
    localStorage.setItem(STORAGE_KEYS.MANAGEMENT_PRACTICES, JSON.stringify(data));
    
    // In a real implementation, save to Supabase
    return true;
  },
  
  // Step 3: Stakeholder Map
  getStakeholderMap: async () => {
    initializeLocalStorage();
    const mapData = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_MAP) || '{"nodes":[],"edges":[]}');
    return mapData;
  },
  
  saveStakeholderMap: async (nodes: Node[], edges: Edge[]) => {
    initializeLocalStorage();
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_MAP, JSON.stringify({ nodes, edges }));
    
    // In a real implementation, save to Supabase
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from('stakeholder_assessments')
          .upsert({
            user_id: session.user.id,
            visual_map: { nodes, edges },
            updated_at: new Date().toISOString()
          });
          
        if (error) console.error("Error saving to Supabase:", error);
      }
    } catch (err) {
      console.error("Error in Supabase save:", err);
    }
    
    return true;
  },
  
  // New function to save map versions
  saveStakeholderMapVersion: async (companyId: string, name: string, imageUrl: string) => {
    const versionId = uuidv4();
    const version = {
      id: versionId,
      company_id: companyId,
      name,
      image_url: imageUrl,
      created_at: new Date().toISOString()
    };
    
    // Save to localStorage for mock data
    initializeLocalStorage();
    const versions = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_MAP_VERSIONS) || '[]');
    versions.push(version);
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_MAP_VERSIONS, JSON.stringify(versions));
    
    // In a real implementation, save to Supabase
    try {
      const { error } = await supabase
        .from('stakeholder_map_versions')
        .insert({
          id: versionId,
          company_id: companyId,
          name,
          image_url: imageUrl,
          created_at: new Date().toISOString()
        });
        
      if (error) {
        console.error("Error saving version to Supabase:", error);
        throw error;
      }
    } catch (err) {
      console.error("Error in Supabase version save:", err);
      throw err;
    }
    
    return versionId;
  },
  
  // New function to get map versions
  getStakeholderMapVersions: async (companyId: string) => {
    // First try to get from Supabase
    try {
      const { data, error } = await supabase
        .from('stakeholder_map_versions')
        .select('id, name, created_at')
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data && data.length > 0) {
        return data;
      }
    } catch (err) {
      console.error("Error fetching versions from Supabase:", err);
    }
    
    // Fall back to localStorage
    initializeLocalStorage();
    const versions = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_MAP_VERSIONS) || '[]');
    return versions.filter((v: any) => v.company_id === companyId)
      .map((v: any) => ({
        id: v.id,
        name: v.name,
        created_at: v.created_at
      }));
  },
  
  // Step 4: Stakeholder Database
  getStakeholders: async (): Promise<Stakeholder[]> => {
    initializeLocalStorage();
    const stakeholders = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDERS) || "[]");
    return stakeholders;
  },
  
  addStakeholder: async (stakeholder: Omit<Stakeholder, "id">): Promise<Stakeholder> => {
    initializeLocalStorage();
    const stakeholders = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDERS) || "[]");
    
    const newStakeholder = {
      ...stakeholder,
      id: uuidv4()
    };
    
    stakeholders.push(newStakeholder);
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDERS, JSON.stringify(stakeholders));
    
    // In a real implementation, save to Supabase
    return newStakeholder;
  },
  
  deleteStakeholder: async (id: string): Promise<boolean> => {
    initializeLocalStorage();
    const stakeholders = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDERS) || "[]");
    const filteredStakeholders = stakeholders.filter((s: Stakeholder) => s.id !== id);
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDERS, JSON.stringify(filteredStakeholders));
    
    // Also delete contacts associated with this stakeholder
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS) || "[]");
    const filteredContacts = contacts.filter((c: StakeholderContact) => c.stakeholderId !== id);
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS, JSON.stringify(filteredContacts));
    
    // In a real implementation, delete from Supabase
    return true;
  },
  
  getStakeholderContacts: async (): Promise<StakeholderContact[]> => {
    initializeLocalStorage();
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS) || "[]");
    return contacts;
  },
  
  addStakeholderContact: async (contact: Omit<StakeholderContact, "id">): Promise<StakeholderContact> => {
    initializeLocalStorage();
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS) || "[]");
    
    const newContact = {
      ...contact,
      id: uuidv4()
    };
    
    contacts.push(newContact);
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS, JSON.stringify(contacts));
    
    // In a real implementation, save to Supabase
    return newContact;
  },
  
  deleteStakeholderContact: async (id: string): Promise<boolean> => {
    initializeLocalStorage();
    const contacts = JSON.parse(localStorage.getItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS) || "[]");
    const filteredContacts = contacts.filter((c: StakeholderContact) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.STAKEHOLDER_CONTACTS, JSON.stringify(filteredContacts));
    
    // In a real implementation, delete from Supabase
    return true;
  },
  
  // Step 5: Stakeholder Surveys
  getSurveyTemplates: async (): Promise<SurveyTemplate[]> => {
    // In a real implementation, fetch from Supabase
    return SURVEY_TEMPLATES;
  },
  
  getSurveys: async (): Promise<Survey[]> => {
    initializeLocalStorage();
    const surveys = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEYS) || "[]");
    return surveys;
  },
  
  createSurvey: async (survey: Omit<Survey, "id">): Promise<Survey> => {
    initializeLocalStorage();
    const surveys = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEYS) || "[]");
    
    const newSurvey = {
      ...survey,
      id: uuidv4()
    };
    
    surveys.push(newSurvey);
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
    
    // In a real implementation, save to Supabase
    return newSurvey;
  },
  
  sendSurvey: async (surveyId: string, contactIds: string[]): Promise<boolean> => {
    initializeLocalStorage();
    const surveys = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEYS) || "[]");
    
    // Update the survey status to "sent"
    const updatedSurveys = surveys.map((s: Survey) => {
      if (s.id === surveyId) {
        return {
          ...s,
          status: "sent",
          sentCount: s.sentCount + contactIds.length,
          lastSentAt: new Date().toISOString()
        };
      }
      return s;
    });
    
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(updatedSurveys));
    
    // Simulate some responses (in real implementation this would be handled by the survey tool)
    setTimeout(() => {
      const responses = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEY_RESPONSES) || "{}");
      
      // Create mock responses
      if (!responses[surveyId]) {
        responses[surveyId] = {
          responses: []
        };
      }
      
      // Add mock responses for ~60% of contacts
      const respondingContacts = contactIds.filter(() => Math.random() > 0.4);
      
      if (respondingContacts.length > 0) {
        // Find the survey to update its response count
        const surveys = JSON.parse(localStorage.getItem(STORAGE_KEYS.SURVEYS) || "[]");
        const updatedSurveys = surveys.map((s: Survey) => {
          if (s.id === surveyId) {
            return {
              ...s,
              responseCount: s.responseCount + respondingContacts.length
            };
          }
          return s;
        });
        
        // Update local storage
        localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(updatedSurveys));
        localStorage.setItem(STORAGE_KEYS.SURVEY_RESPONSES, JSON.stringify(responses));
        
        // Notify user of responses
        toast.success(`${respondingContacts.length} responses received to survey`);
      }
    }, 5000); // Simulate response delay
    
    // In a real implementation, this would send emails to contacts
    return true;
  },
  
  getSurveyResults: async (surveyId: string): Promise<any> => {
    // In a real implementation, fetch from Supabase
    // For now, return mock data
    return {
      averageCompletionTime: "3m 45s",
      averageRating: 4.2,
      questions: [
        {
          text: "How would you rate our overall sustainability performance?",
          type: "rating",
          responses: {
            1: 2,
            2: 5,
            3: 10,
            4: 15,
            5: 8
          }
        },
        {
          text: "Which of our sustainability initiatives are you most familiar with?",
          type: "multiple_choice",
          responses: {
            "Carbon Reduction": 12,
            "Waste Management": 18,
            "Community Engagement": 8,
            "Diversity & Inclusion": 6,
            "Other/None": 4
          }
        },
        {
          text: "What sustainability issues should we prioritize?",
          type: "text",
          responses: [
            "More focus on renewable energy",
            "Plastic reduction in packaging",
            "Better reporting on progress",
            "Employee volunteering opportunities",
            "Supply chain transparency"
          ]
        }
      ]
    };
  }
};
