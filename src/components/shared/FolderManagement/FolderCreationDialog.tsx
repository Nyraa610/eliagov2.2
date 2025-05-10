
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, FolderPlus } from "lucide-react";
import { toast } from "sonner";

export interface FolderCreationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateFolder: (folderName: string) => Promise<boolean>;
  title?: string;
  parentPath?: string;
  bucketName?: string;
}

export function FolderCreationDialog({
  open,
  onOpenChange,
  onCreateFolder,
  title = "Create New Folder",
  parentPath,
  bucketName
}: FolderCreationProps) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast.error("Folder name cannot be empty");
      return;
    }
    
    setLoading(true);
    try {
      const success = await onCreateFolder(folderName.trim());
      
      if (success) {
        toast.success("Folder created successfully");
        setFolderName("");
        onOpenChange(false);
      } else {
        toast.error("Failed to create folder");
      }
    } catch (error) {
      console.error("Error creating folder:", error);
      toast.error("Failed to create folder");
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              autoFocus
            />
            
            {parentPath && (
              <p className="text-sm text-muted-foreground">
                This folder will be created inside: {parentPath}
              </p>
            )}
            
            {bucketName && (
              <p className="text-xs text-muted-foreground">
                Storage bucket: {bucketName}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => {
              setFolderName("");
              onOpenChange(false);
            }}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder}
            disabled={loading || !folderName.trim()}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <FolderPlus className="h-4 w-4" />
            )}
            {loading ? "Creating..." : "Create Folder"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
