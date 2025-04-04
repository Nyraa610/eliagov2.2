
import { useState, useEffect } from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { supabaseClient } from "@/services/base/supabaseClient";
import { Building } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface Company {
  id: string;
  name: string;
}

interface ClientSelectorProps {
  onChange?: (companyId: string) => void;
}

export function ClientSelector({ onChange }: ClientSelectorProps) {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        
        // For now, we're fetching all companies
        // In a real application, we would filter by the consultant's assigned companies
        const { data, error } = await supabaseClient
          .from('companies')
          .select('id, name')
          .order('name');
          
        if (error) throw error;
        
        setCompanies(data || []);
        
        // Select the first company by default if there are any
        if (data && data.length > 0 && !selectedCompany) {
          setSelectedCompany(data[0].id);
          onChange?.(data[0].id);
        }
      } catch (error) {
        console.error("Error fetching companies:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load client companies",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchCompanies();
  }, [toast, onChange]);

  const handleCompanyChange = (companyId: string) => {
    setSelectedCompany(companyId);
    onChange?.(companyId);
  };

  if (companies.length === 0 && !loading) {
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
        value={selectedCompany || undefined} 
        onValueChange={handleCompanyChange}
        disabled={loading || companies.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a client company" />
        </SelectTrigger>
        <SelectContent>
          {companies.map((company) => (
            <SelectItem key={company.id} value={company.id}>
              {company.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
