
import React from "react";
import { DocumentFolder } from "@/services/document";
import { FolderItem } from "./FolderItem";

interface FoldersListProps {
  folders: DocumentFolder[];
  onNavigateToFolder: (folder: DocumentFolder) => void;
  onDeleteFolder: (folder: DocumentFolder) => void;
}

export function FoldersList({ 
  folders,
  onNavigateToFolder,
  onDeleteFolder
}: FoldersListProps) {
  if (folders.length === 0) return null;
  
  return (
    <div className="mb-6">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Folders</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {folders.map(folder => (
          <FolderItem 
            key={folder.id} 
            folder={folder}
            onNavigate={onNavigateToFolder}
            onDelete={onDeleteFolder}
          />
        ))}
      </div>
    </div>
  );
}
