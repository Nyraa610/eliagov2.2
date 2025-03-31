
import { useState, useEffect } from "react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { FolderStructure } from "./FolderStructure";
import { DocumentsList } from "./DocumentsList";
import { DeliverablesList } from "./DeliverablesList";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { CreateFolderDialog } from "./CreateFolderDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Folder, Upload, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { documentService, DocumentFolder } from "@/services/document";

export function DocumentsLayout() {
  const { company, loading: companyLoading } = useCompanyProfile();
  const [activeTab, setActiveTab] = useState("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Reset loading state when company changes
    if (company) {
      setLoading(false);
    }
  }, [company]);
  
  const navigateToFolder = async (folder: DocumentFolder | null) => {
    try {
      setCurrentFolder(folder);
      
      // Build breadcrumb
      if (!folder) {
        setBreadcrumb([]);
        return;
      }
      
      const newBreadcrumb = [folder];
      let parentId = folder.parent_id;
      
      while (parentId) {
        try {
          const parent = await documentService.getFolder(parentId);
          if (parent) {
            newBreadcrumb.unshift(parent);
            parentId = parent.parent_id;
          } else {
            parentId = null;
          }
        } catch (err) {
          console.error("Error fetching parent folder:", err);
          parentId = null;
          setError("Failed to retrieve folder structure");
        }
      }
      
      setBreadcrumb(newBreadcrumb);
    } catch (err) {
      console.error("Error navigating to folder:", err);
      setError("Failed to navigate to folder");
    }
  };
  
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading company documents...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-red-500 mb-2">Error: {error}</p>
          <Button onClick={() => setError(null)}>Try Again</Button>
        </div>
      </div>
    );
  }
  
  if (!company) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">You need to be part of a company to access documents.</p>
        </div>
      </div>
    );
  }
  
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <div className="flex gap-3">
          {activeTab === "documents" && (
            <>
              <Button 
                variant="outline" 
                onClick={() => setCreateFolderDialogOpen(true)}
              >
                <Folder className="mr-2 h-4 w-4" />
                New Folder
              </Button>
              <Button 
                onClick={() => setUploadDialogOpen(true)}
              >
                <Upload className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
            </>
          )}
        </div>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Company Documents</span>
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Elia Go Deliverables</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="documents" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1">
              <FolderStructure 
                companyId={company.id}
                onSelectFolder={navigateToFolder}
                currentFolder={currentFolder}
              />
            </div>
            <div className="lg:col-span-3">
              <DocumentsList 
                companyId={company.id}
                currentFolder={currentFolder}
                breadcrumb={breadcrumb}
                onNavigateToFolder={navigateToFolder}
              />
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="deliverables">
          <DeliverablesList companyId={company.id} />
        </TabsContent>
      </Tabs>
      
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        companyId={company.id}
        currentFolder={currentFolder}
      />
      
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        companyId={company.id}
        parentFolder={currentFolder}
      />
    </>
  );
}
