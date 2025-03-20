
import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileUp, X, File, FileCheck, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { Progress } from "@/components/ui/progress";

interface DocumentUploadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[]) => void;
}

export function DocumentUploadDialog({
  open,
  onOpenChange,
  onUpload
}: DocumentUploadDialogProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [fileValidationStatus, setFileValidationStatus] = useState<{[key: string]: boolean}>({});

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      
      // Validate files
      const validFiles: File[] = [];
      const newValidationStatus: {[key: string]: boolean} = {};
      
      newFiles.forEach(file => {
        const isValid = validateFile(file);
        newValidationStatus[file.name] = isValid;
        if (isValid) validFiles.push(file);
      });
      
      setFileValidationStatus(prev => ({...prev, ...newValidationStatus}));
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const validateFile = (file: File) => {
    const validTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'image/jpeg',
      'image/png',
      'image/gif'
    ];
    
    const isValid = validTypes.includes(file.type);
    
    if (!isValid) {
      toast.error(`${file.name}: Only PDF, Office documents, and image files are accepted`);
    }
    
    return isValid;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      
      // Validate files
      const validFiles: File[] = [];
      const newValidationStatus: {[key: string]: boolean} = {};
      
      droppedFiles.forEach(file => {
        const isValid = validateFile(file);
        newValidationStatus[file.name] = isValid;
        if (isValid) validFiles.push(file);
      });
      
      setFileValidationStatus(prev => ({...prev, ...newValidationStatus}));
      setFiles(prev => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    const fileToRemove = files[index];
    setFiles(files.filter((_, i) => i !== index));
    
    // Update validation status
    const newValidationStatus = {...fileValidationStatus};
    delete newValidationStatus[fileToRemove.name];
    setFileValidationStatus(newValidationStatus);
  };

  const handleSubmit = () => {
    onUpload(files);
    setFiles([]);
    setFileValidationStatus({});
  };

  const getFileIcon = (file: File) => {
    if (file.type.startsWith('image/')) {
      return <File className="h-5 w-5 text-blue-500" />;
    } else if (file.type.includes('pdf')) {
      return <File className="h-5 w-5 text-red-500" />;
    } else if (file.type.includes('word')) {
      return <File className="h-5 w-5 text-blue-700" />;
    } else if (file.type.includes('powerpoint')) {
      return <File className="h-5 w-5 text-orange-500" />;
    }
    return <File className="h-5 w-5 text-gray-500" />;
  };

  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(1)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload Documents</DialogTitle>
          <DialogDescription>
            Upload supporting documents for your value chain analysis. We accept PDF, Office documents, and image files.
          </DialogDescription>
        </DialogHeader>
        
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            isDragging ? "border-primary bg-primary/5" : "border-gray-300"
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <FileUp className="h-10 w-10 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground mb-2">
            Drag and drop files here, or click to browse
          </p>
          <p className="text-xs text-muted-foreground mb-3">
            Accepted formats: PDF, DOC, PPTX, JPG, PNG, GIF
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => document.getElementById("file-upload")?.click()}
          >
            Browse Files
          </Button>
          <input
            id="file-upload"
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.ppt,.pptx,.jpg,.jpeg,.png,.gif"
            multiple
            onChange={handleFileChange}
          />
        </div>
        
        {files.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
              <span className="text-xs text-muted-foreground">
                {files.reduce((total, file) => total + file.size, 0) / (1024 * 1024) < 1 
                  ? `${(files.reduce((total, file) => total + file.size, 0) / 1024).toFixed(1)} KB`
                  : `${(files.reduce((total, file) => total + file.size, 0) / (1024 * 1024)).toFixed(1)} MB`}
              </span>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-2 border rounded-md p-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-muted rounded-md text-sm hover:bg-muted/80 transition-colors"
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    {getFileIcon(file)}
                    <div className="overflow-hidden">
                      <span className="truncate block max-w-[180px] font-medium">{file.name}</span>
                      <span className="text-xs text-muted-foreground">{getFileSize(file.size)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-6 w-6 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setFiles([]);
              setFileValidationStatus({});
              onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={files.length === 0}
            className="gap-1"
          >
            <FileCheck className="h-4 w-4" />
            {files.length ? `Upload ${files.length} File${files.length > 1 ? 's' : ''}` : 'Upload'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
