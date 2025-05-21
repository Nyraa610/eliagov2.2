
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ExternalLink, Database } from "lucide-react";
import { toast } from "sonner";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";

// Mock service until the real one is implemented
const notionService = {
  isConnected: async (userId: string): Promise<boolean> => {
    // Check local storage for demo purposes
    return localStorage.getItem(`notion_connected_${userId}`) === 'true';
  },
  connect: async (userId: string, apiKey: string): Promise<boolean> => {
    // In a real implementation, we would validate the API key with Notion
    // For now, we'll just simulate success if the key is not empty
    if (!apiKey) return false;
    
    // Store connection status in localStorage for demo
    localStorage.setItem(`notion_connected_${userId}`, 'true');
    localStorage.setItem(`notion_api_key_${userId}`, apiKey);
    return true;
  },
  disconnect: async (userId: string): Promise<boolean> => {
    localStorage.removeItem(`notion_connected_${userId}`);
    localStorage.removeItem(`notion_api_key_${userId}`);
    return true;
  },
  getPagesList: async (userId: string): Promise<any[]> => {
    // This would fetch pages from Notion API
    // Returning mock data for now
    return [
      { id: 'page1', title: 'ESG Action Plans', lastEdited: new Date().toISOString() },
      { id: 'page2', title: 'Sustainability Projects', lastEdited: new Date().toISOString() }
    ];
  }
};

export default function NotionIntegration() {
  const navigate = useNavigate();
  const [apiKey, setApiKey] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [pages, setPages] = useState<any[]>([]);
  const { company } = useCompanyProfile();
  
  useEffect(() => {
    const checkConnection = async () => {
      // For demo purposes, get the current user ID from localStorage
      const userId = localStorage.getItem('current_user_id');
      if (!userId) {
        setIsLoading(false);
        return;
      }
      
      try {
        const connected = await notionService.isConnected(userId);
        setIsConnected(connected);
        
        if (connected) {
          const pagesList = await notionService.getPagesList(userId);
          setPages(pagesList);
        }
      } catch (error) {
        console.error("Failed to check Notion connection:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkConnection();
  }, []);
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // For demo purposes, get the current user ID from localStorage
    const userId = localStorage.getItem('current_user_id');
    if (!userId) {
      toast.error("User not authenticated");
      return;
    }
    
    setIsConnecting(true);
    
    try {
      const success = await notionService.connect(userId, apiKey);
      
      if (success) {
        toast.success("Successfully connected to Notion");
        setIsConnected(true);
        const pagesList = await notionService.getPagesList(userId);
        setPages(pagesList);
      } else {
        toast.error("Failed to connect to Notion. Check your API key.");
      }
    } catch (error) {
      console.error("Error connecting to Notion:", error);
      toast.error("An error occurred while connecting to Notion");
    } finally {
      setIsConnecting(false);
    }
  };
  
  const handleDisconnect = async () => {
    // For demo purposes, get the current user ID from localStorage
    const userId = localStorage.getItem('current_user_id');
    if (!userId) return;
    
    try {
      const success = await notionService.disconnect(userId);
      
      if (success) {
        toast.success("Successfully disconnected from Notion");
        setIsConnected(false);
        setPages([]);
      } else {
        toast.error("Failed to disconnect from Notion");
      }
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
            <div className="flex items-center gap-2 p-2 border rounded bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <span className="text-green-700">Connected to Notion</span>
            </div>
            
            {pages.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Available Pages</h3>
                <div className="space-y-2">
                  {pages.map(page => (
                    <div key={page.id} className="flex items-center justify-between p-2 border rounded">
                      <div>
                        <p className="font-medium">{page.title}</p>
                        <p className="text-xs text-gray-500">
                          Last edited: {new Date(page.lastEdited).toLocaleDateString()}
                        </p>
                      </div>
                      <Button variant="outline" size="sm" className="gap-1" asChild>
                        <a href="#" target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                          <span>View</span>
                        </a>
                      </Button>
                    </div>
                  ))}
                </div>
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
                onClick={() => navigate('/action-plan-export')}
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
                placeholder="Enter your Notion API Key"
                required
              />
              <p className="text-xs text-gray-500">
                You'll need to create an integration in your Notion workspace to get an API key.
                <a 
                  href="https://www.notion.so/my-integrations" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline ml-1"
                >
                  Learn more
                </a>
              </p>
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
