
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface AdditionalInfoSectionProps {
  additionalInfo: string;
  onAdditionalInfoChange: (value: string) => void;
  onDocumentsUpload?: (files: File[]) => void;
}

export function AdditionalInfoSection({
  additionalInfo,
  onAdditionalInfoChange,
  onDocumentsUpload
}: AdditionalInfoSectionProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      // Filter for accepted file types
      const validFiles = files.filter(file => {
        const isValid = 
          file.type.includes('pdf') || 
          file.type.includes('document') || 
          file.type.includes('presentation') || 
          file.type.includes('image');
        
        if (!isValid) {
          toast.error(`Unsupported file type: ${file.name}`);
        }
        return isValid;
      });
      
      setSelectedFiles(prev => [...prev, ...validFiles]);
      
      if (onDocumentsUpload) {
        onDocumentsUpload([...selectedFiles, ...validFiles]);
      }
    }
  };
  
  const removeFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      
      if (onDocumentsUpload) {
        onDocumentsUpload(newFiles);
      }
      
      return newFiles;
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="additional-info">Additional Information (Optional)</Label>
        <Textarea
          id="additional-info"
          placeholder="Add details about your business model, supply chain, or specific ESG goals..."
          value={additionalInfo}
          onChange={(e) => onAdditionalInfoChange(e.target.value)}
          rows={4}
        />
        <p className="text-xs text-muted-foreground mt-1">
          The more information you provide, the more accurate your value chain model will be.
        </p>
      </div>
      
      {onDocumentsUpload && (
        <div className="space-y-2">
          <Label htmlFor="document-upload">Supporting Documents (Optional)</Label>
          <div className="border-2 border-dashed rounded-md p-4 text-center">
            <FileUp className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground mb-2">
              Upload documents to enhance your value chain model
            </p>
            <p className="text-xs text-muted-foreground mb-3">
              Accepted formats: PDF, DOC, PPTX, Images
            </p>
            <Button 
              type="button" 
              variant="outline" 
              size="sm"
              onClick={() => document.getElementById('document-upload')?.click()}
            >
              Select Files
            </Button>
            <input 
              id="document-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg"
              multiple
              onChange={handleFileChange}
            />
          </div>
          
          {selectedFiles.length > 0 && (
            <div className="mt-2">
              <p className="text-sm font-medium mb-2">Selected files ({selectedFiles.length}):</p>
              <div className="max-h-32 overflow-y-auto">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md mb-1 text-sm">
                    <span className="truncate max-w-[250px]">{file.name}</span>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      className="h-6 w-6 p-0"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
