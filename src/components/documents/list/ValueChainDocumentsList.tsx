
import { useState, useEffect } from "react";
import { documentService } from "@/services/value-chain/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, File, Trash2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SimpleUploadButton } from "@/components/shared/DocumentUpload";

interface Document {
  id: string;
  name: string;
  file_type: string;
  url: string;
  created_at: string;
}

interface ValueChainDocumentsListProps {
  companyId: string;
}

export function ValueChainDocumentsList({ companyId }: ValueChainDocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load documents when component mounts
  const loadDocuments = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Loading value chain documents for company:", companyId);
      const docs = await documentService.getDocuments(companyId);
      console.log("Loaded documents:", docs);
      setDocuments(docs);
    } catch (err) {
      console.error("Error loading value chain documents:", err);
      setError("Failed to load documents");
      toast.error("Failed to load documents");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, [companyId]);

  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm("Are you sure you want to delete this document?")) {
      return;
    }

    try {
      const success = await documentService.deleteDocument(documentId);
      
      if (success) {
        setDocuments(documents.filter(doc => doc.id !== documentId));
        toast.success("Document deleted successfully");
      } else {
        toast.error("Failed to delete document");
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Error deleting document");
    }
  };

  const handleUploadComplete = () => {
    // Reload documents after upload
    loadDocuments();
    toast.success("Document uploaded successfully");
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Value Chain Documents</CardTitle>
        <div className="flex gap-2">
          <SimpleUploadButton 
            companyId={companyId}
            documentType="value_chain"
            onUploadComplete={handleUploadComplete}
            buttonText="Upload Document"
            size="sm"
          />
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadDocuments} 
            disabled={loading}
          >
            <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="text-center p-8">
            <p className="text-red-500 mb-2">{error}</p>
            <Button onClick={loadDocuments}>Retry</Button>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center p-8 border rounded-md bg-muted/20">
            <p className="text-muted-foreground">No value chain documents found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 border rounded-md hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <File className="h-5 w-5 text-blue-500" />
                  <div>
                    <a 
                      href={doc.url} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="font-medium hover:underline text-blue-600"
                    >
                      {doc.name}
                    </a>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => handleDeleteDocument(doc.id)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
