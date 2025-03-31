
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from "lucide-react";

// Helper function to format activity type for display
const formatActivityType = (type: string) => {
  return type.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ');
};

interface Activity {
  id: string;
  activity_type: string;
  points_earned: number;
  created_at: string;
  metadata?: Record<string, any>;
}

interface ActivityHistoryTableProps {
  activities: Activity[];
  loading: boolean;
  totalPages?: number;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export function ActivityHistoryTable({ 
  activities, 
  loading, 
  totalPages = 1,
  currentPage,
  onPageChange
}: ActivityHistoryTableProps) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground">No activities yet.</p>
        <p className="text-sm text-muted-foreground mt-2">
          Your activities will appear here as you use the platform.
        </p>
      </div>
    );
  }

  // Generate array for pagination
  const paginationItems = [];
  for (let i = 1; i <= totalPages; i++) {
    paginationItems.push(i);
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Activity</TableHead>
            <TableHead>Points</TableHead>
            <TableHead>Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell className="font-medium">{formatActivityType(activity.activity_type)}</TableCell>
              <TableCell>+{activity.points_earned}</TableCell>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => onPageChange(Math.max(1, currentPage - 1))} 
                className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            
            {paginationItems.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink 
                  isActive={currentPage === page} 
                  onClick={() => onPageChange(page)}
                  className="cursor-pointer"
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            
            <PaginationItem>
              <PaginationNext 
                onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))} 
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
