
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ExternalLink, Database, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export default function NotionIntegration() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [pages, setPages] = useState<any[]>([]);
  const { company } = useCompanyProfile();
  const { user, isAuthenticated } = useAuth();
  
  useEffect(() => {
    // If not authenticated, just set loading to false and return
    if (!isAuthenticated || !user || !company) {
      setIsLoading(false);
      return;
    }
    
    const checkConnection = async () => {
      try {
        console.log("Checking Notion connection for company:", company.id);
        const { data: integration, error } = await supabase
          .from('company_integrations')
          .select('*')
          .eq('company_id', company.id)
          .eq('integration_type', 'notion')
          .single();

        if (error) {
          console.log("No Notion integration found:", error);
          setIsConnected(false);
          setIsLoading(false);
          return;
        }
        
        // Test the connection with the saved API key
        setIsConnected(integration ? true : false);
        
        if (integration) {
          try {
            // Get the pages list if connected
            const { data: { session } } = await supabase.auth.getSession();
            
            if (!session) {
              console.error("No active session found");
              toast.error("Authentication error. Please try signing in again.");
              setIsLoading(false);
              return;
            }
            
            console.log("Fetching Notion pages list");
            const response = await fetch('/api/functions/v1/notion-integration', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
              },
              body: JSON.stringify({
                action: 'listPages',
                companyId: company.id
              }),
            });
            
            if (!response.ok) {
              let errorData;
              try {
                errorData = await response.json();
                console.error("Error fetching Notion pages:", errorData);
              } catch (err) {
                console.error("Could not parse error response:", err);
                errorData = { error: "Failed to process response" };
              }
              
              toast.error(errorData.error || "Couldn't fetch your Notion pages. Please check your API key.");
              setPages([]);
              setIsLoading(false);
              return;
            }
            
            const result = await response.json();
            console.log("Notion pages retrieved successfully");
            setPages(result.pages || []);
          } catch (err) {
            console.error("Error listing Notion pages:", err);
            toast.error("Failed to communicate with Notion API. Please check your connection.");
            setPages([]);
          }
        }
      } catch (error) {
        console.error("Failed to check Notion connection:", error);
        toast.error("Failed to verify Notion integration status");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, [isAuthenticated, user, company]);
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !user || !company) {
      toast.error("You must be logged in to connect Notion");
      return;
    }
    
    setIsConnecting(true);
    setConnectionError(null);
    
    try {
      // First test the connection with the API key
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Authentication error. Please try signing in again.");
        setIsConnecting(false);
        return;
      }
      
      // Validate API key format before sending to server
      // Accept both secret_ (internal integrations) and ntn_ (public integrations) formats
      if (!apiKey.startsWith('secret_') && !apiKey.startsWith('ntn_')) {
        setConnectionError("Invalid API key format. Notion API keys should start with 'secret_' for internal integrations or 'ntn_' for public integrations.");
        toast.error("Invalid API key format. Check your integration token.");
        setIsConnecting(false);
        return;
      }
      
      console.log('Testing Notion connection with provided API key');
      
      const testResponse = await fetch('/api/functions/v1/notion-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'testConnection',
          apiKey,
          companyId: company.id
        }),
      });
      
      let testResult;
      try {
        testResult = await testResponse.json();
        console.log("Notion test connection response:", testResult);
      } catch (error) {
        console.error("Error parsing test connection response:", error);
        setConnectionError("Failed to process server response. Please try again.");
        toast.error("Connection error. Please try again later.");
        setIsConnecting(false);
        return;
      }
      
      if (!testResponse.ok || !testResult.success) {
        console.error("Notion API test failed:", testResponse.status, testResult);
        
        // Extract error message from response or use a default
        const errorMessage = testResult.error || "Connection test failed. Please check your API key.";
        setConnectionError(errorMessage);
        toast.error(errorMessage);
        setIsConnecting(false);
        return;
      }
      
      // Store the API key in the database
      const { error } = await supabase
        .from('company_integrations')
        .upsert({
          company_id: company.id,
          integration_type: 'notion',
          api_key: apiKey,
          is_connected: true,
          updated_at: new Date().toISOString()
        }, { onConflict: 'company_id,integration_type' });
      
      if (error) {
        console.error("Error saving Notion API key:", error);
        toast.error("Failed to save your Notion API key");
        setIsConnecting(false);
        return;
      }
      
      toast.success("Successfully connected to Notion");
      setIsConnected(true);
      
      // Fetch the available pages
      const pagesResponse = await fetch('/api/functions/v1/notion-integration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          action: 'listPages',
          companyId: company.id
        }),
      });
      
      let pagesResult;
      try {
        pagesResult = await pagesResponse.json();
      } catch (error) {
        console.error("Error parsing pages response:", error);
        toast.warning("Connected to Notion, but couldn't process the pages response.");
        setIsConnecting(false);
        return;
      }
      
      if (!pagesResponse.ok) {
        console.error("Error fetching Notion pages:", pagesResponse.status, pagesResult);
        toast.warning(pagesResult.error || "Connected, but couldn't fetch pages. Make sure to share pages with your integration.");
      } else {
        setPages(pagesResult.pages || []);
        
        if (pagesResult.pages && pagesResult.pages.length === 0) {
          toast.info("No pages found. Remember to share pages with your integration in Notion.");
        }
      }
    } catch (error) {
      console.error("Error connecting to Notion:", error);
      toast.error("An error occurred while connecting to Notion");
      setConnectionError("An unexpected error occurred. Please try again later.");
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    if (!isAuthenticated || !user || !company) return;
    
    try {
      const { error } = await supabase
        .from('company_integrations')
        .delete()
        .eq('company_id', company.id)
        .eq('integration_type', 'notion');
      
      if (error) {
        console.error("Error disconnecting from Notion:", error);
        toast.error("Failed to disconnect from Notion");
        return;
      }
      
      toast.success("Successfully disconnected from Notion");
      setIsConnected(false);
      setPages([]);
      setApiKey("");
    } catch (error) {
      console.error("Error disconnecting from Notion:", error);
      toast.error("An error occurred while disconnecting from Notion");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Show authentication required message if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-1">
            <Database className="h-6 w-6" />
            <CardTitle>Notion Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your Notion account to export action plans and other ESG deliverables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded bg-amber-50 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="text-amber-600">
              Authentication required. Please sign in to access this feature.
            </span>
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
            <CardTitle>Notion Integration</CardTitle>
          </div>
          <CardDescription>
            Connect your Notion account to export action plans and other ESG deliverables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded bg-amber-50 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <span className="text-amber-600">
              You need to be associated with a company to use this feature.
            </span>
          </div>
          <Button onClick={() => navigate('/profile')} className="w-full">
            Go to Profile
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
          <CardTitle>Notion Integration</CardTitle>
        </div>
        <CardDescription>
          Connect your Notion account to export action plans and other ESG deliverables
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isConnected ? (
          <div className="space-y-6">
            <div className="flex items-center gap-2 p-3 border rounded bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-green-700">Connected to Notion</span>
            </div>
            
            {pages.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Available Pages</h3>
                <div className="space-y-2">
                  {pages.map(page => (
                    <div key={page.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{page.title}</p>
                        <p className="text-xs text-gray-500">
                          Last edited: {new Date(page.lastEdited).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 border rounded bg-blue-50">
                <p className="text-blue-700 text-sm">No pages found in your Notion workspace or you may need to share pages with the integration.</p>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <Button 
                variant="destructive" 
                onClick={handleDisconnect}
              >
                Disconnect
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/integrations/action-plan-export')}
              >
                Manage Exports
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key">Notion API Key</Label>
              <Input
                id="api-key"
                type="password"
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your Notion Integration Token"
                required
              />
              {connectionError && (
                <p className="text-sm text-red-500 mt-1">{connectionError}</p>
              )}
              <div className="text-xs text-gray-500 space-y-2">
                <p>
                  You'll need to create an integration in your Notion workspace to get an API key.
                </p>
                <ol className="list-decimal ml-4 space-y-1">
                  <li>Go to <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Notion Integrations</a></li>
                  <li>Click "New integration"</li>
                  <li>Give it a name (e.g., "Elia Go")</li>
                  <li>Select your workspace</li>
                  <li>Under "Capabilities" enable "Read content", "Update content", and "Insert content"</li>
                  <li>Save and copy your Integration Token (starts with "secret_" for internal integrations or "ntn_" for public integrations)</li>
                  <li>In your Notion workspace, share any pages you want to access with the integration</li>
                </ol>
              </div>
            </div>
            
            <Button type="submit" disabled={isConnecting} className="w-full">
              {isConnecting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>Connect to Notion</>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
