
import React from "react";
import { DocumentFolder } from "@/services/document";
import { FolderItem } from "./FolderItem";

interface SubfolderListProps {
  folders: DocumentFolder[];
  companyId: string;
  onSelectFolder: (folder: DocumentFolder) => void;
  currentFolder: DocumentFolder | null;
  level: number;
}

export function SubfolderList({
  folders,
  companyId,
  onSelectFolder,
  currentFolder,
  level
}: SubfolderListProps) {
  if (folders.length === 0) {
    return (
      <div className="pl-4 py-1">
        <span className="text-xs text-muted-foreground">No subfolders</span>
      </div>
    );
  }

  return (
    <div className="pl-4 space-y-0.5">
      {folders.map(folder => (
        <FolderItem
          key={folder.id}
          folder={folder}
          companyId={companyId}
          onSelectFolder={onSelectFolder}
          currentFolder={currentFolder}
          level={level + 1}
        />
      ))}
    </div>
  );
}
