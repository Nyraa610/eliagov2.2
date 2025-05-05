
import React, { createContext, useContext, useState, useEffect } from "react";
import { supabaseClient } from "@/services/base/supabaseClient";
import { useToast } from "@/hooks/use-toast";

interface ClientCompany {
  id: string;
  name: string;
  logo_url?: string | null;
  industry?: string | null;
}

interface ClientContextType {
  selectedClientId: string | null;
  selectedClientName: string | null;
  clientCompanies: ClientCompany[];
  isLoading: boolean;
  setSelectedClientId: (id: string) => void;
}

const ClientContext = createContext<ClientContextType | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string | null>(null);
  const [clientCompanies, setClientCompanies] = useState<ClientCompany[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Load client companies
  useEffect(() => {
    const fetchClientCompanies = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabaseClient
          .from('companies')
          .select('id, name, logo_url, industry')
          .order('name');
          
        if (error) throw error;
        
        setClientCompanies(data || []);
        
        // Select the first company by default if there are any
        if (data && data.length > 0 && !selectedClientId) {
          setSelectedClientId(data[0].id);
          setSelectedClientName(data[0].name);
        }
      } catch (error) {
        console.error("Error fetching client companies:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load client companies",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClientCompanies();
  }, [toast]);
  
  // Update selected client name when ID changes
  useEffect(() => {
    if (!selectedClientId) return;
    
    const selectedCompany = clientCompanies.find(company => company.id === selectedClientId);
    if (selectedCompany) {
      setSelectedClientName(selectedCompany.name);
    }
  }, [selectedClientId, clientCompanies]);

  return (
    <ClientContext.Provider
      value={{
        selectedClientId,
        selectedClientName,
        clientCompanies,
        isLoading,
        setSelectedClientId,
      }}
    >
      {children}
    </ClientContext.Provider>
  );
}

export function useClientContext() {
  const context = useContext(ClientContext);
  if (context === undefined) {
    throw new Error("useClientContext must be used within a ClientProvider");
  }
  return context;
}
