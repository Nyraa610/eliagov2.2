
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface TableHeaderProps {
  risksCount: number;
  opportunitiesCount: number;
}

export function TableHeader({ risksCount, opportunitiesCount }: TableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-1/2 text-center bg-red-50 text-red-800 border-r">
          Risks ({risksCount})
        </TableHead>
        <TableHead className="w-1/2 text-center bg-green-50 text-green-800">
          Opportunities ({opportunitiesCount})
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
