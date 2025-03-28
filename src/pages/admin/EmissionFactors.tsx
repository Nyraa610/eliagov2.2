
import { AdminLayout } from "@/components/admin/AdminLayout";
import { EmissionFactorsImport } from "@/components/admin/EmissionFactorsImport";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Search } from "lucide-react";

interface EmissionFactor {
  id: string;
  code: string | null;
  name: string;
  category: string | null;
  subcategory: string | null;
  unit: string | null;
  emission_value: number | null;
  uncertainty_percent: number | null;
  source: string | null;
}

export default function EmissionFactors() {
  const [emissionFactors, setEmissionFactors] = useState<EmissionFactor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [count, setCount] = useState(0);
  const { toast } = useToast();

  const fetchEmissionFactors = async () => {
    setIsLoading(true);
    try {
      // First get the count of all emission factors
      const { count: totalCount, error: countError } = await supabase
        .from('emission_factors')
        .select('*', { count: 'exact', head: true });

      if (countError) {
        throw countError;
      }

      setCount(totalCount || 0);

      // Then fetch the first page of emission factors (limit to 100 for performance)
      let query = supabase
        .from('emission_factors')
        .select('*')
        .order('name', { ascending: true })
        .limit(100);

      // Apply search filter if there's a search term
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      setEmissionFactors(data || []);
    } catch (error) {
      console.error("Error fetching emission factors:", error);
      toast({
        variant: "destructive",
        title: "Failed to load emission factors",
        description: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch emission factors on initial load and when search term changes
  useEffect(() => {
    fetchEmissionFactors();
  }, [searchTerm]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Refresh data after import
  const handleRefresh = () => {
    fetchEmissionFactors();
  };

  return (
    <AdminLayout 
      title="Emission Factors" 
      description="Manage ADEME Base Carbone emission factors for carbon evaluations"
    >
      <div className="space-y-6">
        <EmissionFactorsImport />
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b flex flex-col md:flex-row justify-between gap-4 items-start md:items-center">
            <div>
              <h2 className="text-lg font-semibold">Emission Factors Database</h2>
              <p className="text-sm text-muted-foreground">
                Total factors: {count || 'Loading...'}
                {searchTerm && emissionFactors.length > 0 && ` (showing ${emissionFactors.length} results)`}
              </p>
            </div>
            
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-full md:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="w-full pl-9"
                />
              </div>
              <Button variant="outline" onClick={handleRefresh} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
              </Button>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Uncertainty</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="mt-2 block text-sm text-muted-foreground">Loading emission factors...</span>
                    </TableCell>
                  </TableRow>
                )}
                
                {!isLoading && emissionFactors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm 
                          ? "No emission factors found matching your search."
                          : "No emission factors in the database. Use the import tool to add emission factors."}
                      </p>
                    </TableCell>
                  </TableRow>
                )}
                
                {!isLoading && emissionFactors.map((factor) => (
                  <TableRow key={factor.id}>
                    <TableCell className="font-medium">{factor.name}</TableCell>
                    <TableCell>{factor.code || "—"}</TableCell>
                    <TableCell>{factor.category || "—"}</TableCell>
                    <TableCell>{factor.unit || "—"}</TableCell>
                    <TableCell className="text-right">
                      {factor.emission_value !== null 
                        ? factor.emission_value.toLocaleString(undefined, { maximumFractionDigits: 4 }) 
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {factor.uncertainty_percent !== null 
                        ? `${factor.uncertainty_percent}%` 
                        : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {!isLoading && emissionFactors.length > 0 && count > emissionFactors.length && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              {emissionFactors.length} of {count} emission factors shown. 
              Use search to narrow down results.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
