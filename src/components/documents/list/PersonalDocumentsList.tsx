
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Download } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Document } from "@/services/document";
import { documentService } from "@/services/document";
import { Skeleton } from "@/components/ui/skeleton";

interface PersonalDocumentsListProps {
  userId: string;
}

export function PersonalDocumentsList({ userId }: PersonalDocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        // Use the special "personal" mode of getDocuments
        const docs = await documentService.getPersonalDocuments(userId);
        setDocuments(docs);
        setError(null);
      } catch (err) {
        console.error("Error fetching personal documents:", err);
        setError("Failed to load your documents");
        toast({
          title: "Error",
          description: "Failed to load your documents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchDocuments();
    }
  }, [userId]);

  const handleDeleteDocument = async (document: Document) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await documentService.deleteDocument(document.id);
        setDocuments(documents.filter(d => d.id !== document.id));
        toast({
          title: "Document deleted",
          description: "The document has been successfully deleted",
        });
      } catch (error) {
        console.error("Error deleting document:", error);
        toast({
          title: "Error",
          description: "Failed to delete document",
          variant: "destructive",
        });
      }
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => setError(null)}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
            <p>You haven't uploaded any documents yet.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-md bg-card hover:bg-accent/50 border"
              >
                <div className="flex items-center">
                  <FileText className="h-5 w-5 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(doc.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-primary"
                    onClick={() => window.open(doc.file_path, "_blank")}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hover:text-destructive"
                    onClick={() => handleDeleteDocument(doc)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
