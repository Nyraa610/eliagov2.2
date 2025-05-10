import { useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { Upload, Loader2, FileCheck, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  userId?: string;
  currentFolder?: string;
  isPersonal?: boolean;
  onUploadComplete?: () => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  companyId,
  userId,
  currentFolder,
  isPersonal = false,
  onUploadComplete
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<Record<string, number>>({});
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      const newFiles = Array.from(selectedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    
    const droppedFiles = event.dataTransfer.files;
    if (droppedFiles.length > 0) {
      const newFiles = Array.from(droppedFiles);
      setFiles(prev => [...prev, ...newFiles]);
    }
  };
  
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };
  
  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    const ownerId = companyId || userId;
    if (!ownerId) {
      toast.error("Missing company or user ID");
      return;
    }
    
    setUploading(true);
    const newProgress: Record<string, number> = {};
    files.forEach(file => {
      newProgress[file.name] = 0;
    });
    setProgress(newProgress);
    
    try {
      const uploadResults = await Promise.all(
        files.map(async (file) => {
          try {
            // Determine storage path
            let folderPath = '';
            
            // If a specific currentFolder is provided, use it as the base path
            if (currentFolder) {
              folderPath = currentFolder;
            } else {
              // Otherwise construct path based on document type
              if (isPersonal) {
                folderPath = `personal/${ownerId}`;
              } else {
                folderPath = ownerId;
              }
            }
            
            // Create full file path with timestamp to avoid name collisions
            const fileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
            const filePath = `${folderPath}/${fileName}`;
            
            // Upload file to storage
            const { error: uploadError, data: uploadData } = await supabase.storage
              .from('company_documents_storage')
              .upload(filePath, file, {
                cacheControl: '3600',
                upsert: true,
                onUploadProgress: (event) => {
                  const percent = Math.round((event.loaded / event.total) * 100);
                  setProgress(prev => ({
                    ...prev,
                    [file.name]: percent
                  }));
                }
              });
              
            if (uploadError) throw uploadError;
            
            // Get the public URL
            const { data } = supabase.storage
              .from('company_documents_storage')
              .getPublicUrl(filePath);
              
            // Log metadata to database if needed  
            await supabase.from('company_documents').insert({
              company_id: companyId,
              user_id: userId,
              name: file.name,
              file_type: file.type,
              file_size: file.size,
              url: data.publicUrl,
              uploaded_by: (await supabase.auth.getUser()).data.user?.id,
              document_type: isPersonal ? 'personal' : 'standard',
              folder_path: folderPath
            });
            
            return { name: file.name, success: true };
          } catch (err) {
            console.error(`Error uploading ${file.name}:`, err);
            return { name: file.name, success: false, error: err };
          }
        })
      );
      
      // Count successful uploads
      const successful = uploadResults.filter(r => r.success).length;
      
      if (successful === 0) {
        toast.error("Failed to upload documents");
      } else if (successful < files.length) {
        toast.warning(`Uploaded ${successful} of ${files.length} files`);
      } else {
        toast.success(`${files.length} file(s) uploaded successfully`);
        setFiles([]);
        onOpenChange(false);
      }
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (err) {
      console.error("Error during batch upload:", err);
      toast.error("Failed to upload documents");
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      if (!uploading) {
        onOpenChange(isOpen);
        if (!isOpen) setFiles([]);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        
        {/* Drop zone */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={cn(
            "border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-colors",
            "hover:border-primary/50 hover:bg-muted/30"
          )}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <Upload className="h-10 w-10 text-muted-foreground" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="font-medium text-primary hover:underline">Click to upload</span>{" "}
              or drag and drop
            </Label>
            <p className="text-sm text-muted-foreground">
              PDF, Word, Excel, and image files (max 10MB)
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </div>
        </div>
        
        {/* Selected files */}
        {files.length > 0 && (
          <div className="max-h-48 overflow-y-auto">
            <Label className="text-sm font-medium mb-2 block">Selected Files:</Label>
            <ul className="space-y-2">
              {files.map((file, index) => (
                <li key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded-md text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileCheck className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="truncate" title={file.name}>{file.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {uploading && progress[file.name] !== undefined && (
                      <span className="text-xs text-muted-foreground">{progress[file.name]}%</span>
                    )}
                    {!uploading && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleRemoveFile(index)}
                      >
                        <X className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <DialogFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            {files.length > 0 && `${files.length} file(s) selected`}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                setFiles([]);
              }}
              disabled={uploading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={files.length === 0 || uploading}
              className="gap-1"
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Upload
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
