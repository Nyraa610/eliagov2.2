
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FolderOpen, HardDrive, RefreshCw, AlertCircle, CheckCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Company } from "@/services/company/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { folderService } from "@/services/document/storage/folderService";

interface StorageManagementProps {
  company: Company;
}

export function StorageManagement({ company }: StorageManagementProps) {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<{ success: boolean; message: string } | null>(null);
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null);

  // Check if storage is already initialized when component loads
  useEffect(() => {
    if (company?.id) {
      checkStorageStatus();
    }
  }, [company?.id]);

  const checkStorageStatus = async () => {
    try {
      const bucketsExist = await checkStorageBuckets();
      const foldersExist = await checkCompanyFolders();
      
      if (bucketsExist && foldersExist) {
        setInitStatus({ 
          success: true, 
          message: "Storage is already initialized and ready to use" 
        });
      }
    } catch (err) {
      console.error("Error checking storage status:", err);
    }
  };
  
  const checkStorageBuckets = async (): Promise<boolean> => {
    try {
      // Try to list buckets to see if they exist
      const { data: buckets, error } = await supabase.storage.listBuckets();
      
      if (error) {
        console.error("Error listing buckets:", error);
        return false;
      }
      
      const requiredBuckets = ['company_documents_storage', 'value_chain_documents', 'training_materials'];
      const existingBuckets = buckets.map(b => b.name);
      
      const allBucketsExist = requiredBuckets.every(bucket => existingBuckets.includes(bucket));
      return allBucketsExist;
    } catch (err) {
      console.error("Error checking buckets:", err);
      return false;
    }
  };
  
  const checkCompanyFolders = async (): Promise<boolean> => {
    if (!company?.id) return false;
    
    try {
      // Check if the main company folder exists
      const { data: companyFiles, error: companyError } = await supabase.storage
        .from('company_documents_storage')
        .list(company.id);
        
      if (companyError) {
        console.error("Error checking company folder:", companyError);
        return false;
      }
      
      // If we can list files, the folder exists
      return true;
    } catch (err) {
      console.error("Error checking company folders:", err);
      return false;
    }
  };

  const handleInitializeStorage = async () => {
    if (!company?.id) {
      toast.error("Company ID is required to initialize storage");
      return;
    }
    
    setIsInitializing(true);
    setInitStatus(null);
    setDiagnosticInfo(null);
    
    try {
      let bucketsSuccess = false;
      let foldersSuccess = false;
      let diagnostics = "Initialization process:\n";
      
      // Step 1: Initialize buckets
      diagnostics += "Step 1: Initializing storage buckets...\n";
      try {
        // Initialize all buckets using edge function
        const buckets = ['company_documents_storage', 'value_chain_documents', 'training_materials'];
        const results = await Promise.all(buckets.map(async (bucketName) => {
          try {
            diagnostics += `Initializing bucket: ${bucketName}...\n`;
            const { data, error } = await supabase.functions.invoke("initialize-storage", {
              body: { bucketName }
            });
            
            if (error) {
              diagnostics += `Error initializing bucket ${bucketName}: ${error.message}\n`;
              return { bucketName, success: false };
            }
            
            diagnostics += `Successfully initialized bucket: ${bucketName}\n`;
            return { bucketName, success: true };
          } catch (err) {
            const errorMessage = err instanceof Error ? err.message : String(err);
            diagnostics += `Exception initializing bucket ${bucketName}: ${errorMessage}\n`;
            return { bucketName, success: false };
          }
        }));
        
        bucketsSuccess = results.every(r => r.success);
        diagnostics += `All buckets initialized: ${bucketsSuccess ? 'SUCCESS' : 'FAILED'}\n\n`;
      } catch (bucketsErr) {
        const errorMessage = bucketsErr instanceof Error ? bucketsErr.message : String(bucketsErr);
        diagnostics += `Exception during bucket initialization: ${errorMessage}\n\n`;
        console.error("Error initializing buckets:", bucketsErr);
      }
      
      // Step 2: Initialize company folders using multiple methods for redundancy
      diagnostics += "Step 2: Creating company folders...\n";
      
      try {
        // Try method 1: Using edge function
        diagnostics += "Method 1: Using edge function...\n";
        try {
          const { data: edgeFnData, error: edgeFnError } = await supabase.functions.invoke("initialize-company-storage", {
            body: { companyId: company.id, companyName: company.name }
          });
          
          if (edgeFnError) {
            diagnostics += `Edge function error: ${edgeFnError.message}\n`;
          } else {
            diagnostics += "Edge function completed successfully\n";
            foldersSuccess = true;
          }
        } catch (edgeFnErr) {
          const errorMessage = edgeFnErr instanceof Error ? edgeFnErr.message : String(edgeFnErr);
          diagnostics += `Edge function exception: ${errorMessage}\n`;
        }
        
        // If edge function failed, try method 2: Using folder service
        if (!foldersSuccess) {
          diagnostics += "Method 2: Using folder service...\n";
          try {
            const result = await folderService.initializeAllFolders(company.id);
            if (result) {
              diagnostics += "Folder service completed successfully\n";
              foldersSuccess = true;
            } else {
              diagnostics += "Folder service failed\n";
            }
          } catch (folderServiceErr) {
            const errorMessage = folderServiceErr instanceof Error ? folderServiceErr.message : String(folderServiceErr);
            diagnostics += `Folder service exception: ${errorMessage}\n`;
          }
        }
        
        // Try method 3: Direct upload (last resort)
        if (!foldersSuccess) {
          diagnostics += "Method 3: Using direct upload...\n";
          try {
            const folderPath = `${company.id}/.folder`;
            const { error: uploadError } = await supabase.storage
              .from('company_documents_storage')
              .upload(folderPath, new Uint8Array(0), {
                contentType: 'application/x-directory',
                upsert: true
              });
              
            if (uploadError) {
              diagnostics += `Direct upload error: ${uploadError.message}\n`;
            } else {
              diagnostics += "Direct upload completed successfully\n";
              foldersSuccess = true;
              
              // Also create personal documents subfolder
              const personalFolderPath = `personal/${company.id}/.folder`;
              await supabase.storage
                .from('company_documents_storage')
                .upload(personalFolderPath, new Uint8Array(0), {
                  contentType: 'application/x-directory',
                  upsert: true
                });
                
              // Also create value chain folder
              const valueChainFolderPath = `value_chain/${company.id}/.folder`;
              await supabase.storage
                .from('value_chain_documents')
                .upload(valueChainFolderPath, new Uint8Array(0), {
                  contentType: 'application/x-directory',
                  upsert: true
                });
            }
          } catch (directUploadErr) {
            const errorMessage = directUploadErr instanceof Error ? directUploadErr.message : String(directUploadErr);
            diagnostics += `Direct upload exception: ${errorMessage}\n`;
          }
        }
        
      } catch (foldersErr) {
        const errorMessage = foldersErr instanceof Error ? foldersErr.message : String(foldersErr);
        diagnostics += `Exception during folder creation: ${errorMessage}\n`;
        console.error("Error creating folders:", foldersErr);
      }
      
      // Finalize and set status
      diagnostics += `\nFinal result:\nBuckets: ${bucketsSuccess ? 'SUCCESS' : 'FAILED'}\nFolders: ${foldersSuccess ? 'SUCCESS' : 'FAILED'}\n`;
      setDiagnosticInfo(diagnostics);
      
      if (bucketsSuccess && foldersSuccess) {
        toast.success("Storage initialized successfully");
        setInitStatus({ 
          success: true, 
          message: "All storage components initialized successfully" 
        });
      } else if (bucketsSuccess) {
        const message = "Storage buckets initialized but folder creation had issues. Try again or contact support.";
        toast.warning(message);
        setInitStatus({ 
          success: false, 
          message 
        });
      } else {
        const message = "Storage initialization had issues. See diagnostic details.";
        toast.error(message);
        setInitStatus({ 
          success: false, 
          message 
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error("Error initializing storage:", err);
      toast.error("Failed to initialize storage");
      setInitStatus({ 
        success: false, 
        message: `Initialization error: ${errorMessage}` 
      });
      setDiagnosticInfo(`Unexpected error during initialization: ${errorMessage}`);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <HardDrive className="h-5 w-5 text-primary" />
          Storage Management
        </CardTitle>
        <CardDescription>
          Manage company document storage and folders
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Company Storage</h3>
          <p className="text-muted-foreground mb-4">
            Each company has dedicated storage for documents and files.
          </p>

          {initStatus && (
            <Alert className={`mb-4 ${initStatus.success ? 'bg-green-50' : 'bg-amber-50'}`}>
              <div className="flex items-center gap-2">
                {initStatus.success ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                )}
                <AlertTitle>{initStatus.success ? "Success" : "Warning"}</AlertTitle>
              </div>
              <AlertDescription>{initStatus.message}</AlertDescription>
            </Alert>
          )}

          {diagnosticInfo && (
            <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
              <h4 className="text-sm font-medium mb-2 flex items-center gap-1">
                <Database className="h-3 w-3" /> Diagnostic Information
              </h4>
              <pre className="text-xs whitespace-pre-wrap bg-gray-100 p-2 rounded max-h-60 overflow-auto">
                {diagnosticInfo}
              </pre>
            </div>
          )}

          <div className="flex items-center gap-4">
            <Database className="h-6 w-6 text-primary" />
            <Button 
              variant="outline"
              onClick={handleInitializeStorage}
              disabled={isInitializing}
              className="flex items-center gap-2"
            >
              {isInitializing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Database className="h-4 w-4" />
              )}
              {isInitializing ? "Initializing..." : "Initialize Storage Buckets"}
            </Button>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-2">Document Center</h3>
          <p className="text-muted-foreground mb-4">
            Access the document center to manage files and folders for this company.
          </p>

          <Button 
            variant="secondary" 
            onClick={() => navigate("/documents")}
            className="flex items-center gap-2"
          >
            <FolderOpen className="h-4 w-4" />
            Open Document Center
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
