
import React, { useState, useEffect } from "react";
import { documentService, Document, DocumentFolder } from "@/services/document/documentService";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  FileText, Download, Folder, ChevronRight, ArrowUp, 
  Trash2, FileIcon, File 
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useToast } from "@/components/ui/use-toast";

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
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const loadDocuments = async () => {
      setLoading(true);
      try {
        // Get folders for current directory
        const folderData = await documentService.getFolders(
          companyId, 
          currentFolder?.id || null
        );
        setFolders(folderData);
        
        // Get documents for current directory
        const documentData = await documentService.getDocuments(
          companyId,
          currentFolder?.id || null
        );
        setDocuments(documentData);
      } catch (error) {
        console.error("Error loading documents:", error);
        toast({
          title: "Error",
          description: "Failed to load documents and folders",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadDocuments();
  }, [companyId, currentFolder, toast]);
  
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
  
  const handleDeleteFolder = async (folder: DocumentFolder) => {
    if (confirm("Are you sure you want to delete this folder and all its contents?")) {
      try {
        await documentService.deleteFolder(folder.id);
        setFolders(folders.filter(f => f.id !== folder.id));
        toast({
          title: "Folder deleted",
          description: "The folder has been successfully deleted",
        });
      } catch (error) {
        console.error("Error deleting folder:", error);
        toast({
          title: "Error",
          description: "Failed to delete folder",
          variant: "destructive",
        });
      }
    }
  };
  
  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet') || 
               fileType.includes('csv') || fileType.includes('xls')) {
      return <FileText className="h-6 w-6 text-emerald-500" />;
    } else if (fileType.includes('word') || fileType.includes('doc')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <File className="h-6 w-6 text-gray-500" />;
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center justify-between">
          <div>
            {currentFolder ? currentFolder.name : "All Documents"}
          </div>
        </CardTitle>
        
        {/* Breadcrumb navigation */}
        <Breadcrumb className="mt-2">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Button 
                  variant="link" 
                  className="p-0 h-auto font-normal"
                  onClick={() => onNavigateToFolder(null)}
                >
                  Documents
                </Button>
              </BreadcrumbLink>
            </BreadcrumbItem>
            
            {breadcrumb.map((folder, index) => (
              <React.Fragment key={folder.id}>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    {index < breadcrumb.length - 1 ? (
                      <Button 
                        variant="link" 
                        className="p-0 h-auto font-normal"
                        onClick={() => onNavigateToFolder(folder)}
                      >
                        {folder.name}
                      </Button>
                    ) : (
                      <span className="text-muted-foreground">{folder.name}</span>
                    )}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </React.Fragment>
            ))}
          </BreadcrumbList>
        </Breadcrumb>
        
        {currentFolder && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="mt-2"
            onClick={() => {
              if (breadcrumb.length > 1) {
                // Go to parent folder
                onNavigateToFolder(breadcrumb[breadcrumb.length - 2]);
              } else {
                // Go to root
                onNavigateToFolder(null);
              }
            }}
          >
            <ArrowUp className="h-4 w-4 mr-2" />
            <span>Up to {breadcrumb.length > 1 ? breadcrumb[breadcrumb.length - 2].name : 'Documents'}</span>
          </Button>
        )}
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : folders.length === 0 && documents.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileIcon className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
            <h3 className="text-lg font-medium mb-1">No documents or folders</h3>
            <p className="text-muted-foreground">
              Upload documents or create folders to get started
            </p>
          </div>
        ) : (
          <div>
            {/* Folders */}
            {folders.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Folders</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {folders.map(folder => (
                    <div
                      key={folder.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                      onClick={() => onNavigateToFolder(folder)}
                    >
                      <div className="flex items-center gap-3">
                        <Folder className="h-6 w-6 text-amber-500" />
                        <span className="font-medium">{folder.name}</span>
                      </div>
                      <div className="flex items-center">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFolder(folder);
                          }}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Documents */}
            {documents.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-3">Documents</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {documents.map(doc => (
                    <div
                      key={doc.id}
                      className="flex flex-col border rounded-lg p-4"
                    >
                      <div className="flex items-start gap-3 mb-3">
                        {getFileIcon(doc.file_type)}
                        <div className="flex-1">
                          <h4 className="font-medium">{doc.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Uploaded {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => handleDeleteDocument(doc)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                          asChild
                        >
                          <a href={doc.file_path} target="_blank" rel="noopener noreferrer" download>
                            <Download className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
