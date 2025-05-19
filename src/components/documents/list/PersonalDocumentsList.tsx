import { useState, useEffect } from "react";
import { documentService, Document } from "@/services/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileIcon, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "@/components/ui/use-toast";

interface PersonalDocumentsListProps {
  userId: string;
}

export function PersonalDocumentsList({ userId }: PersonalDocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const data = await documentService.getPersonalDocuments(userId);
        setDocuments(data);
      } catch (error) {
        console.error("Error loading personal documents:", error);
        toast({
          title: "Error",
          description: "Failed to load personal documents",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
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
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-6 w-6 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Personal Documents</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No personal documents yet</h3>
            <p className="text-muted-foreground">
              Upload documents to keep them organized
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map(document => (
              <div
                key={document.id}
                className="flex flex-col border rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(document.file_type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                
                <div className="mt-auto pt-2 flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    asChild
                  >
                    <a href={document.file_path} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                      <span>Download</span>
                    </a>
                  </Button>
                  <Button 
                    variant="destructive" 
                    size="sm"
                    className="gap-1"
                    onClick={() => handleDeleteDocument(document)}
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



