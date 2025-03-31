
import { useState, useEffect } from "react";
import { documentService, Document, DocumentFolder } from "@/services/document/documentService";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Trash, 
  Download, 
  ChevronRight, 
  File, 
  FileImage, 
  FileSpreadsheet,
  FilePdf
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";

interface DocumentsListProps {
  companyId: string;
  currentFolder: DocumentFolder | null;
  breadcrumb: DocumentFolder[];
  onNavigateToFolder: (folder: DocumentFolder | null) => void;
}

export function DocumentsList({
  companyId,
  currentFolder,
  breadcrumb,
  onNavigateToFolder
}: DocumentsListProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  
  const loadDocuments = async () => {
    setLoading(true);
    const data = await documentService.getDocuments(companyId, currentFolder?.id || null);
    setDocuments(data);
    setLoading(false);
  };
  
  useEffect(() => {
    loadDocuments();
  }, [companyId, currentFolder]);
  
  const handleDeleteDocument = async () => {
    if (!documentToDelete) return;
    
    const success = await documentService.deleteDocument(documentToDelete.id);
    if (success) {
      loadDocuments();
    }
    setDocumentToDelete(null);
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FilePdf className="h-10 w-10 text-red-500" />;
    } else if (fileType.includes('image')) {
      return <FileImage className="h-10 w-10 text-green-500" />;
    } else if (fileType.includes('spreadsheet') || fileType.includes('excel') || fileType.includes('csv')) {
      return <FileSpreadsheet className="h-10 w-10 text-emerald-500" />;
    } else {
      return <File className="h-10 w-10 text-blue-500" />;
    }
  };
  
  const getFileSize = (size: number) => {
    if (size < 1024) {
      return `${size} B`;
    } else if (size < 1024 * 1024) {
      return `${(size / 1024).toFixed(2)} KB`;
    } else {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-500" />
            Documents
          </CardTitle>
        </div>
        
        {/* Breadcrumb */}
        <div className="flex items-center text-sm mb-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 text-muted-foreground" 
            onClick={() => onNavigateToFolder(null)}
          >
            Root
          </Button>
          {breadcrumb.map((folder, index) => (
            <div key={folder.id} className="flex items-center">
              <ChevronRight className="h-4 w-4 mx-1 text-muted-foreground" />
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-auto p-1 text-muted-foreground"
                onClick={() => onNavigateToFolder(folder)}
              >
                {folder.name}
              </Button>
            </div>
          ))}
        </div>
        
        <CardDescription>
          {currentFolder 
            ? `Documents in folder "${currentFolder.name}"`
            : "All documents in root folder"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No documents</h3>
            <p className="text-muted-foreground mb-4">
              Upload documents to get started
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {documents.map(document => (
              <div 
                key={document.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  {getFileIcon(document.file_type)}
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <div className="flex items-center text-sm text-muted-foreground gap-2">
                      <span>{getFileSize(document.file_size)}</span>
                      <span>•</span>
                      <span>Uploaded {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    asChild
                  >
                    <a href={document.file_path} target="_blank" rel="noopener noreferrer" download>
                      <Download className="h-4 w-4" />
                      <span className="sr-only">Download</span>
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDocumentToDelete(document)}
                  >
                    <Trash className="h-4 w-4 text-red-500" />
                    <span className="sr-only">Delete</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        <AlertDialog 
          open={!!documentToDelete} 
          onOpenChange={(open) => !open && setDocumentToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Document</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete "{documentToDelete?.name}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteDocument}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}
