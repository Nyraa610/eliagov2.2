
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Search } from "lucide-react";

interface EmissionFactorsHeaderProps {
  count: number;
  searchTerm: string;
  isLoading: boolean;
  handleSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRefresh: () => void;
  emissionFactors: any[];
}

export const EmissionFactorsHeader: React.FC<EmissionFactorsHeaderProps> = ({
  count,
  searchTerm,
  isLoading,
  handleSearch,
  handleRefresh,
  emissionFactors,
}) => {
  return (
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
  );
};
