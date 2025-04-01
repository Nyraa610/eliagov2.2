
import { useState, useRef } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileIcon, AlertCircle } from "lucide-react";
import { documentService } from "@/services/document";
import { toast } from "@/components/ui/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId?: string;
  userId?: string;
  currentFolder?: { id: string; name: string } | null;
  isPersonal?: boolean;
}

export function DocumentUploadDialog({ 
  open, 
  onOpenChange, 
  companyId,
  userId,
  currentFolder,
  isPersonal = false
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...newFiles]);
      setError(null);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
      setError(null);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };
  
  const handleUpload = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    setProgress(0);
    setError(null);
    
    try {
      // Ensure storage bucket exists before upload
      await documentService.ensureStorageBucketExists();
      
      // Simulate progress
      let progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      if (isPersonal && userId) {
        // Upload personal document
        for (let file of files) {
          await documentService.uploadPersonalDocument(file, userId);
        }
      } else if (companyId) {
        // Upload company document
        for (let file of files) {
          await documentService.uploadDocument(file, companyId, currentFolder?.id || null);
        }
      } else {
        throw new Error("Missing required parameters for upload");
      }
      
      clearInterval(progressInterval);
      setProgress(100);
      
      toast({
        title: "Upload successful", 
        description: `Successfully uploaded ${files.length} file(s)` 
      });
      
      // Reset and close dialog after a delay
      setTimeout(() => {
        setFiles([]);
        setProgress(0);
        setUploading(false);
        onOpenChange(false);
      }, 1000);
    } catch (error) {
      console.error("Error uploading files:", error);
      setError(error instanceof Error ? error.message : 'There was a problem uploading your files');
      setUploading(false);
      setProgress(0);
    }
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!uploading) {
        setFiles([]);
        setError(null);
        onOpenChange(value);
      }
    }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>
            {isPersonal 
              ? "Upload documents to your personal storage" 
              : currentFolder 
                ? `Upload documents to folder: ${currentFolder.name}`
                : "Upload documents to root folder"}
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div 
          className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-1">Drag files here</h3>
          <p className="text-sm text-muted-foreground mb-3">or click to browse</p>
          <input 
            ref={inputRef} 
            type="file" 
            multiple 
            className="hidden" 
            onChange={handleFileChange} 
          />
          <Button variant="outline" type="button" disabled={uploading}>
            Select Files
          </Button>
        </div>
        
        {files.length > 0 && (
          <div className="space-y-3 mt-4">
            <h4 className="text-sm font-medium">Selected Files ({files.length})</h4>
            <div className="max-h-40 overflow-auto space-y-2">
              {files.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                  <div className="flex items-center space-x-2">
                    <FileIcon className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium truncate max-w-[180px]">{file.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeFile(index)}
                    className="h-8 w-8 p-0"
                    disabled={uploading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {uploading && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}
        
        <div className="flex justify-end gap-3">
          <Button 
            variant="outline" 
            onClick={() => {
              if (!uploading) {
                onOpenChange(false);
              }
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
            <Upload className="h-4 w-4" />
            Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
