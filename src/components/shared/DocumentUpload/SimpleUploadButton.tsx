
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { ValidationRules, UploadedDocument } from "@/services/document/genericDocumentService";

interface SimpleUploadButtonProps {
  onUploadComplete?: (documents: UploadedDocument[]) => void;
  buttonText?: string;
  companyId?: string;
  isPersonal?: boolean;
  folderId?: string | null;
  documentType?: 'standard' | 'personal' | 'value_chain' | 'deliverable';
  validationRules?: ValidationRules;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function SimpleUploadButton({
  onUploadComplete,
  buttonText = "Upload Document",
  companyId,
  isPersonal = false,
  folderId = null,
  documentType = 'standard',
  validationRules,
  variant = "default",
  size = "default"
}: SimpleUploadButtonProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setDialogOpen(true)}
      >
        <Upload className="mr-2 h-4 w-4" />
        {buttonText}
      </Button>
      
      <DocumentUploadDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        companyId={companyId}
        folderId={folderId}
        documentType={documentType}
        isPersonal={isPersonal}
        validationRules={validationRules}
        onUploadComplete={onUploadComplete}
      />
    </>
  );
}
