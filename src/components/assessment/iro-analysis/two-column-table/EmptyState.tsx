
import { TableCell, TableRow } from "@/components/ui/table";

export function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="text-center py-8">
        <p className="text-muted-foreground">No items added yet. Click "Add Item" to start.</p>
      </TableCell>
    </TableRow>
  );
}
