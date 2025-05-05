
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useClientContext } from "@/contexts/ClientContext";

interface ClientSelectorProps {
  onChange?: (companyId: string) => void;
}

export function ClientSelector({ onChange }: ClientSelectorProps) {
  const { selectedClientId, clientCompanies, isLoading, setSelectedClientId } = useClientContext();
  const { toast } = useToast();

  const handleCompanyChange = (companyId: string) => {
    setSelectedClientId(companyId);
    onChange?.(companyId);
  };

  if (clientCompanies.length === 0 && !isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4 text-center">
          <p className="text-muted-foreground">No client companies available</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Building className="h-4 w-4 text-primary" />
        <span className="text-sm font-medium">Select Client</span>
      </div>
      <Select 
        value={selectedClientId || undefined} 
        onValueChange={handleCompanyChange}
        disabled={isLoading || clientCompanies.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client company" />
        </SelectTrigger>
        <SelectContent>
          {clientCompanies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
