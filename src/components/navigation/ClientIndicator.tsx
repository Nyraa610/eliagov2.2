
import { useClientContext } from "@/contexts/ClientContext";
import { Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { roleService } from "@/services/base/roleService";
import { useEffect, useState } from "react";

export function ClientIndicator() {
  const { selectedClientName, isLoading } = useClientContext();
  const [isConsultant, setIsConsultant] = useState(false);
  
  // Check if the user is a consultant
  useEffect(() => {
    const checkConsultantRole = async () => {
      try {
        const hasRole = await roleService.hasRole('consultant');
        setIsConsultant(hasRole);
      } catch (error) {
        console.error("Error checking consultant role:", error);
      }
    };
    
    checkConsultantRole();
  }, []);
  
  // Only show for consultants and when a client is selected
  if (!isConsultant || !selectedClientName) {
    return null;
  }
  
  return (
    <Badge variant="outline" className="ml-2">
      <Building className="h-3 w-3 mr-1" />
      <span className="text-xs">Client: {selectedClientName}</span>
    </Badge>
  );
}
