
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useHubspotIntegration } from "@/hooks/useHubspotIntegration";
import { HubspotConnectedState } from "./HubspotConnectedState";
import { HubspotConnectionForm, HubspotFormValues } from "./HubspotConnectionForm";

interface HubspotConnectorProps {
  companyId: string;
}

export function HubspotConnector({ companyId }: HubspotConnectorProps) {
  const { integration, connectHubspot, syncContacts, syncing } = useHubspotIntegration(companyId);
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (values: HubspotFormValues) => {
    setIsConnecting(true);
    try {
      // Set token expiration to 6 hours from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 6);
      
      await connectHubspot(values.accessToken, values.refreshToken, expiresAt);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    // Disconnect would reset the integration
    // For demo purposes, we're not implementing this
    console.log("Disconnect HubSpot requested");
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
          <HubspotConnectedState 
            onSync={syncContacts}
            onDisconnect={handleDisconnect}
            syncing={syncing}
          />
        ) : (
          <HubspotConnectionForm 
            onSubmit={handleConnect}
            isConnecting={isConnecting}
          />
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
