
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FolderPlus } from "lucide-react";
import { companyFolderService } from "@/services/document";
import { toast } from "sonner";

interface InitializeStorageButtonProps {
  className?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function InitializeStorageButton({ 
  className, 
  variant = "outline"
}: InitializeStorageButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  
  const handleInitialize = async () => {
    try {
      setIsLoading(true);
      
      await companyFolderService.initializeAllCompanyFolders();
      
      toast.success("Company storage folders initialized successfully");
    } catch (error) {
      console.error("Error initializing storage:", error);
      toast.error("Failed to initialize storage folders");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant={variant} 
      className={className}
      onClick={handleInitialize}
      disabled={isLoading}
    >
      <FolderPlus className="mr-2 h-4 w-4" />
      {isLoading ? "Initializing..." : "Initialize Company Folders"}
    </Button>
  );
}
