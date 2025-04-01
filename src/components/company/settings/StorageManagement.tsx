
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, FolderOpen, HardDrive, RefreshCw } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { InitializeStorageButton } from "@/components/documents/InitializeStorageButton";
import { Company } from "@/services/company/types";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface StorageManagementProps {
  company: Company;
}

export function StorageManagement({ company }: StorageManagementProps) {
  const navigate = useNavigate();
  const [isInitializing, setIsInitializing] = useState(false);

  const handleInitializeStorage = async () => {
    if (!company?.id) {
      toast.error("Company ID is required to initialize storage");
      return;
    }
    
    setIsInitializing(true);
    
    try {
      // Call the edge function to initialize storage
      const { data, error } = await supabase.functions.invoke("initialize-company-storage", {
        body: { companyId: company.id, companyName: company.name },
      });
      
      if (error) {
        console.error("Error initializing storage:", error);
        toast.error("Failed to initialize storage");
      } else {
        console.log("Storage initialization result:", data);
        toast.success("Storage initialized successfully");
      }
    } catch (err) {
      console.error("Error calling initialize-company-storage function:", err);
      toast.error("Failed to initialize storage");
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
              Initialize Storage Buckets
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
