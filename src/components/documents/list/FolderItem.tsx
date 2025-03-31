
import React from "react";
import { DocumentFolder } from "@/services/document";
import { Button } from "@/components/ui/button";
import { Folder, Trash2, ChevronRight } from "lucide-react";

interface FolderItemProps {
  folder: DocumentFolder;
  onNavigate: (folder: DocumentFolder) => void;
  onDelete: (folder: DocumentFolder) => void;
}

export function FolderItem({ folder, onNavigate, onDelete }: FolderItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
      onClick={() => onNavigate(folder)}
    >
      <div className="flex items-center gap-3">
        <Folder className="h-6 w-6 text-amber-500" />
        <span className="font-medium">{folder.name}</span>
      </div>
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(folder);
          }}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </div>
  );
}
