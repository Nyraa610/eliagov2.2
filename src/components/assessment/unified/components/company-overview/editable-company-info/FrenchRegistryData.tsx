
import React from "react";
import { FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface FrenchRegistryDataProps {
  registryStatus?: string;
  siren?: string;
  siret?: string;
  legalForm?: string;
  activityCode?: string;
}

export function FrenchRegistryData({
  registryStatus,
  siren,
  siret,
  legalForm,
  activityCode,
}: FrenchRegistryDataProps) {
  const hasFrenchRegistryData = !!(siren || siret);
  
  if (!hasFrenchRegistryData) {
    return null;
  }
  
  return (
    <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-lg flex items-center gap-2">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Official French Registry Data
        </h3>
        {registryStatus && (
          <Badge variant="outline" 
            className={registryStatus === "Active" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 border-green-300" : ""}>
            {registryStatus}
          </Badge>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {siren && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">SIREN:</span>
            <span className="text-sm">{siren}</span>
          </div>
        )}
        
        {siret && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">SIRET:</span>
            <span className="text-sm">{siret}</span>
          </div>
        )}
        
        {legalForm && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Legal Form:</span>
            <span className="text-sm">{legalForm}</span>
          </div>
        )}
        
        {activityCode && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Activity Code:</span>
            <span className="text-sm">{activityCode}</span>
          </div>
        )}
      </div>
    </div>
  );
}
