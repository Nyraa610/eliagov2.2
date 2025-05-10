
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Folder, 
  FolderPlus,
  ChevronRight,
  ChevronLeft,
  Home,
  RefreshCw,
  FilePlus
} from "lucide-react";
import { FolderCreationDialog } from "./FolderCreationDialog";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FolderItem {
  id: string;
  name: string;
  path: string;
  parentPath?: string;
  isFolder: boolean;
  createdAt?: string;
  size?: number;
  type?: string;
  url?: string;
}

interface FolderViewProps {
  title: string;
  items: FolderItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  onRefresh: () => void;
  onCreateFolder?: (path: string, name: string) => Promise<boolean>;
  onCreateFile?: () => void;
  onDeleteItem?: (item: FolderItem) => Promise<boolean>;
  isLoading: boolean;
  bucketName?: string;
  breadcrumbs?: { name: string; path: string }[];
}

export function FolderView({
  title,
  items,
  currentPath,
  onNavigate,
  onRefresh,
  onCreateFolder,
  onCreateFile,
  onDeleteItem,
  isLoading,
  bucketName,
  breadcrumbs = []
}: FolderViewProps) {
  const [folderDialogOpen, setFolderDialogOpen] = useState(false);
  
  const handleCreateFolder = async (folderName: string) => {
    if (!onCreateFolder) return false;
    return await onCreateFolder(currentPath, folderName);
  };
  
  const handleDeleteItem = async (item: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onDeleteItem) return;
    
    const itemType = item.isFolder ? "folder" : "file";
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) {
      return;
    }
    
    try {
      const success = await onDeleteItem(item);
      if (success) {
        toast.success(`${itemType} deleted successfully`);
        onRefresh();
      } else {
        toast.error(`Failed to delete ${itemType}`);
      }
    } catch (error) {
      console.error(`Error deleting ${itemType}:`, error);
      toast.error(`Error deleting ${itemType}`);
    }
  };
  
  const goToParent = () => {
    if (breadcrumbs.length > 1) {
      const parentPath = breadcrumbs[breadcrumbs.length - 2].path;
      onNavigate(parentPath);
    } else {
      onNavigate('');
    }
  };
  
  return (
    <>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Folder className="h-5 w-5 text-blue-500" />
              {title}
            </CardTitle>
          </div>
          
          <div className="flex gap-2">
            {onCreateFolder && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setFolderDialogOpen(true)}
                className="flex items-center gap-1"
              >
                <FolderPlus className="h-4 w-4" />
                <span className="hidden sm:inline">New Folder</span>
              </Button>
            )}
            
            {onCreateFile && (
              <Button
                variant="outline"
                size="sm"
                onClick={onCreateFile}
                className="flex items-center gap-1"
              >
                <FilePlus className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1">
            {currentPath !== '' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={goToParent}
                className="mr-1"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            
            <Breadcrumb className="flex-grow">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="px-2 h-6" 
                      onClick={() => onNavigate('')}
                    >
                      <Home className="h-4 w-4 mr-1" />
                      Root
                    </Button>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                
                {breadcrumbs.slice(1).map((item, index) => (
                  <React.Fragment key={item.path}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="px-2 h-6"
                          onClick={() => onNavigate(item.path)}
                        >
                          {item.name}
                        </Button>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          
          {/* Folder and File Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 py-4">
              {Array(8).fill(0).map((_, i) => (
                <div key={i} className="h-28 bg-muted/20 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12 border rounded-lg bg-muted/10">
              <Folder className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-muted-foreground">This folder is empty</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.isFolder && onNavigate(item.path)}
                  className={cn(
                    "group flex flex-col justify-between h-28 p-3 border rounded-lg transition-all hover:border-primary",
                    item.isFolder && "hover:bg-muted/20 cursor-pointer"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 overflow-hidden">
                      {item.isFolder ? (
                        <Folder className="h-6 w-6 text-amber-500 flex-shrink-0" />
                      ) : (
                        <div className="h-6 w-6 text-blue-500 flex-shrink-0 flex items-center justify-center bg-blue-50 rounded">
                          {item.type?.split('/')[1]?.substring(0, 3) || 'doc'}
                        </div>
                      )}
                      <span className="font-medium overflow-hidden text-ellipsis whitespace-nowrap" title={item.name}>
                        {item.name}
                      </span>
                    </div>
                    
                    {item.isFolder && (
                      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    )}
                  </div>
                  
                  <div className="mt-auto flex items-center justify-between text-xs text-muted-foreground">
                    <div>
                      {item.isFolder ? 'Folder' : (item.size ? `${Math.round(item.size / 1024)} KB` : 'File')}
                    </div>
                    
                    {onDeleteItem && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteItem(item, e)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 p-0"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
      
      {onCreateFolder && (
        <FolderCreationDialog
          open={folderDialogOpen}
          onOpenChange={setFolderDialogOpen}
          onCreateFolder={handleCreateFolder}
          parentPath={currentPath}
          bucketName={bucketName}
        />
      )}
    </>
  );
}
