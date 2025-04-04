
import { useState, useEffect } from "react";
import { roleService } from "@/services/base/roleService";

export function useRoleCheck() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isConsultant, setIsConsultant] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkRoles = async () => {
      try {
        setIsLoading(true);
        const adminCheck = await roleService.hasRole('admin');
        setIsAdmin(adminCheck);
        
        const consultantCheck = await roleService.hasRole('consultant');
        setIsConsultant(consultantCheck);
      } catch (error) {
        console.error("Error checking user roles:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkRoles();
  }, []);
  
  return { isAdmin, isConsultant, isLoading };
}
