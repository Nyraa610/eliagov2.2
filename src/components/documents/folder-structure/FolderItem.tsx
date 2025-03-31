
import React, { useState, useEffect } from "react";
import { DocumentFolder, documentService } from "@/services/document";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { SubfolderList } from "./SubfolderList";
import { SubfolderLoadingState } from "./SubfolderLoadingState";

interface FolderItemProps {
  folder: DocumentFolder;
  companyId: string;
  expanded?: boolean;
  toggleExpand?: () => void;
  onSelectFolder: (folder: DocumentFolder) => void;
  currentFolder: DocumentFolder | null;
  level: number;
}

export function FolderItem({
  folder,
  companyId,
  expanded = false,
  toggleExpand,
  onSelectFolder,
  currentFolder,
  level = 0
}: FolderItemProps) {
  const [subfolders, setSubfolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(expanded);
  const [hasLoadedSubfolders, setHasLoadedSubfolders] = useState(false);
  
  const isSelected = currentFolder?.id === folder.id;
  
  // Allow control from parent if provided
  useEffect(() => {
    if (typeof expanded !== 'undefined') {
      setIsExpanded(expanded);
    }
  }, [expanded]);
  
  const handleToggleExpand = () => {
    const newExpandedState = !isExpanded;
    setIsExpanded(newExpandedState);
    
    // Propagate to parent if callback provided
    if (toggleExpand) {
      toggleExpand();
    }
    
    // Load subfolders if expanding and not yet loaded
    if (newExpandedState && !hasLoadedSubfolders) {
      loadSubfolders();
    }
  };
  
  const loadSubfolders = async () => {
    try {
      setLoading(true);
      const data = await documentService.getFolders(companyId, folder.id);
      setSubfolders(data);
      setHasLoadedSubfolders(true);
    } catch (error) {
      console.error("Error loading subfolders:", error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleFolderClick = () => {
    onSelectFolder(folder);
  };
  
  return (
    <div className="w-full">
      <div className="flex items-center">
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-6 h-6 p-0 mr-1"
          onClick={handleToggleExpand}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          className={cn(
            "w-full justify-start text-left h-7 py-1 px-2",
            isSelected && "bg-muted"
          )} 
          onClick={handleFolderClick}
        >
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          <span className="truncate">{folder.name}</span>
        </Button>
      </div>
      
      {isExpanded && (
        <>
          {loading ? (
            <SubfolderLoadingState />
          ) : (
            <SubfolderList
              folders={subfolders}
              companyId={companyId}
              onSelectFolder={onSelectFolder}
              currentFolder={currentFolder}
              level={level}
            />
          )}
        </>
      )}
    </div>
  );
}
