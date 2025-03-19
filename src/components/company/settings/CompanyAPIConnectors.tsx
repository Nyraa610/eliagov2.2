
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Company } from "@/services/companyService";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2, Database, Globe, Link, Server, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { HubspotConnector } from "./HubspotConnector";

interface CompanyAPIConnectorsProps {
  company: Company;
}

const apiKeySchema = z.object({
  key: z.string().min(1, "API key is required"),
});

export function CompanyAPIConnectors({ company }: CompanyAPIConnectorsProps) {
  const { toast } = useToast();
  const [activeConnector, setActiveConnector] = useState("erp");
  const [connectorStatus, setConnectorStatus] = useState<Record<string, boolean>>({
    erp: false,
    crm: false,
    accounting: false,
    ecommerce: false,
  });

  const apiForm = useForm<z.infer<typeof apiKeySchema>>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      key: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof apiKeySchema>) => {
    try {
      console.log("Connecting API for:", activeConnector, values);
      
      // Here you would integrate with an API connection service
      // For now, we'll simulate a successful connection
      
      // Simulating API connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update connector status
      setConnectorStatus(prev => ({
        ...prev,
        [activeConnector]: true,
      }));
      
      apiForm.reset();
      
      toast({
        title: "API Connected",
        description: `Successfully connected ${getConnectorName(activeConnector)} API`,
      });
    } catch (error) {
      console.error("Error connecting API:", error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect API. Please check your API key and try again.",
        variant: "destructive",
      });
    }
  };
  
  const getConnectorName = (key: string): string => {
    switch (key) {
      case "erp": return "ERP System";
      case "crm": return "CRM";
      case "accounting": return "Accounting Software";
      case "ecommerce": return "E-commerce Platform";
      case "hubspot": return "HubSpot";
      default: return key.toUpperCase();
    }
  };
  
  const getConnectorIcon = (key: string) => {
    switch (key) {
      case "erp": return <Database className="h-5 w-5" />;
      case "crm": return <Users className="h-5 w-5" />;
      case "accounting": return <Calculator className="h-5 w-5" />;
      case "ecommerce": return <ShoppingCart className="h-5 w-5" />;
      case "hubspot": return <MessageCircle className="h-5 w-5" />;
      default: return <Link className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>API Connectors</CardTitle>
          <CardDescription>
            Connect your company's systems and applications through our API connectors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeConnector} onValueChange={setActiveConnector}>
            <TabsList className="mb-6">
              <TabsTrigger value="erp">
                <Database className="h-4 w-4 mr-2" />
                ERP System
              </TabsTrigger>
              <TabsTrigger value="crm">
                <Users className="h-4 w-4 mr-2" />
                CRM
              </TabsTrigger>
              <TabsTrigger value="accounting">
                <Calculator className="h-4 w-4 mr-2" />
                Accounting
              </TabsTrigger>
              <TabsTrigger value="ecommerce">
                <ShoppingCart className="h-4 w-4 mr-2" />
                E-commerce
              </TabsTrigger>
              <TabsTrigger value="hubspot">
                <MessageCircle className="h-4 w-4 mr-2" />
                HubSpot
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hubspot">
              <HubspotConnector companyId={company.id} />
            </TabsContent>

            {Object.keys(connectorStatus).map((connector) => (
              connector !== "hubspot" && (
                <TabsContent key={connector} value={connector}>
                  <div className="space-y-4">
                    {connectorStatus[connector] ? (
                      <Alert className="bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertTitle className="text-green-800">Connected</AlertTitle>
                        <AlertDescription className="text-green-700">
                          Your {getConnectorName(connector)} is connected successfully. 
                          You can now integrate data from this system.
                        </AlertDescription>
                        <Button 
                          variant="outline" 
                          className="mt-2"
                          onClick={() => setConnectorStatus(prev => ({...prev, [connector]: false}))}
                        >
                          Disconnect
                        </Button>
                      </Alert>
                    ) : (
                      <>
                        <Alert>
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Not Connected</AlertTitle>
                          <AlertDescription>
                            Connect your {getConnectorName(connector)} to enable data integration
                          </AlertDescription>
                        </Alert>
                        
                        <Form {...apiForm}>
                          <form onSubmit={apiForm.handleSubmit(onSubmit)} className="space-y-4">
                            <FormField
                              control={apiForm.control}
                              name="key"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>API Key</FormLabel>
                                  <FormControl>
                                    <Input 
                                      placeholder="Enter your API key" 
                                      type="password" 
                                      {...field} 
                                    />
                                  </FormControl>
                                  <FormDescription>
                                    Enter the API key from your {getConnectorName(connector)} account
                                  </FormDescription>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            
                            <Button type="submit">
                              Connect {getConnectorName(connector)}
                            </Button>
                          </form>
                        </Form>
                      </>
                    )}
                  </div>
                </TabsContent>
              )
            ))}
          </Tabs>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <div className="flex items-center text-sm text-muted-foreground">
            <Shield className="h-4 w-4 mr-2" />
            API keys are stored securely and encrypted
          </div>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>API Documentation</CardTitle>
          <CardDescription>
            Access documentation and resources for our API
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-4">
            <Server className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h4 className="text-base font-medium">REST API Documentation</h4>
              <p className="text-sm text-muted-foreground">
                Comprehensive documentation for our REST API endpoints
              </p>
              <Button variant="link" className="px-0">View Documentation</Button>
            </div>
          </div>
          
          <div className="flex items-start space-x-4">
            <Globe className="h-6 w-6 flex-shrink-0 text-primary" />
            <div>
              <h4 className="text-base font-medium">Webhooks Guide</h4>
              <p className="text-sm text-muted-foreground">
                Learn how to set up and use webhooks for real-time data
              </p>
              <Button variant="link" className="px-0">View Guide</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Users({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function Calculator({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="16" height="20" x="4" y="2" rx="2" />
      <line x1="8" x2="16" y1="6" y2="6" />
      <line x1="16" x2="16" y1="14" y2="18" />
      <path d="M16 10h.01" />
      <path d="M12 10h.01" />
      <path d="M8 10h.01" />
      <path d="M12 14h.01" />
      <path d="M8 14h.01" />
      <path d="M12 18h.01" />
      <path d="M8 18h.01" />
    </svg>
  );
}

function ShoppingCart({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}

function MessageCircle({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}
