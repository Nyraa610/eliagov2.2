
import { useState, useEffect } from "react";
import { documentService, DocumentFolder } from "@/services/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Folder, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  FolderItem, 
  FolderLoadingState, 
  EmptyFolderState 
} from "./folder-structure";

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
            <FolderLoadingState />
          ) : folders.length === 0 ? (
            <EmptyFolderState />
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
