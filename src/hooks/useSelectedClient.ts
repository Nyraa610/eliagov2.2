
import { useClientContext } from "@/contexts/ClientContext";
import { useEffect, useState } from "react";
import { supabaseClient } from "@/services/base/supabaseClient";
import { useToast } from "@/hooks/use-toast";
import { Company } from "@/services/company/types";

export function useSelectedClient() {
  const { selectedClientId, selectedClientName, setSelectedClientId } = useClientContext();
  const [clientData, setClientData] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!selectedClientId) return;

    const loadClientDetails = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabaseClient
          .from('companies')
          .select('*')
          .eq('id', selectedClientId)
          .single();
          
        if (error) throw error;
        
        setClientData(data as Company);
      } catch (error) {
        console.error("Error loading client details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load client details",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadClientDetails();
  }, [selectedClientId, toast]);

  return {
    clientId: selectedClientId,
    clientName: selectedClientName,
    clientData,
    isLoading,
    setClientId: setSelectedClientId,
  };
}
