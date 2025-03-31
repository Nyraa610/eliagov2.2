
import { useState, useEffect } from "react";
import { documentService, Document, DocumentFolder } from "@/services/document";
import { toast } from "@/components/ui/use-toast";

export function useDocumentFolderData(
  companyId: string,
  currentFolder: DocumentFolder | null
) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  
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
  }, [companyId, currentFolder]);

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
  
  return {
    documents,
    folders,
    loading,
    handleDeleteDocument,
    handleDeleteFolder
  };
}
