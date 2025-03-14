
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface RegistryCompany {
  siret?: string;
  siren?: string;
  name?: string;
  address?: string;
  activityCode?: string;
  legalForm?: string;
  creationDate?: string;
  employeeCount?: string;
  status?: string;
}

interface FrenchRegistrySearchProps {
  onSelectCompany: (company: RegistryCompany) => void;
  isUpdating?: boolean;
}

export function FrenchRegistrySearch({ onSelectCompany, isUpdating = false }: FrenchRegistrySearchProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<RegistryCompany[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedCompany, setSelectedCompany] = useState<RegistryCompany | null>(null);
  const [apiErrorDetails, setApiErrorDetails] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchTerm.trim()) {
      setError("Please enter a company name to search");
      return;
    }
    
    setIsSearching(true);
    setError(null);
    setApiErrorDetails(null);
    setResults([]);
    
    try {
      console.log("Calling French company registry with:", searchTerm);
      
      const { data, error } = await supabase.functions.invoke("french-company-registry", {
        body: { companyName: searchTerm }
      });
      
      console.log("Response from registry:", data, error);
      
      if (error) {
        throw new Error(error.message || "Failed to search registry");
      }
      
      if (data.error) {
        // Handle API error returned in response body
        setError("Error from INSEE API");
        setApiErrorDetails(data.error);
        return;
      }
      
      if (data.data) {
        setResults([data.data]);
      } else {
        setResults([]);
        setError("No companies found. Try a different search term.");
      }
    } catch (err) {
      console.error("Registry search error:", err);
      setError(typeof err === 'object' && err !== null && 'message' in err 
        ? (err as Error).message 
        : "Failed to search the registry. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectCompany = (company: RegistryCompany) => {
    setSelectedCompany(company);
    onSelectCompany(company);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Enter company name to search in official registry"
          className="flex-1"
          disabled={isSearching || isUpdating}
        />
        <Button type="submit" disabled={isSearching || isUpdating}>
          {isSearching ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Search className="h-4 w-4 mr-2" />
          )}
          Search
        </Button>
      </form>

      {error && (
        <Alert variant="destructive" className="mt-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">{error}</AlertDescription>
          {apiErrorDetails && (
            <div className="mt-2 text-xs bg-destructive/10 p-2 rounded overflow-auto max-h-24">
              {apiErrorDetails}
            </div>
          )}
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-medium">Search Results</h3>
          {results.map((company, index) => (
            <Card key={index} className={`cursor-pointer transition ${selectedCompany?.siret === company.siret ? 'border-primary' : 'hover:border-muted-foreground'}`}
              onClick={() => handleSelectCompany(company)}>
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium">{company.name}</h4>
                    <p className="text-sm text-muted-foreground">{company.address}</p>
                    <div className="flex gap-2 mt-1">
                      <Badge variant="outline" className="text-xs">SIREN: {company.siren}</Badge>
                      <Badge variant="outline" className="text-xs">SIRET: {company.siret}</Badge>
                    </div>
                    <p className="text-xs mt-1 text-muted-foreground">
                      {company.legalForm} • Activity Code: {company.activityCode}
                    </p>
                    {company.status && (
                      <Badge className={`mt-1 ${company.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {company.status}
                      </Badge>
                    )}
                  </div>
                  {selectedCompany?.siret === company.siret ? (
                    isUpdating ? (
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    ) : (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    )
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
