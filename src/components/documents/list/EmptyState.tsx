
import React from "react";
import { FileIcon } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12 border-2 border-dashed rounded-lg">
      <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
      <h3 className="text-lg font-medium mb-1">No documents or folders</h3>
      <p className="text-muted-foreground">
        Upload documents or create folders to get started
      </p>
    </div>
  );
}
