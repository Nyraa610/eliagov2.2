import { useState, useEffect } from "react";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { DocumentUploadDialog } from "./DocumentUploadDialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Loader2, FileText, Upload, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSupabaseStorage } from "@/hooks/use-supabase-storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/lib/supabase";

export function DocumentsLayout() {
  const { company, loading: companyLoading } = useCompanyProfile();
  const { user } = useAuth();
  const { ensureBucketExists } = useSupabaseStorage();
  
  const [activeTab, setActiveTab] = useState("documents");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [companyDocuments, setCompanyDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [storageInitialized, setStorageInitialized] = useState(false);
  
  useEffect(() => {
    if (company?.id || user?.id) {
      initializeStorage();
    }
  }, [company, user]);
  
  // Load company documents
  useEffect(() => {
    if (!storageInitialized || !company?.id) return;
    
    const loadCompanyDocuments = async () => {
      setLoading(true);
      try {
        // Ajustez cette requête selon votre structure de base de données
        const { data, error } = await supabase
          .from('company_documents') // Remplacez par votre table réelle
          .select('*')
          .eq('company_id', company.id);
          
        if (error) throw error;
        setCompanyDocuments(data || []);
      } catch (err) {
        console.error("Error loading company documents:", err);
        toast.error("Failed to load company documents");
      } finally {
        setLoading(false);
      }
    };
    
    loadCompanyDocuments();
  }, [company?.id, refreshTrigger, storageInitialized]);
  
  const initializeStorage = async () => {
    if (storageInitialized) return;
    
    try {
      console.log("Initializing storage buckets...");
      
      // Initialisation des buckets comme dans votre code original
      await ensureBucketExists('company_documents_storage').catch(err => {
        console.warn("Error ensuring company_documents_storage bucket exists:", err);
      });
      
      // Autres initialisations...
      
      setStorageInitialized(true);
      console.log("Storage initialization completed");
    } catch (err) {
      console.error("Error initializing storage:", err);
      setStorageInitialized(true);
    }
  };
  
  const handleRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };
  
  const handleUpload = () => {
    setUploadDialogOpen(true);
  };
  
  const getFileIcon = (fileType) => {
    if (fileType === 'application/pdf' || fileType.includes('pdf')) {
      return <FileText className="h-6 w-6 text-red-500" />;
    } else if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
      return <FileText className="h-6 w-6 text-green-500" />;
    } else if (fileType.includes('word') || fileType.includes('document')) {
      return <FileText className="h-6 w-6 text-blue-500" />;
    } else {
      return <FileText className="h-6 w-6 text-gray-500" />;
    }
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
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Company Documents</CardTitle>
              <div className="flex gap-2">
                <Button onClick={handleUpload} className="flex items-center gap-2">
                  <Upload size={16} />
                  Upload Document
                </Button>
                <Button variant="outline" onClick={handleRefresh} className="p-2">
                  <RefreshCw size={16} />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : companyDocuments.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-3 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">No documents yet</h3>
                  <p className="text-muted-foreground">
                    Upload documents to get started
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companyDocuments.map(document => (
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
                          {document.description && (
                            <p className="text-sm mt-1">{document.description}</p>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-auto pt-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full gap-2"
                          asChild
                        >
                          <a href={document.file_path} target="_blank" rel="noopener noreferrer" download>
                            <FileText className="h-4 w-4" />
                            <span>Download</span>
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="deliverables">
          {/* Gardez votre logique existante pour l'onglet deliverables */}
        </TabsContent>
      </Tabs>
      
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        companyId={company?.id}
        currentFolder=""
        onUploadComplete={handleRefresh}
      />
    </>
  );
}
