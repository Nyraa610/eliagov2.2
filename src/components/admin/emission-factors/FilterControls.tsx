
import React from "react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal } from "lucide-react";

interface FilterControlsProps {
  categoryFilter: string | null;
  categories: string[];
  searchTerm: string;
  handleCategoryChange: (value: string) => void;
  handleClearFilters: () => void;
}

export const FilterControls: React.FC<FilterControlsProps> = ({
  categoryFilter,
  categories,
  searchTerm,
  handleCategoryChange,
  handleClearFilters,
}) => {
  return (
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
  );
};
