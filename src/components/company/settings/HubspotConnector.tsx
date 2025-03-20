
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { useHubspotIntegration } from "@/hooks/useHubspotIntegration";
import { HubspotIntegration } from "@/services/integrations/types";

const hubspotSchema = z.object({
  accessToken: z.string().min(1, "API token is required"),
  refreshToken: z.string().min(1, "Refresh token is required"),
});

interface HubspotConnectorProps {
  companyId: string;
}

export function HubspotConnector({ companyId }: HubspotConnectorProps) {
  const { integration, connectHubspot, syncContacts, syncing } = useHubspotIntegration(companyId);
  const [isConnecting, setIsConnecting] = useState(false);

  const hubspotForm = useForm<z.infer<typeof hubspotSchema>>({
    resolver: zodResolver(hubspotSchema),
    defaultValues: {
      accessToken: "",
      refreshToken: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof hubspotSchema>) => {
    setIsConnecting(true);
    try {
      // Set token expiration to 6 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      
      await connectHubspot(values.accessToken, values.refreshToken, expiresAt);
      hubspotForm.reset();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>HubSpot CRM Connection</CardTitle>
        <CardDescription>
          Connect your HubSpot CRM to analyze sustainability discussions with your contacts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {integration ? (
          <>
            <Alert className="bg-green-50 border-green-200 mb-4">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Connected</AlertTitle>
              <AlertDescription className="text-green-700">
                Your HubSpot account is connected successfully.
              </AlertDescription>
            </Alert>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => syncContacts()}
                disabled={syncing}
              >
                {syncing ? (
                  <RefreshCw className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                {syncing ? "Syncing Contacts..." : "Sync Contacts"}
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-2"
                onClick={() => {
                  // Disconnect would reset the integration
                  // For demo purposes, we're not implementing this
                }}
              >
                Disconnect HubSpot
              </Button>
            </div>
          </>
        ) : (
          <>
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Not Connected</AlertTitle>
              <AlertDescription>
                Connect your HubSpot account to enable sales opportunities analysis
              </AlertDescription>
            </Alert>
            
            <Form {...hubspotForm}>
              <form onSubmit={hubspotForm.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={hubspotForm.control}
                  name="accessToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Token</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your HubSpot API token" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the API token from your HubSpot developer account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={hubspotForm.control}
                  name="refreshToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Refresh Token</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Enter your HubSpot refresh token" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the refresh token from your HubSpot developer account
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isConnecting}>
                  {isConnecting ? "Connecting..." : "Connect HubSpot"}
                </Button>
              </form>
            </Form>
          </>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground border-t p-4">
        <div>
          Learn how to <a href="https://developers.hubspot.com/docs/api/overview" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">get HubSpot API credentials</a>
        </div>
      </CardFooter>
    </Card>
  );
}
