
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { DocumentFolder, documentService } from "@/services/document/documentService";
import { Progress } from "@/components/ui/progress";
import { Upload, X, FileText } from "lucide-react";

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
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFiles(prev => [...prev, ...filesArray]);
    }
  };
  
  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };
  
  const handleSubmit = async () => {
    if (files.length === 0) return;
    
    setUploading(true);
    
    let completed = 0;
    const totalFiles = files.length;
    
    for (const file of files) {
      await documentService.uploadDocument(
        file,
        currentFolder?.id || null,
        companyId
      );
      
      completed++;
      setProgress(Math.round((completed / totalFiles) * 100));
    }
    
    // Reset state
    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      setFiles([]);
      onOpenChange(false);
    }, 1000);
  };
  
  const handleCancel = () => {
    if (uploading) return;
    setFiles([]);
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={!uploading ? onOpenChange : undefined}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
        </DialogHeader>
        
        {!uploading ? (
          <>
            <div
              className="border-2 border-dashed rounded-lg p-12 text-center hover:bg-muted/50 transition-colors cursor-pointer"
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileChange}
                multiple
              />
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-1">Drop files here or click to upload</h3>
              <p className="text-sm text-muted-foreground">
                Upload PDFs, Office documents, images, and other file types
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {currentFolder 
                  ? `Files will be uploaded to folder: ${currentFolder.name}`
                  : "Files will be uploaded to the root folder"
                }
              </p>
            </div>
            
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium mb-2">Files to upload ({files.length})</h4>
                <div className="max-h-40 overflow-y-auto border rounded-md">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border-b last:border-0"
                    >
                      <div className="flex items-center">
                        <FileText className="h-5 w-5 mr-3 text-blue-500" />
                        <span className="text-sm truncate max-w-[220px]">{file.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={files.length === 0}
              >
                Upload {files.length > 0 && `(${files.length})`}
              </Button>
            </div>
          </>
        ) : (
          <div className="py-8">
            <Progress value={progress} className="mb-4" />
            <p className="text-center text-sm text-muted-foreground">
              Uploading {files.length} file{files.length !== 1 ? 's' : ''}... {progress}%
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
