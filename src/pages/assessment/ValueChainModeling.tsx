import { UserLayout } from "@/components/user/UserLayout";
import { ValueChainEditor } from "@/components/value-chain/ValueChainEditor";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronLeft, FileUp, Wand2, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { isAuthenticated } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DocumentUploadDialog } from "@/components/value-chain/DocumentUploadDialog";
import { valueChainService } from "@/services/value-chain";
import { toast } from "sonner";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";

export default function ValueChainModeling() {
  const { toast: uiToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<{ url: string; name: string }[]>([]);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const auth = await isAuthenticated();
        setIsAuth(auth);
        if (!auth) {
          uiToast({
            title: "Authentication required",
            description: "Please sign in to access this feature.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error checking auth:", error);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [uiToast]);

  const handleOpenUploadDialog = () => {
    if (!isAuth) {
      uiToast({
        title: "Authentication required",
        description: "Please sign in to upload documents.",
        variant: "destructive",
      });
      return;
    }
    
    setIsUploadDialogOpen(true);
  };

  const handleDocumentUpload = async (files: File[]) => {
    if (!files.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      const updateInterval = setInterval(() => {
        setUploadProgress(prev => {
          const newProgress = prev + 10;
          return newProgress < 95 ? newProgress : prev;
        });
      }, 300);
      
      const documentUrls = await valueChainService.uploadDocuments(files);
      
      clearInterval(updateInterval);
      setUploadProgress(100);
      
      if (documentUrls.length > 0) {
        const newDocuments = documentUrls.map((url, index) => ({
          url,
          name: files[index].name
        }));
        
        setUploadedDocuments(prev => [...prev, ...newDocuments]);
        toast.success(`Successfully uploaded ${files.length} document${files.length > 1 ? 's' : ''}`);
      } else {
        toast.error("Failed to upload documents");
      }
    } catch (error) {
      console.error("Document upload error:", error);
      toast.error("Error uploading documents. Please try again.");
    } finally {
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
        setIsUploadDialogOpen(false);
      }, 500);
    }
  };

  if (loading) {
    return (
      <UserLayout title="Value Chain Modeling">
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-[600px] w-full" />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout title="Value Chain Modeling">
      <div className="flex items-center gap-2 mb-4">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="gap-1"
        >
          <Link to="/assessment">
            <ChevronLeft className="h-4 w-4" />
            Back to Assessment
          </Link>
        </Button>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Value Chain Analysis for ESG Reporting</CardTitle>
          <CardDescription>
            Visualize and analyze your company's value creation process to enhance ESG performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-muted-foreground">
            <p>
              A value chain model is crucial for ESG reporting as it helps identify environmental, social, and governance impacts across your business activities. By mapping your value chain, you can:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Identify key sustainability hotspots where environmental or social impacts are concentrated</li>
              <li>Prioritize areas for improvement to maximize ESG performance</li>
              <li>Demonstrate transparency and traceability in your sustainability reporting</li>
              <li>Facilitate stakeholder engagement by clearly illustrating how your business creates value</li>
              <li>Enable more accurate scope 1, 2, and 3 emissions calculations</li>
            </ul>
            <p className="font-semibold mt-4 text-foreground">Getting Started:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2 font-medium text-foreground">
                  <FileUp className="h-5 w-5" />
                  <span>Upload Company Documents</span>
                </div>
                <p className="text-sm">
                  Upload existing documents like business plans, pitch decks, organizational charts, or process flows 
                  to help build an accurate value chain model based on your company's specific operations.
                </p>
                <Button 
                  onClick={handleOpenUploadDialog} 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 w-full"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="animate-pulse">Uploading...</span>
                    </>
                  ) : (
                    <>
                      <FileUp className="h-4 w-4 mr-2" />
                      Upload Documents
                    </>
                  )}
                </Button>
                
                {isUploading && (
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span>Uploading documents...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <Progress value={uploadProgress} className="h-1.5" />
                  </div>
                )}
                
                {uploadedDocuments.length > 0 && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1">
                        <FileText className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Uploaded Documents</span>
                      </div>
                      <StatusBadge status="completed" className="text-xs py-0 px-2 h-5">
                        <span>{uploadedDocuments.length} file{uploadedDocuments.length !== 1 ? 's' : ''}</span>
                      </StatusBadge>
                    </div>
                    <div className="max-h-40 overflow-y-auto border rounded-md p-2">
                      {uploadedDocuments.map((doc, index) => (
                        <div key={index} className="text-xs flex items-center justify-between py-1.5 px-2 border-b last:border-0 hover:bg-muted/50">
                          <span className="truncate max-w-[200px]">{doc.name}</span>
                          <a href={doc.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-[10px]">
                            View
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="border rounded-md p-3">
                <div className="flex items-center gap-2 mb-2 font-medium text-foreground">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v8a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4Z"/><path d="m9 15 3-3 3 3"/><path d="M10 10h4"/></svg>
                  <span>AI-Powered Generation</span>
                </div>
                <p className="text-sm">
                  Let our AI analyze your company information and generate a comprehensive value chain model optimized 
                  for ESG reporting, saving you time and ensuring all key activities are captured.
                </p>
                <Button 
                  onClick={() => isAuth ? toast.info("AI Generation feature coming soon") : uiToast({
                    title: "Authentication required",
                    description: "Please sign in to use AI generation.",
                    variant: "destructive",
                  })} 
                  variant="secondary" 
                  size="sm" 
                  className="mt-3 w-full"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Generate with AI
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAuth ? (
        <ValueChainEditor />
      ) : (
        <div className="bg-muted p-4 rounded-md text-center">
          <p>Please sign in to access the Value Chain Modeling feature.</p>
          <Button asChild className="mt-4">
            <Link to="/login">Sign In</Link>
          </Button>
        </div>
      )}
      
      <DocumentUploadDialog 
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onUpload={handleDocumentUpload}
      />
    </UserLayout>
  );
}
