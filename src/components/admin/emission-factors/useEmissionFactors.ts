
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { EmissionFactor } from "./EmissionFactorsTable";

export const useEmissionFactors = () => {
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

  return {
    emissionFactors,
    isLoading,
    searchTerm,
    count,
    categoryFilter,
    categories,
    handleSearch,
    handleCategoryChange,
    handleRefresh,
    handleClearFilters,
    setSearchTerm
  };
};
