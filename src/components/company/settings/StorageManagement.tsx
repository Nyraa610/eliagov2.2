
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FolderOpen, HardDrive, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Company } from "@/services/company/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface StorageManagementProps {
  company: Company;
}

export function StorageManagement({ company }: StorageManagementProps) {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);
  const [initStatus, setInitStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleInitializeStorage = async () => {
    if (!company?.id) {
      toast.error("Company ID is required to initialize storage");
      return;
    }
    
    setIsInitializing(true);
    setInitStatus(null);
    
    try {
      // Initialize all buckets
      const buckets = ['company_documents_storage', 'value_chain_documents', 'training_materials'];
      const results = await Promise.all(buckets.map(async (bucketName) => {
        try {
          const { data, error } = await supabase.functions.invoke("initialize-storage", {
            body: { bucketName }
          });
          
          if (error) {
            console.error(`Error initializing bucket ${bucketName}:`, error);
            return { bucketName, success: false };
          }
          return { bucketName, success: true };
        } catch (err) {
          console.error(`Exception initializing bucket ${bucketName}:`, err);
          return { bucketName, success: false };
        }
      }));
      
      const bucketsSuccessful = results.every(r => r.success);
      
      // Initialize company folders
      let folderSuccess = false;
      try {
        const { data: folderData, error: folderError } = await supabase.functions.invoke("initialize-company-storage", {
          body: { companyId: company.id, companyName: company.name }
        });
        
        if (folderError) {
          console.error("Error initializing company folders:", folderError);
          setInitStatus({ 
            success: false, 
            message: `Failed to initialize company folders: ${folderError.message}` 
          });
        } else {
          folderSuccess = true;
        }
      } catch (folderErr) {
        console.error("Exception initializing company folders:", folderErr);
        setInitStatus({ 
          success: false, 
          message: `Exception when initializing folders: ${folderErr instanceof Error ? folderErr.message : String(folderErr)}` 
        });
      }
      
      if (bucketsSuccessful && folderSuccess) {
        console.log("Storage initialized successfully:", results);
        toast.success("Storage initialized successfully");
        setInitStatus({ success: true, message: "All storage components initialized successfully" });
      } else if (bucketsSuccessful) {
        const message = "Storage buckets initialized but folder creation had issues. Try again or contact support.";
        toast.warning(message);
        setInitStatus({ success: false, message });
      } else {
        const failed = results.filter(r => !r.success).map(r => r.bucketName).join(", ");
        const message = `Storage partially initialized. Issues with: ${failed}`;
        toast.warning(message);
        setInitStatus({ success: false, message });
      }
    } catch (err) {
      console.error("Error initializing storage:", err);
      toast.error("Failed to initialize storage");
      setInitStatus({ 
        success: false, 
        message: `Initialization error: ${err instanceof Error ? err.message : String(err)}` 
      });
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
              <AlertTitle>{initStatus.success ? "Success" : "Warning"}</AlertTitle>
              <AlertDescription>{initStatus.message}</AlertDescription>
            </Alert>
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
