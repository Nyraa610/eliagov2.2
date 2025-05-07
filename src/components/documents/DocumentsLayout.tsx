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
import { toast } from "sonner";
import { documentService, DocumentFolder, companyFolderService } from "@/services/document";
import { useAuth } from "@/contexts/AuthContext";
import { PersonalDocumentsList } from "./list/PersonalDocumentsList";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";

export function DocumentsLayout() {
  const { company, loading: companyLoading } = useCompanyProfile();
  const { user } = useAuth();
  const { ensureBucketExists, bucketsInitialized } = useSupabaseStorage();
  
  const [activeTab, setActiveTab] = useState("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [currentFolder, setCurrentFolder] = useState<DocumentFolder | null>(null);
  const [breadcrumb, setBreadcrumb] = useState<DocumentFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [storageInitialized, setStorageInitialized] = useState(false);
  
  useEffect(() => {
    if (company || user) {
      setLoading(false);
    }
  }, [company, user]);
  
  // Initialize storage when component loads
  useEffect(() => {
    const initializeStorage = async () => {
      if (storageInitialized) return;
      
      try {
        console.log("Initializing storage buckets...");
        
        // 1. Ensure all required buckets exist
        await ensureBucketExists('company_documents_storage').catch(err => {
          console.warn("Error ensuring company_documents_storage bucket exists:", err);
          // Continue despite error
        });
        
        await ensureBucketExists('training_materials').catch(err => {
          console.warn("Error ensuring training_materials bucket exists:", err);
          // Continue despite error
        });
        
        await ensureBucketExists('value_chain_documents').catch(err => {
          console.warn("Error ensuring value_chain_documents bucket exists:", err);
          // Continue despite error
        });
        
        // 2. Initialize company folder if company is available
        if (company?.id) {
          try {
            await companyFolderService.initializeCompanyFolder(company.id, company.name);
            console.log(`Initialized company folder for ${company.name}`);
          } catch (folderErr) {
            console.warn("Error initializing company folder:", folderErr);
            // Continue despite error
          }
        }
        
        // 3. Initialize user folder if user is available
        if (user?.id) {
          try {
            await companyFolderService.initializeCompanyFolder(user.id, user.email);
            console.log(`Initialized user folder for ${user.email}`);
          } catch (userFolderErr) {
            console.warn("Error initializing user folder:", userFolderErr);
            // Continue despite error
          }
        }
        
        setStorageInitialized(true);
        console.log("Storage initialization completed");
      } catch (err) {
        console.error("Error initializing storage:", err);
        // Don't set error state to avoid blocking the UI
        // setError("Failed to initialize storage");
        
        // Mark as initialized anyway to prevent retries
        setStorageInitialized(true);
      }
    };
    
    if (!storageInitialized && (company || user)) {
      initializeStorage();
    }
  }, [company, user, ensureBucketExists, storageInitialized]);
  
  const navigateToFolder = async (folder: DocumentFolder | null) => {
    try {
      setCurrentFolder(folder);
      
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
          // Don't set error state to avoid blocking the UI
          // setError("Failed to retrieve folder structure");
        }
      }
      
      setBreadcrumb(newBreadcrumb);
    } catch (err) {
      console.error("Error navigating to folder:", err);
      toast.error("Failed to navigate to folder");
    }
  };
  
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading documents...</p>
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

  if (!company && user) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Personal Documents</h1>
          <Button 
            onClick={() => setUploadDialogOpen(true)}
          >
            <Upload className="mr-2 h-4 w-4" />
            Upload Document
          </Button>
        </div>

        <PersonalDocumentsList userId={user.id} />
        
        <DocumentUploadDialog
          open={uploadDialogOpen}
          onOpenChange={setUploadDialogOpen}
          userId={user.id}
          isPersonal={true}
        />
      </>
    );
  }
  
  if (!company && !user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-muted-foreground">You need to be signed in to access documents.</p>
          <Button className="mt-4" variant="outline">Sign In</Button>
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
        companyId={company?.id}
        currentFolder={currentFolder}
      />
      
      <CreateFolderDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        companyId={company?.id}
        parentFolder={currentFolder}
      />
    </>
  );
}
