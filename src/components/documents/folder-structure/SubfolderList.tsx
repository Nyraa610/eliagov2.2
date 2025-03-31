
import React from "react";
import { DocumentFolder } from "@/services/document";
import { FolderItem } from "./FolderItem";

interface SubfolderListProps {
  subfolders: DocumentFolder[];
  companyId: string;
  onSelectFolder: (folder: DocumentFolder | null) => void;
  currentFolder: DocumentFolder | null;
  level: number;
}

export function SubfolderList({
  subfolders,
  companyId,
  onSelectFolder,
  currentFolder,
  level
}: SubfolderListProps) {
  return (
    <>
      {subfolders.map(subfolder => (
        <FolderItem
          key={subfolder.id}
          folder={subfolder}
          companyId={companyId}
          expanded={false}
          toggleExpand={() => {}}
          onSelectFolder={onSelectFolder}
          currentFolder={currentFolder}
          level={level}
        />
      ))}
    </>
  );
}
