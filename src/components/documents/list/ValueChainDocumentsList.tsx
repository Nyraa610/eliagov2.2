
import { useState, useEffect } from "react";
import { documentService } from "@/services/value-chain/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, FileIcon, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";

interface ValueChainDocumentsListProps {
  companyId: string;
}

export function ValueChainDocumentsList({ companyId }: ValueChainDocumentsListProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        const data = await documentService.getDocuments(companyId);
        setDocuments(data);
      } catch (error) {
        console.error("Error loading value chain documents:", error);
        toast.error("Failed to load value chain documents");
      } finally {
        setLoading(false);
      }
    };
    
    if (companyId) {
      loadDocuments();
    }
  }, [companyId]);

  const handleDeleteDocument = async (document: any) => {
    if (confirm("Are you sure you want to delete this document?")) {
      try {
        await documentService.deleteDocument(document.id);
        setDocuments(documents.filter(d => d.id !== document.id));
        toast.success("Document deleted successfully");
      } catch (error) {
        console.error("Error deleting document:", error);
        toast.error("Failed to delete document");
      }
    }
  };
  
  const getFileIcon = (fileType: string = "") => {
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
        <CardTitle className="text-lg">Value Chain Documents</CardTitle>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No value chain documents yet</h3>
            <p className="text-muted-foreground">
              Upload documents for value chain analysis
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((document: any) => (
              <div
                key={document.id}
                className="flex flex-col border rounded-lg p-4"
              >
                <div className="flex items-start gap-3 mb-3">
                  {getFileIcon(document.file_type)}
                  <div className="flex-1">
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      Uploaded {document.created_at ? formatDistanceToNow(new Date(document.created_at), { addSuffix: true }) : 'recently'}
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
                    <a href={document.url} target="_blank" rel="noopener noreferrer" download>
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
}
