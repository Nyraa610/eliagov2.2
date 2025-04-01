
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Loader2 } from "lucide-react";

export interface EmissionFactor {
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

interface EmissionFactorsTableProps {
  emissionFactors: EmissionFactor[];
  isLoading: boolean;
  searchTerm: string;
  categoryFilter: string | null;
  count: number;
}

export const EmissionFactorsTable: React.FC<EmissionFactorsTableProps> = ({
  emissionFactors,
  isLoading,
  searchTerm,
  categoryFilter,
  count,
}) => {
  return (
    <>
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
    </>
  );
};
