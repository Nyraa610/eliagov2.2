
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  ClipboardList, 
  FileBarChart, 
  Mail, 
  MailPlus, 
  Plus
} from "lucide-react";
import { stakeholderService } from "@/services/stakeholderService";
import { CreateSurveyDialog } from "./surveys/CreateSurveyDialog";
import { SendSurveyDialog } from "./surveys/SendSurveyDialog";
import { ViewResultsDialog } from "./surveys/ViewResultsDialog";
import { Badge } from "@/components/ui/badge";
import { StakeholderContact } from "./database/StakeholderContactDialog";

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

export function StakeholderSurveys() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [templates, setTemplates] = useState<SurveyTemplate[]>([]);
  const [contacts, setContacts] = useState<StakeholderContact[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [isResultsDialogOpen, setIsResultsDialogOpen] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load surveys, templates and contacts
        const [surveysData, templatesData, contactsData] = await Promise.all([
          stakeholderService.getSurveys(),
          stakeholderService.getSurveyTemplates(),
          stakeholderService.getStakeholderContacts()
        ]);
        
        setSurveys(surveysData);
        setTemplates(templatesData);
        setContacts(contactsData);
      } catch (error) {
        console.error("Error loading survey data:", error);
        toast.error("Failed to load survey data");
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleCreateSurvey = async (templateId: string, name: string) => {
    try {
      const selectedTemplate = templates.find(t => t.id === templateId);
      if (!selectedTemplate) {
        toast.error("Template not found");
        return;
      }
      
      const newSurvey = await stakeholderService.createSurvey({
        templateId,
        name,
        stakeholderType: selectedTemplate.stakeholderType,
        status: 'draft',
        sentCount: 0,
        responseCount: 0,
        createdAt: new Date().toISOString()
      });
      
      setSurveys([...surveys, newSurvey]);
      toast.success("Survey created successfully");
    } catch (error) {
      console.error("Error creating survey:", error);
      toast.error("Failed to create survey");
    }
  };

  const handleSendSurvey = async (surveyId: string, contactIds: string[]) => {
    try {
      if (!selectedSurvey) return;
      
      await stakeholderService.sendSurvey(surveyId, contactIds);
      
      // Update the survey status and sent count
      const updatedSurveys = surveys.map(s => 
        s.id === surveyId 
          ? { 
              ...s, 
              status: 'sent' as const, 
              sentCount: s.sentCount + contactIds.length,
              lastSentAt: new Date().toISOString()
            }
          : s
      );
      
      setSurveys(updatedSurveys);
      toast.success(`Survey sent to ${contactIds.length} contacts`);
    } catch (error) {
      console.error("Error sending survey:", error);
      toast.error("Failed to send survey");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'draft':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Draft</Badge>;
      case 'sent':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Sent</Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Stakeholder Surveys
          </CardTitle>
          <CardDescription>
            Create and send surveys to your stakeholders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-end mb-6">
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create Survey
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading surveys...</p>
            </div>
          ) : surveys.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ClipboardList className="h-12 w-12 text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No surveys created yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first survey to gather feedback from stakeholders
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Create Survey
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Survey Name</TableHead>
                    <TableHead>Stakeholder Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Responses</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Last Sent</TableHead>
                    <TableHead className="w-[180px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {surveys.map((survey) => (
                    <TableRow key={survey.id}>
                      <TableCell className="font-medium">{survey.name}</TableCell>
                      <TableCell>{survey.stakeholderType}</TableCell>
                      <TableCell>{getStatusBadge(survey.status)}</TableCell>
                      <TableCell>{survey.sentCount}</TableCell>
                      <TableCell>{survey.responseCount}</TableCell>
                      <TableCell>{formatDate(survey.createdAt)}</TableCell>
                      <TableCell>{formatDate(survey.lastSentAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setIsSendDialogOpen(true);
                            }}
                          >
                            <Mail className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedSurvey(survey);
                              setIsResultsDialogOpen(true);
                            }}
                            disabled={survey.responseCount === 0}
                          >
                            <FileBarChart className="h-4 w-4 text-green-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-medium mb-4">Template Library</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      For {template.stakeholderType}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      {template.description}
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      {template.questions.length} questions
                    </p>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        setIsCreateDialogOpen(true);
                        // Pre-select this template
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <CreateSurveyDialog 
        open={isCreateDialogOpen}
        onClose={() => setIsCreateDialogOpen(false)}
        onCreateSurvey={handleCreateSurvey}
        templates={templates}
      />

      {selectedSurvey && (
        <>
          <SendSurveyDialog
            open={isSendDialogOpen}
            onClose={() => setIsSendDialogOpen(false)}
            onSendSurvey={(contactIds) => handleSendSurvey(selectedSurvey.id, contactIds)}
            survey={selectedSurvey}
            contacts={contacts}
          />

          <ViewResultsDialog
            open={isResultsDialogOpen}
            onClose={() => setIsResultsDialogOpen(false)}
            survey={selectedSurvey}
          />
        </>
      )}
    </div>
  );
}
