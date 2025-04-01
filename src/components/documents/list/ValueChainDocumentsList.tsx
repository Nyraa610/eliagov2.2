
import { useState, useEffect } from "react";
import { documentService } from "@/services/value-chain/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, File, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  useEffect(() => {
    const loadDocuments = async () => {
      if (!companyId) return;
      
      setLoading(true);
      try {
        const docs = await documentService.getDocuments(companyId);
        setDocuments(docs);
      } catch (err) {
        console.error("Error loading value chain documents:", err);
        setError("Failed to load documents");
        toast.error("Failed to load documents");
      } finally {
        setLoading(false);
      }
    };

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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500 mb-2">{error}</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  if (!documents.length) {
    return (
      <div className="text-center p-8 border rounded-md bg-muted/20">
        <p className="text-muted-foreground">No value chain documents found</p>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Value Chain Documents</CardTitle>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}
