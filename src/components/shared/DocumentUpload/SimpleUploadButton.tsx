
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { UploadedDocument } from "@/services/document/genericDocumentService";
import { supabase } from "@/lib/supabase";

interface SimpleUploadButtonProps {
  companyId: string;
  userId?: string;
  folderId?: string | null;
  documentType?: 'standard' | 'personal' | 'value_chain' | 'deliverable';
  isPersonal?: boolean;
  customPath?: string;
  buttonText?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon" | null;
  onUploadComplete?: (documents: UploadedDocument[]) => void;
}

export function SimpleUploadButton({
  companyId,
  userId,
  folderId,
  documentType = 'standard',
  isPersonal = false,
  customPath,
  buttonText = "Upload",
  className = "",
  size,
  onUploadComplete
}: SimpleUploadButtonProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleUploadComplete = useCallback(async (documents: UploadedDocument[]) => {
    // Pass the uploaded documents to the parent component
    if (onUploadComplete) {
      onUploadComplete(documents);
    }
    
    // If this is a deliverable document, trigger the notification system
    if (documentType === 'deliverable' && documents.length > 0) {
      try {
        const { data: userData } = await supabase.auth.getUser();
        
        if (!userData.user) return;
        
        // Call the edge function to notify users
        const response = await fetch('https://tqvylbkavunzlckhqxcl.supabase.co/functions/v1/notify-deliverable-upload', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify({
            companyId,
            documentName: documents[0].name,
            uploadedBy: userData.user.id,
            documentUrl: documents[0].url
          })
        });
        
        if (!response.ok) {
          console.error('Failed to trigger deliverable notification:', await response.text());
        }
      } catch (error) {
        console.error('Error notifying about deliverable upload:', error);
      }
    }
  }, [companyId, documentType, onUploadComplete]);

  return (
    <>
      <Button
        onClick={() => setIsDialogOpen(true)}
        variant="outline"
        size={size}
        className={`gap-2 ${className}`}
      >
        <Upload className="h-4 w-4" />
        {buttonText}
      </Button>

      <DocumentUploadDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        companyId={companyId}
        folderId={folderId}
        documentType={documentType}
        isPersonal={isPersonal}
        customPath={customPath}
        onUploadComplete={handleUploadComplete}
      />
    </>
  );
}
