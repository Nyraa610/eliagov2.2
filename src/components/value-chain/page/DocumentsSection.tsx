
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { DocumentList } from "@/components/value-chain/DocumentList";
import { Skeleton } from "@/components/ui/skeleton";

interface Document {
  url: string;
  name: string;
  id?: string;
}

interface DocumentsSectionProps {
  documents: Document[];
  onRemoveDocument: (index: number) => void;
  companyId?: string | null;
  isLoading?: boolean;
  error?: string | null;
}

export function DocumentsSection({ 
  documents, 
  onRemoveDocument, 
  companyId,
  isLoading = false,
  error = null
}: DocumentsSectionProps) {
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
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500 p-4">{error}</div>
          ) : documents.length === 0 ? (
            <div className="text-center text-gray-500 p-4">No documents uploaded yet</div>
          ) : (
            <DocumentList 
              documents={documents}
              onRemove={onRemoveDocument}
              className="w-full"
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
