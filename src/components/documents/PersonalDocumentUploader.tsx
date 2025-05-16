
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from "@/components/ui/button";
import { Upload, X, File } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { personalDocumentService } from "@/services/document/documentService";
import { useTranslation } from "react-i18next";
import { useCompany } from "@/contexts/CompanyContext";

interface PersonalDocumentUploaderProps {
  onUploadComplete: () => void;
  companyId: string;
}

export function PersonalDocumentUploader({ onUploadComplete, companyId }: PersonalDocumentUploaderProps) {
  const { t } = useTranslation();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
    }
  });

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) {
      return;
    }
    
    setIsUploading(true);
    setUploadProgress(0);
    
    // Simulate upload progress
    const progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(progressInterval);
          return 95;
        }
        return prev + 5;
      });
    }, 200);
    
    try {
      // Use the personal document service to upload the file
      await personalDocumentService.uploadPersonalDocument(selectedFile, user.id, companyId);
      
      setUploadProgress(100);
      
      setTimeout(() => {
        setIsDialogOpen(false);
        setSelectedFile(null);
        onUploadComplete();
      }, 500);
    } catch (error) {
      console.error('Upload failed:', error);
      // Error toast is already handled in the service
    } finally {
      clearInterval(progressInterval);
      setIsUploading(false);
    }
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Upload size={16} />
          {t('documents.buttons.upload', 'Upload Document')}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('documents.uploadPersonalDocument', 'Upload Personal Document')}</DialogTitle>
        </DialogHeader>
        
        {!selectedFile ? (
          <div 
            {...getRootProps()} 
            className="border-2 border-dashed border-gray-300 rounded-lg p-10 text-center cursor-pointer hover:bg-gray-50 transition-colors"
          >
            <input {...getInputProps()} />
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              {t('documents.dropzone.dragDrop', 'Drag & drop a file here, or click to select')}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              {t('documents.dropzone.supportedFormats', 'Support for PDF, Word, Excel, and image files')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <File className="h-8 w-8 text-blue-500" />
                <div className="truncate">
                  <p className="font-medium truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={clearSelectedFile}
                disabled={isUploading}
              >
                <X size={18} />
              </Button>
            </div>
            
            {isUploading && (
              <div className="space-y-2">
                <Progress value={uploadProgress} className="h-2" />
                <p className="text-xs text-center text-gray-500">
                  {uploadProgress === 100 
                    ? t('documents.uploadComplete', 'Upload complete!') 
                    : t('documents.uploading', 'Uploading...')}
                </p>
              </div>
            )}
            
            <div className="flex justify-end gap-2">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                disabled={isUploading}
              >
                {t('common.cancel', 'Cancel')}
              </Button>
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading 
                  ? t('documents.uploading', 'Uploading...') 
                  : t('documents.buttons.upload', 'Upload')}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
