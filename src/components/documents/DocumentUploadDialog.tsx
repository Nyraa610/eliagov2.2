
import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { documentService, DocumentFolder } from "@/services/document";
import { toast } from "@/components/ui/use-toast";
import { Upload } from "lucide-react";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  currentFolder: DocumentFolder | null;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  companyId,
  currentFolder
}: DocumentUploadDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };
  
  const handleUpload = async () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to upload",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    try {
      await documentService.uploadDocument(file, companyId, currentFolder?.id || null);
      
      toast({
        title: "Document uploaded",
        description: "The document has been successfully uploaded",
      });
      
      setFile(null);
      onOpenChange(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      toast({
        title: "Error",
        description: "Failed to upload document",
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
          <DialogTitle>Upload Document</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="documentFile">Select File</Label>
            <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-accent/50 transition-colors">
              <Input
                id="documentFile"
                type="file"
                onChange={handleFileChange}
                className="hidden"
              />
              <Label htmlFor="documentFile" className="cursor-pointer flex flex-col items-center gap-2">
                <Upload className="h-8 w-8 text-muted-foreground" />
                {file ? (
                  <span className="text-primary font-medium">{file.name}</span>
                ) : (
                  <>
                    <span className="font-medium">Click to upload or drag and drop</span>
                    <span className="text-sm text-muted-foreground">PDF, Word, Excel, or image files</span>
                  </>
                )}
              </Label>
            </div>
            
            {currentFolder && (
              <p className="text-sm text-muted-foreground">
                This document will be uploaded to: {currentFolder.name}
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
            onClick={handleUpload}
            disabled={loading || !file}
          >
            {loading ? (
              <>
                <span className="animate-spin mr-2">⏳</span>
                Uploading...
              </>
            ) : (
              "Upload Document"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
