
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { DocumentList } from "@/components/value-chain/DocumentList";

interface Document {
  url: string;
  name: string;
  id?: string;
}

interface DocumentsSectionProps {
  documents: Document[];
  onRemoveDocument: (index: number) => void;
  companyId?: string | null;
}

export function DocumentsSection({ documents, onRemoveDocument, companyId }: DocumentsSectionProps) {
  if (documents.length === 0) return null;
  
  return (
    <div className="mb-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Uploaded Documents
          </CardTitle>
          <CardDescription>
            {companyId 
              ? "Company documents that will be used to analyze and generate your value chain" 
              : "Documents that will be used to analyze and generate your value chain"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DocumentList 
            documents={documents}
            onRemove={onRemoveDocument}
            className="w-full"
          />
        </CardContent>
      </Card>
    </div>
  );
}
