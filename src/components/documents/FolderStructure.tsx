
import { useState, useEffect } from "react";
import { documentService, DocumentFolder } from "@/services/document/documentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, ChevronRight, ChevronDown, Home } from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderStructureProps {
  companyId: string;
  onSelectFolder: (folder: DocumentFolder | null) => void;
  currentFolder: DocumentFolder | null;
}

export function FolderStructure({
  companyId,
  onSelectFolder,
  currentFolder
}: FolderStructureProps) {
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  
  const loadTopLevelFolders = async () => {
    setLoading(true);
    const data = await documentService.getFolders(companyId);
    setFolders(data);
    setLoading(false);
  };
  
  useEffect(() => {
    loadTopLevelFolders();
  }, [companyId]);
  
  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };
  
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Folder className="h-5 w-5 text-blue-500" />
          Folders
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <Button 
            variant="ghost" 
            className={cn(
              "w-full justify-start text-left",
              !currentFolder && "bg-muted" 
            )} 
            onClick={() => onSelectFolder(null)}
          >
            <Home className="h-4 w-4 mr-2" />
            <span>Root</span>
          </Button>
          
          {loading ? (
            <div className="flex justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : folders.length === 0 ? (
            <p className="text-sm text-muted-foreground py-2 text-center">No folders created yet</p>
          ) : (
            <div className="space-y-0.5">
              {folders.map(folder => (
                <FolderItem
                  key={folder.id}
                  folder={folder}
                  companyId={companyId}
                  expanded={expandedFolders.has(folder.id)}
                  toggleExpand={() => toggleFolder(folder.id)}
                  onSelectFolder={onSelectFolder}
                  currentFolder={currentFolder}
                  level={0}
                />
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface FolderItemProps {
  folder: DocumentFolder;
  companyId: string;
  expanded: boolean;
  toggleExpand: () => void;
  onSelectFolder: (folder: DocumentFolder | null) => void;
  currentFolder: DocumentFolder | null;
  level: number;
}

function FolderItem({
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
            <div className="flex justify-center py-2">
              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : subfolders.length > 0 ? (
            subfolders.map(subfolder => (
              <FolderItem
                key={subfolder.id}
                folder={subfolder}
                companyId={companyId}
                expanded={false}
                toggleExpand={() => {}}
                onSelectFolder={onSelectFolder}
                currentFolder={currentFolder}
                level={level + 1}
              />
            ))
          ) : null}
        </div>
      )}
    </div>
  );
}
