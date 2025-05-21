
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Loader2, Send, AlertCircle, FileCheck, Database, ExternalLink, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { assessmentService } from "@/services/assessment";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

interface NotionPage {
  id: string;
  title: string;
  lastEdited: string;
}

export default function ActionPlanExport() {
  const navigate = useNavigate();
  const { company } = useCompanyProfile();
  const { user, isAuthenticated } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedPage, setSelectedPage] = useState<string>("");
  const [pages, setPages] = useState<NotionPage[]>([]);
  const [actionPlanData, setActionPlanData] = useState<any>(null);
  const [exportedNotionUrl, setExportedNotionUrl] = useState<string | null>(null);
  
  useEffect(() => {
    const checkConnection = async () => {
      try {
        // If not authenticated or no company, just set loading to false
        if (!isAuthenticated || !user || !company) {
          setIsLoading(false);
          return;
        }
        
        // Check if connected to Notion
        const { data: integration, error: integrationError } = await supabase
          .from('company_integrations')
          .select('*')
          .eq('company_id', company.id)
          .eq('integration_type', 'notion')
          .single();
        
        setIsConnected(integration ? true : false);
        
        if (integration) {
          // Get action plan data
          const data = await assessmentService.getDocumentTemplate('action_plan');
          setActionPlanData(data);
          
          // Get list of Notion pages
          try {
            const { data: { session } } = await supabase.auth.getSession();
            
            const response = await fetch('/api/functions/v1/notion-integration', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.access_token}`,
              },
              body: JSON.stringify({
                action: 'listPages',
                companyId: company.id
              }),
            });
            
            const result = await response.json();
            
            if (!response.ok) {
              console.error("Error fetching Notion pages:", result);
              toast.error("Couldn't fetch your Notion pages");
              setPages([]);
            } else {
              setPages(result.pages || []);
            }
          } catch (err) {
            console.error("Error listing Notion pages:", err);
            setPages([]);
          }
        }
      } catch (error) {
        console.error("Error initializing:", error);
        toast.error("Failed to initialize export");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, [isAuthenticated, user, company]);
  
  const handleSendToNotion = async () => {
    if (!selectedPage || !actionPlanData) {
      toast.error("Please select a destination page");
      return;
    }
    
    if (!isAuthenticated || !user || !company) {
      toast.error("You must be logged in to export to Notion");
      return;
    }
    
    setIsSending(true);
    setExportedNotionUrl(null);
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Call the Notion API to create a new page
      const toastId = toast.loading("Exporting to Notion...");
      
      const response = await fetch('/api/functions/v1/notion-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify({
          action: 'createPage',
          companyId: company.id,
          pageId: selectedPage,
          title: `${company.name} - ESG Action Plan`,
          content: actionPlanData
        }),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        console.error("Error exporting to Notion:", result);
        toast.error("Failed to export action plan to Notion", { id: toastId });
        return;
      }
      
      toast.success("Action plan successfully exported to Notion", { id: toastId });
      
      // Record the export in the deliverables
      const pageTitle = pages.find(p => p.id === selectedPage)?.title || "Unknown Page";
      const timestamp = new Date().toISOString();
      
      // Store export history in localStorage for demo since we don't have a proper deliverables table yet
      const history = JSON.parse(localStorage.getItem('notion_exports') || '[]');
      history.push({
        id: Date.now().toString(),
        type: 'action_plan',
        destination: `Notion: ${pageTitle}`,
        timestamp,
        status: 'completed',
        notion_url: result.url
      });
      localStorage.setItem('notion_exports', JSON.stringify(history));
      
      setExportedNotionUrl(result.url);
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
  
  // Display authentication required message
  if (!isAuthenticated || !user) {
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
              Authentication required. Please sign in to access this feature.
            </div>
          </div>
          
          <Button onClick={() => navigate('/login')} className="w-full">
            Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }
  
  if (!company) {
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
              You need to be associated with a company to use this feature.
            </div>
          </div>
          
          <Button onClick={() => navigate('/profile')} className="w-full">
            Go to Profile
          </Button>
        </CardContent>
      </Card>
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

        {exportedNotionUrl && (
          <div className="p-4 border rounded bg-green-50">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <h3 className="font-medium text-green-700">Export Successful!</h3>
            </div>
            <p className="text-sm text-green-800 mb-3">
              Your action plan has been successfully exported to Notion.
            </p>
            <Button 
              variant="outline" 
              className="w-full flex items-center justify-center gap-2 bg-white"
              asChild
            >
              <a href={exportedNotionUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
                View in Notion
              </a>
            </Button>
          </div>
        )}
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notion-page">Select Destination Page</Label>
            <Select
              value={selectedPage} 
              onValueChange={setSelectedPage}
              disabled={isSending}
            >
              <SelectTrigger id="notion-page">
                <SelectValue placeholder="Choose a page" />
              </SelectTrigger>
              <SelectContent>
                {pages.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    No pages found. Make sure to share pages with your integration.
                  </div>
                ) : (
                  pages.map(page => (
                    <SelectItem key={page.id} value={page.id}>{page.title}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {pages.length === 0 && (
              <p className="text-xs text-amber-600 mt-1">
                No pages found. Make sure to share pages with your integration in Notion.
              </p>
            )}
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
              disabled={isSending}
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
