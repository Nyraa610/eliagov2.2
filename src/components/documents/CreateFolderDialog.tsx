
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { documentService, DocumentFolder } from "@/services/document";
import { toast } from "@/components/ui/use-toast";

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  parentFolder: DocumentFolder | null;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  companyId,
  parentFolder
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleCreateFolder = async () => {
    if (!folderName.trim()) {
      toast({
        title: "Error",
        description: "Folder name cannot be empty",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await documentService.createFolder(folderName, companyId, parentFolder?.id || null);
      
      toast({
        title: "Folder created",
        description: "The folder has been successfully created",
      });
      
      setFolderName("");
      onOpenChange(false);
    } catch (error) {
      console.error("Error creating folder:", error);
      toast({
        title: "Error",
        description: "Failed to create folder",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="folderName">Folder Name</Label>
            <Input
              id="folderName"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
            />
            
            {parentFolder && (
              <p className="text-sm text-muted-foreground">
                This folder will be created inside: {parentFolder.name}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleCreateFolder}
            disabled={loading || !folderName.trim()}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Creating...
              </>
            ) : (
              "Create Folder"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
