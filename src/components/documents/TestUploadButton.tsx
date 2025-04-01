
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud, Loader2 } from "lucide-react";
import { documentService } from "@/services/value-chain/document";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface TestUploadButtonProps {
  companyId: string;
}

export function TestUploadButton({ companyId }: TestUploadButtonProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();
  
  const handleUpload = async () => {
    if (!companyId) return;
    
    // Create a sample text file
    const testContent = `This is a test document created at ${new Date().toISOString()}`;
    const testFile = new File([testContent], "test-document.txt", { type: "text/plain" });
    
    setIsUploading(true);
    
    try {
      // Ensure bucket exists
      await documentService.ensureDocumentBucketExists();
      
      // Upload the document
      const results = await documentService.uploadDocuments([testFile], companyId);
      console.log("Test document uploaded successfully:", results);
      toast.success("Test document uploaded successfully");
      
      // Force page refresh to show the new document
      window.location.reload();
    } catch (error) {
      console.error("Test upload failed:", error);
      toast.error("Test upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  
  const handlePersonalUpload = async () => {
    if (!user?.id) return;
    
    // Create a sample text file
    const testContent = `This is a test personal document created at ${new Date().toISOString()}`;
    const testFile = new File([testContent], "test-personal-document.txt", { type: "text/plain" });
    
    setIsUploading(true);
    
    try {
      // Ensure bucket exists
      await documentService.ensureDocumentBucketExists();
      
      // Upload the personal document - for personal documents, we'll use the user ID as the "company" ID
      const results = await documentService.uploadDocuments([testFile], user.id);
      console.log("Test personal document uploaded successfully:", results);
      toast.success("Test personal document uploaded successfully");
      
      // Force page refresh to show the new document
      window.location.reload();
    } catch (error) {
      console.error("Test personal upload failed:", error);
      toast.error("Test personal upload failed");
    } finally {
      setIsUploading(false);
    }
  };
  
  return (
    <div className="flex gap-2">
      <Button 
        variant="outline" 
        onClick={handleUpload}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        Test Company Upload
      </Button>
      
      <Button 
        variant="outline" 
        onClick={handlePersonalUpload}
        disabled={isUploading}
        className="flex items-center gap-2"
      >
        {isUploading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <UploadCloud className="h-4 w-4" />
        )}
        Test Personal Upload
      </Button>
    </div>
  );
}
