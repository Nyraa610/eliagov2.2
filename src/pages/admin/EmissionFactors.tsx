
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
import { 
  Loader2, 
  Search, 
  Filter, 
  SlidersHorizontal 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

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
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const { toast } = useToast();

  // Fetch all distinct categories for the filter
  const fetchCategories = async () => {
    try {
      // Fix: Use distinct on the column directly instead of calling distinct() on the query
      const { data, error } = await supabase
        .from('emission_factors')
        .select('category')
        .not('category', 'is', null)
        .order('category');
        
      if (error) {
        throw error;
      }
      
      // Extract unique categories from the result
      const uniqueCategories = Array.from(
        new Set(
          data
            .map(item => item.category)
            .filter((category): category is string => category !== null)
        )
      ).sort();
        
      setCategories(uniqueCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEmissionFactors = async () => {
    setIsLoading(true);
    try {
      // First get the count of all emission factors with filters applied
      let countQuery = supabase
        .from('emission_factors')
        .select('*', { count: 'exact', head: true });
        
      if (searchTerm) {
        countQuery = countQuery.ilike('name', `%${searchTerm}%`);
      }
      
      if (categoryFilter) {
        countQuery = countQuery.eq('category', categoryFilter);
      }
      
      const { count: totalCount, error: countError } = await countQuery;

      if (countError) {
        throw countError;
      }

      setCount(totalCount || 0);

      // Then fetch the first page of emission factors with filters applied
      let query = supabase
        .from('emission_factors')
        .select('*')
        .order('name', { ascending: true })
        .limit(100);

      // Apply search filter
      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }
      
      // Apply category filter
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
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

  // Fetch emission factors and categories on initial load
  useEffect(() => {
    fetchCategories();
  }, []);
  
  // Fetch emission factors when search term or category filter changes
  useEffect(() => {
    fetchEmissionFactors();
  }, [searchTerm, categoryFilter]);

  // Handle search input
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  // Handle category filter change
  const handleCategoryChange = (value: string) => {
    setCategoryFilter(value === "all" ? null : value);
  };

  // Refresh data
  const handleRefresh = () => {
    fetchEmissionFactors();
    fetchCategories();
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setCategoryFilter(null);
  };

  return (
    <AdminLayout 
      title="Emission Factors" 
      description="Manage ADEME Base Carbone emission factors for carbon evaluations"
    >
      <div className="space-y-6">
        <EmissionFactorsImport />
        
        <div className="bg-white rounded-lg shadow">
          <div className="p-4 border-b">
            <div className="flex flex-col md:flex-row justify-between gap-4 items-start md:items-center mb-4">
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
            
            <div className="flex flex-col md:flex-row gap-2 items-start md:items-center">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filters:</span>
              </div>
              
              <div className="flex flex-wrap gap-2 items-center">
                <Select value={categoryFilter || "all"} onValueChange={handleCategoryChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                {(searchTerm || categoryFilter) && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleClearFilters}
                    className="text-xs h-8"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
              
              {categoryFilter && (
                <Badge variant="outline" className="ml-2">
                  Category: {categoryFilter}
                </Badge>
              )}
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40%]">Name</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Subcategory</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead className="text-right">Uncertainty</TableHead>
                  <TableHead>Source</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                      <span className="mt-2 block text-sm text-muted-foreground">Loading emission factors...</span>
                    </TableCell>
                  </TableRow>
                )}
                
                {!isLoading && emissionFactors.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <p className="text-muted-foreground">
                        {searchTerm || categoryFilter
                          ? "No emission factors found matching your criteria."
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
                    <TableCell>{factor.subcategory || "—"}</TableCell>
                    <TableCell>{factor.unit || "—"}</TableCell>
                    <TableCell className="text-right">
                      {factor.emission_value !== null 
                        ? factor.emission_value.toLocaleString(undefined, { maximumFractionDigits: 6 }) 
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {factor.uncertainty_percent !== null 
                        ? `${factor.uncertainty_percent}%` 
                        : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {factor.source || "ADEME"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {!isLoading && emissionFactors.length > 0 && count > emissionFactors.length && (
            <div className="p-4 text-center text-sm text-muted-foreground border-t">
              {emissionFactors.length} of {count} emission factors shown. 
              Use search or filters to narrow down results.
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
