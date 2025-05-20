import { useState, useEffect } from "react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { FolderCreationDialog } from "../shared/FolderManagement/FolderCreationDialog";
import { FolderView, FolderItem } from "../shared/FolderManagement/FolderView";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, FileText } from "lucide-react";
import { toast } from "sonner";
import { folderService } from "@/services/document/storage/folderService";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";

export function DocumentsLayout() {
  const { company, loading: companyLoading } = useCompanyProfile();
  const { user } = useAuth();
  const { ensureBucketExists, bucketsInitialized } = useSupabaseStorage();
  
  const [activeTab, setActiveTab] = useState("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [createFolderDialogOpen, setCreateFolderDialogOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [breadcrumbs, setBreadcrumbs] = useState<{name: string; path: string;}[]>([{ name: 'Root', path: '' }]);
  const [folderItems, setFolderItems] = useState<FolderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [storageInitialized, setStorageInitialized] = useState(false);
  
  useEffect(() => {
    if (company?.id || user?.id) {
      initializeStorage();
    }
  }, [company, user]);
  
  // Load folder contents whenever the path or refresh trigger changes
  useEffect(() => {
    if (!storageInitialized) return;
    
    const loadFolderContents = async () => {
      setLoading(true);
      try {
        let path = '';
        let bucketName = 'company_documents_storage';
        
        // Determine which bucket and path to use based on active tab
        if (company?.id) {
          if (activeTab === "documents") {
            path = currentPath || company.id;
          } else if (activeTab === "deliverables") {
            // For deliverables tab
            bucketName = 'company_documents_storage';
            path = currentPath || `deliverables/${company.id}`;
          }
        } else if (user?.id) {
          path = currentPath || user.id;
        }
        
        console.log(`Loading contents from ${bucketName}/${path}`);
        const items = await folderService.listFolderContents(bucketName, path);
        setFolderItems(items);
      } catch (err) {
        console.error("Error loading folder contents:", err);
        toast.error("Failed to load folder contents");
      } finally {
        setLoading(false);
      }
    };
    
    loadFolderContents();
  }, [company, user, currentPath, refreshTrigger, activeTab, storageInitialized]);
  
  // Update breadcrumbs when path changes
  useEffect(() => {
    if (!currentPath) {
      setBreadcrumbs([{ name: 'Root', path: '' }]);
      return;
    }
    
    const parts = currentPath.split('/');
    const crumbs = [{ name: 'Root', path: '' }];
    
    let currentPathBuild = '';
    for (let i = 0; i < parts.length; i++) {
      currentPathBuild += (i === 0 ? '' : '/') + parts[i];
      crumbs.push({
        name: parts[i], // Use the actual folder name rather than the full path
        path: currentPathBuild
      });
    }
    
    setBreadcrumbs(crumbs);
  }, [currentPath]);
  
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
          await folderService.initializeAllFolders(company.id);
          console.log(`Initialized company folder for ${company.name}`);
        } catch (folderErr) {
          console.warn("Error initializing company folder:", folderErr);
          // Continue despite error
        }
      }
      
      // 3. Initialize user folder if user is available
      if (user?.id) {
        try {
          await folderService.ensureCompanyFolder(user.id);
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
      // Mark as initialized anyway to prevent retries
      setStorageInitialized(true);
    }
  };
  
  const handleNavigateTo = (path: string) => {
    setCurrentPath(path);
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleCreateFolder = async (folderName: string) => {
    if (!company?.id && !user?.id) return false;
    
    const bucketName = 'company_documents_storage';
    let path = currentPath;
    
    // If we're at root level, use company ID as base path
    if (!path && company?.id) {
      path = company.id;
    }
    
    // If we're at root level for a user, use user ID as base path
    if (!path && user?.id) {
      path = user.id;
    }
    
    const success = await folderService.createNewFolder(bucketName, path, folderName);
    
    if (success) {
      handleRefresh();
      return true;
    }
    
    return false;
  };
  
  const handleDeleteItem = async (item: FolderItem) => {
    const bucketName = 'company_documents_storage';
    return await folderService.deleteItem(bucketName, item.path, item.isFolder);
  };
  
  if (companyLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading documents...</p>
        </div>
      </div>
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
          <FolderView 
            title="Company Documents"
            items={folderItems}
            currentPath={currentPath}
            onNavigate={handleNavigateTo}
            onRefresh={handleRefresh}
            onCreateFolder={handleCreateFolder}
            onCreateFile={() => setUploadDialogOpen(true)}
            onDeleteItem={handleDeleteItem}
            isLoading={loading}
            bucketName="company_documents_storage"
            breadcrumbs={breadcrumbs}
          />
        </TabsContent>
        
        <TabsContent value="deliverables">
          <FolderView 
            title="Elia Go Deliverables"
            items={folderItems}
            currentPath={currentPath}
            onNavigate={handleNavigateTo}
            onRefresh={handleRefresh}
            onCreateFile={() => setUploadDialogOpen(true)}
            onDeleteItem={handleDeleteItem}
            isLoading={loading}
            bucketName="company_documents_storage"
            breadcrumbs={breadcrumbs}
          />
        </TabsContent>
      </Tabs>
      
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        companyId={company?.id}
        currentFolder={currentPath}
        onUploadComplete={handleRefresh}
      />
      
      <FolderCreationDialog
        open={createFolderDialogOpen}
        onOpenChange={setCreateFolderDialogOpen}
        onCreateFolder={handleCreateFolder}
        parentPath={currentPath}
        bucketName="company_documents_storage"
      />
    </>
  );
}
