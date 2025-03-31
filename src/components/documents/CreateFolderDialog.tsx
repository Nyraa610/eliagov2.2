
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DocumentFolder, documentService } from "@/services/document/documentService";

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
  const [isCreating, setIsCreating] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!folderName.trim()) return;
    
    setIsCreating(true);
    
    await documentService.createFolder(
      folderName.trim(), 
      companyId,
      parentFolder?.id || null
    );
    
    setIsCreating(false);
    setFolderName("");
    onOpenChange(false);
  };
  
  const handleCancel = () => {
    setFolderName("");
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Folder</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="folder-name">Folder Name</Label>
            <Input
              id="folder-name"
              value={folderName}
              onChange={(e) => setFolderName(e.target.value)}
              placeholder="Enter folder name"
              className="mt-1"
              autoFocus
              disabled={isCreating}
            />
            {parentFolder && (
              <p className="text-xs text-muted-foreground mt-1">
                Will be created as a subfolder of: {parentFolder.name}
              </p>
            )}
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button
              type="button"
              variant="outline" 
              onClick={handleCancel}
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!folderName.trim() || isCreating}
            >
              {isCreating ? "Creating..." : "Create Folder"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
