
import { useState, useEffect } from "react";
import { documentService } from "@/services/value-chain/document";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { SimpleUploadButton } from "@/components/shared/DocumentUpload";
import { FolderView } from "@/components/shared/FolderManagement/FolderView";
import { folderService } from "@/services/document/storage/folderService";

interface ValueChainDocumentsListProps {
  companyId: string;
}

export function ValueChainDocumentsList({ companyId }: ValueChainDocumentsListProps) {
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [folderItems, setFolderItems] = useState<any[]>([]);
  const [currentPath, setCurrentPath] = useState(`value_chain/${companyId}`);
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string; path: string;}[]>(
    [{ name: 'Root', path: `value_chain/${companyId}` }]
  );

  // Load documents when component mounts
  const loadDocuments = async () => {
    if (!companyId) return;
    
    setLoading(true);
    setError(null);
    try {
      console.log("Loading value chain documents for company:", companyId);
      
      // Load folder structure
      const items = await folderService.listFolderContents(
        'value_chain_documents',
        currentPath
      );
      
      setFolderItems(items);
      
      // Also load database records for additional metadata
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

  useEffect(() => {
    loadDocuments();
  }, [companyId, currentPath]);
  
  // Update breadcrumbs when path changes
  useEffect(() => {
    const basePath = `value_chain/${companyId}`;
    
    if (currentPath === basePath) {
      setBreadcrumbs([{ name: 'Root', path: basePath }]);
      return;
    }
    
    const relativePath = currentPath.slice(basePath.length + 1);
    const parts = relativePath.split('/');
    const crumbs = [{ name: 'Root', path: basePath }];
    
    let pathBuild = basePath;
    for (let i = 0; i < parts.length; i++) {
      pathBuild += '/' + parts[i];
      crumbs.push({
        name: parts[i],
        path: pathBuild
      });
    }
    
    setBreadcrumbs(crumbs);
  }, [currentPath, companyId]);

  const handleDeleteDocument = async (item: any) => {
    if (!item.id && !item.isFolder) {
      // Handle storage-only file deletion
      return await folderService.deleteItem(
        'value_chain_documents',
        item.path,
        false
      );
    }
    
    try {
      const success = await documentService.deleteDocument(item.id);
      
      if (success) {
        toast.success("Document deleted successfully");
        return true;
      } else {
        toast.error("Failed to delete document");
        return false;
      }
    } catch (err) {
      console.error("Error deleting document:", err);
      toast.error("Error deleting document");
      return false;
    }
  };

  const handleUploadComplete = () => {
    // Reload documents after upload
    loadDocuments();
    toast.success("Document uploaded successfully");
  };
  
  const handleNavigateTo = (path: string) => {
    setCurrentPath(path);
  };
  
  const handleDeleteItem = async (item: any) => {
    return await folderService.deleteItem(
      'value_chain_documents',
      item.path,
      item.isFolder
    );
  };

  return (
    <FolderView 
      title="Value Chain Documents"
      items={folderItems}
      currentPath={currentPath}
      onNavigate={handleNavigateTo}
      onRefresh={loadDocuments}
      onCreateFile={() => {
        // Show upload dialog or handle upload via SimpleUploadButton
      }}
      onDeleteItem={handleDeleteItem}
      isLoading={loading}
      bucketName="value_chain_documents"
      breadcrumbs={breadcrumbs}
    />
  );
}
