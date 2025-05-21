import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Send, AlertCircle, FileCheck, Database } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { assessmentService } from "@/services/assessment";

export default function ActionPlanExport() {
  const navigate = useNavigate();
  const { company } = useCompanyProfile();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [pages, setPages] = useState<any[]>([]);
  const [actionPlanData, setActionPlanData] = useState<any>(null);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // Check if connected to Notion (using localStorage for demo)
        const userId = localStorage.getItem('current_user_id');
        const connected = userId ? localStorage.getItem(`notion_connected_${userId}`) === 'true' : false;
        setIsConnected(connected);
        
        if (connected && userId) {
          // Mock fetching pages from Notion
          const pagesList = [
            { id: 'page1', title: 'ESG Action Plans', lastEdited: new Date().toISOString() },
            { id: 'page2', title: 'Sustainability Projects', lastEdited: new Date().toISOString() }
          ];
          setPages(pagesList);
          
          // Get action plan data
          const data = await assessmentService.getDocumentTemplate('action_plan');
          setActionPlanData(data);
        }
      } catch (error) {
        console.error("Error initializing:", error);
        toast.error("Failed to initialize export");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);
  
  const handleSendToNotion = async () => {
    if (!selectedPage || !actionPlanData) {
      toast.error("Please select a destination page");
      return;
    }
    
    setIsSending(true);
    
    try {
      // In a real implementation, this would call a service to export the data to Notion
      // For now we'll simulate success after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Record the export in a mock deliverables service
      const pageTitle = pages.find(p => p.id === selectedPage)?.title || "Unknown Page";
      const timestamp = new Date().toISOString();
      
      // Store export history in localStorage for demo
      const history = JSON.parse(localStorage.getItem('notion_exports') || '[]');
      history.push({
        id: Date.now().toString(),
        type: 'action_plan',
        destination: `Notion: ${pageTitle}`,
        timestamp,
        status: 'completed'
      });
      localStorage.setItem('notion_exports', JSON.stringify(history));
      
      toast.success("Action plan successfully exported to Notion");
      navigate('/deliverables');
    } catch (error) {
      console.error("Error exporting to Notion:", error);
      toast.error("Failed to export action plan to Notion");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isConnected) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-6 w-6" />
            <CardTitle>Export to Notion</CardTitle>
          </div>
          <CardDescription>
            Send your action plan to a Notion page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-amber-800">
              You need to connect your Notion account before exporting.
            </div>
          </div>
          
          <Button onClick={() => navigate('/integrations/notion')} className="w-full">
            Connect Notion Account
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!actionPlanData) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-6 w-6" />
            <CardTitle>Export to Notion</CardTitle>
          </div>
          <CardDescription>
            Send your action plan to a Notion page
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-4 border rounded bg-amber-50">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
            <div className="text-amber-800">
              No action plan data available. Please complete your action plan first.
            </div>
          </div>
          
          <Button onClick={() => navigate('/assessment/action-plan')} className="w-full">
            Go to Action Plan
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Database className="h-6 w-6" />
          <CardTitle>Export to Notion</CardTitle>
        </div>
        <CardDescription>
          Send your action plan to a Notion page
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 border rounded bg-blue-50">
          <h3 className="font-medium text-blue-700 mb-2">Action Plan Summary</h3>
          <div className="space-y-2">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Company:</span> {company?.name || 'Unknown Company'}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Date:</span> {new Date().toLocaleDateString()}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Goals:</span> {actionPlanData.shortTermGoals ? 'Defined' : 'Not defined'}
            </p>
            <p className="text-sm text-blue-800">
              <span className="font-medium">Initiatives:</span> {actionPlanData.keyInitiatives ? 'Defined' : 'Not defined'}
            </p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notion-page">Select Destination Page</Label>
            <Select
              value={selectedPage} 
              onValueChange={setSelectedPage}
            >
              <SelectTrigger id="notion-page">
                <SelectValue placeholder="Choose a page" />
              </SelectTrigger>
              <SelectContent>
                {pages.map(page => (
                  <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-col gap-4">
            <Button 
              onClick={handleSendToNotion} 
              disabled={isSending || !selectedPage}
              className="gap-2"
            >
              {isSending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Exporting...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Export to Notion
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={() => navigate('/assessment/action-plan-results')}
              className="gap-2"
            >
              <FileCheck className="h-4 w-4" />
              Back to Action Plan
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
