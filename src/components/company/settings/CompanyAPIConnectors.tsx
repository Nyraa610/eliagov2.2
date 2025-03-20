
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Database, Shield, Link } from "lucide-react";
import { Company } from "@/services/companyService";
import { useToast } from "@/hooks/use-toast";
import { HubspotConnector } from "./connectors/HubspotConnector";
import { APIKeyConnector } from "./connectors/APIKeyConnector";
import { APIDocumentation } from "./connectors/APIDocumentation";
import { Users, Calculator, ShoppingCart, MessageCircle } from "./icons/ConnectorIcons";
import { getConnectorName } from "./utils/connectorUtils";

interface CompanyAPIConnectorsProps {
  company: Company;
}

export function CompanyAPIConnectors({ company }: CompanyAPIConnectorsProps) {
  const { toast } = useToast();
  const [activeConnector, setActiveConnector] = useState("erp");
  const [connectorStatus, setConnectorStatus] = useState<Record<string, boolean>>({
    erp: false,
    crm: false,
    accounting: false,
    ecommerce: false,
  });

  const handleConnect = async (key: string) => {
    console.log("Connecting API for:", activeConnector, key);
    
    // Simulating API connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Update connector status
    setConnectorStatus(prev => ({
      ...prev,
      [activeConnector]: true,
    }));
    
    toast({
      title: "API Connected",
      description: `Successfully connected ${getConnectorName(activeConnector)} API`,
    });
  };
  
  const handleDisconnect = () => {
    setConnectorStatus(prev => ({
      ...prev,
      [activeConnector]: false,
    }));
    
    toast({
      title: "API Disconnected",
      description: `Successfully disconnected ${getConnectorName(activeConnector)} API`,
    });
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
                  <APIKeyConnector 
                    connectorName={getConnectorName(connector)}
                    connected={connectorStatus[connector]}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                  />
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
      
      <APIDocumentation />
    </div>
  );
}
