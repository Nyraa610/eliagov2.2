
import React from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { CheckCircle2, RefreshCw } from "lucide-react";

interface HubspotConnectedStateProps {
  onSync: () => void;
  onDisconnect: () => void;
  syncing: boolean;
}

export function HubspotConnectedState({ onSync, onDisconnect, syncing }: HubspotConnectedStateProps) {
  return (
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
          onClick={onSync}
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
          onClick={onDisconnect}
        >
          Disconnect HubSpot
        </Button>
      </div>
    </>
  );
}
