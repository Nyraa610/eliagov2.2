
import { useClientContext } from "@/contexts/ClientContext";
import { Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { roleService } from "@/services/base/roleService";
import { useEffect, useState } from "react";

export function ClientIndicator() {
  // Wrap in try/catch to handle the case where this component
  // is rendered outside of a ClientProvider
  try {
    const { selectedClientName, isLoading } = useClientContext();
    
    // Only show when a client is selected
    if (!selectedClientName) {
      return null;
    }
    
    return (
      <Badge variant="outline" className="ml-2">
        <Building className="h-3 w-3 mr-1" />
        <span className="text-xs">Client: {selectedClientName}</span>
      </Badge>
    );
  } catch (error) {
    // If there's an error (like when the component is outside the ClientProvider),
    // just don't render anything
    console.log("ClientIndicator: No ClientProvider found");
    return null;
  }
}
