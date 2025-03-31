
import React from "react";

export function SubfolderLoadingState() {
  return (
    <div className="pl-4 py-1">
      <div className="flex items-center gap-2 text-muted-foreground">
        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-primary"></div>
        <span className="text-xs">Loading subfolders...</span>
      </div>
    </div>
  );
}
