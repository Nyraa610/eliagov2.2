// DocumentsLayout.tsx
import { LoadingState } from "@/components/ui/loading-state";
import { ErrorState } from "@/components/ui/error-state";

export function DocumentsLayout() {
  // ... vos imports et états existants ...
  const [error, setError] = useState<string | null>(null);

  // Modifier la fonction loadFolderContents
  const loadFolderContents = async () => {
    setLoading(true);
    setError(null);
    try {
      let path = '';
      let bucketName = 'company_documents_storage';
      
      if (company?.id) {
        if (activeTab === "documents") {
          path = currentPath || company.id;
        } else if (activeTab === "deliverables") {
          path = currentPath || `deliverables/${company.id}`;
        }
      } else if (user?.id) {
        path = currentPath || user.id;
      }
      
      const items = await folderService.listFolderContents(bucketName, path);
      setFolderItems(items);
    } catch (err) {
      console.error("Error loading folder contents:", err);
      setError("Failed to load folder contents. Please try again.");
      toast.error("Failed to load folder contents");
    } finally {
      setLoading(false);
    }
  };

  // Modifier le rendu conditionnel
  if (companyLoading) {
    return <LoadingState message="Loading company information..." />;
  }

  if (!company && !user) {
    return (
      <ErrorState 
        message="You need to be signed in to access documents." 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Document Management</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={loading}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Refresh
          </Button>
          <Button
            onClick={() => setUploadDialogOpen(true)}
            disabled={loading}
          >
            Upload Document
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        {/* ... Votre code TabsList existant ... */}

        <TabsContent value="documents" className="space-y-6">
          {error ? (
            <ErrorState 
              message={error} 
              onRetry={handleRefresh}
            />
          ) : (
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
          )}
        </TabsContent>

        {/* ... Même chose pour TabsContent deliverables ... */}
      </Tabs>

      {/* ... Vos Dialogs existants ... */}
    </div>
  );
}
