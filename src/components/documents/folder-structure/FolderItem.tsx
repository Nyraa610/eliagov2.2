
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight, ChevronDown } from "lucide-react";
import { documentService, DocumentFolder } from "@/services/document";
import { cn } from "@/lib/utils";

interface FolderItemProps {
  folder: DocumentFolder;
  companyId: string;
  expanded: boolean;
  toggleExpand: () => void;
  onSelectFolder: (folder: DocumentFolder | null) => void;
  currentFolder: DocumentFolder | null;
  level: number;
}

export function FolderItem({
  folder,
  companyId,
  expanded,
  toggleExpand,
  onSelectFolder,
  currentFolder,
  level
}: FolderItemProps) {
  const [subfolders, setSubfolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSubfolders, setHasSubfolders] = useState(false);
  
  const loadSubfolders = async () => {
    if (!expanded) return;
    setLoading(true);
    const data = await documentService.getFolders(companyId, folder.id);
    setSubfolders(data);
    setLoading(false);
  };
  
  const checkForSubfolders = async () => {
    const data = await documentService.getFolders(companyId, folder.id);
    setHasSubfolders(data.length > 0);
  };
  
  useEffect(() => {
    checkForSubfolders();
  }, [folder.id, companyId]);
  
  useEffect(() => {
    if (expanded) {
      loadSubfolders();
    }
  }, [expanded, folder.id, companyId]);
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleExpand();
  };
  
  const handleSelect = () => {
    onSelectFolder(folder);
  };
  
  const isSelected = currentFolder?.id === folder.id;
  
  return (
    <div>
      <div 
        className={cn(
          "flex items-center group rounded-md hover:bg-muted transition-colors",
          isSelected && "bg-muted"
        )}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className={cn(
            "w-full justify-start pl-[calc(1rem*" + level + ")] text-left",
            isSelected && "bg-muted font-medium" 
          )}
          onClick={handleSelect}
        >
          {hasSubfolders ? (
            <span className="mr-1 text-muted-foreground" onClick={handleToggle}>
              {expanded ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </span>
          ) : (
            <span className="ml-4"></span>
          )}
          <Folder className="h-4 w-4 mr-2 text-blue-500" />
          <span className="truncate">{folder.name}</span>
        </Button>
      </div>
      
      {expanded && (
        <div className="ml-2">
          {loading ? (
            <SubfolderLoadingState />
          ) : subfolders.length > 0 ? (
            <SubfolderList 
              subfolders={subfolders} 
              companyId={companyId}
              onSelectFolder={onSelectFolder}
              currentFolder={currentFolder}
              level={level + 1}
            />
          ) : null}
        </div>
      )}
    </div>
  );
}
