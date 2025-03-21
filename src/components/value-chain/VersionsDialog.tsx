
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";
import { valueChainService } from "@/services/value-chain";
import { ValueChainVersion } from "@/types/valueChain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface VersionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onVersionSelect: (versionId: string) => void;
  currentVersionId?: string;
}

export function VersionsDialog({ 
  open, 
  onOpenChange, 
  onVersionSelect,
  currentVersionId
}: VersionsDialogProps) {
  const [versions, setVersions] = useState<ValueChainVersion[]>([]);
  const [loading, setLoading] = useState(true);
  const { company } = useCompanyProfile();

  useEffect(() => {
    const fetchVersions = async () => {
      if (!company || !open) return;
      
      setLoading(true);
      try {
        const versionsList = await valueChainService.getValueChainVersions(company.id);
        setVersions(versionsList);
      } catch (error) {
        console.error("Error fetching versions:", error);
        toast.error("Failed to load value chain versions");
      } finally {
        setLoading(false);
      }
    };

    fetchVersions();
  }, [company, open]);

  const handleVersionSelect = async (versionId: string) => {
    if (!company) return;
    
    try {
      // Set this version as the current version
      await valueChainService.setCurrentVersion(company.id, versionId);
      // Callback to load the selected version
      onVersionSelect(versionId);
      onOpenChange(false);
      toast.success("Value chain version loaded successfully");
    } catch (error) {
      console.error("Error selecting version:", error);
      toast.error("Failed to load value chain version");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Value Chain Versions</DialogTitle>
        </DialogHeader>
        
        <div className="max-h-[400px] overflow-y-auto">
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : versions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No saved versions found
            </div>
          ) : (
            <div className="space-y-2">
              {versions.map((version) => (
                <div 
                  key={version.id}
                  className={`p-4 border rounded-md flex items-center justify-between ${
                    version.isCurrent ? "border-primary bg-primary/5" : ""
                  }`}
                >
                  <div className="flex-1">
                    <div className="font-medium flex items-center">
                      {version.name}
                      {version.isCurrent && (
                        <span className="ml-2 text-primary flex items-center text-xs">
                          <CheckCircle2 className="h-3 w-3 mr-1" /> Current
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" /> 
                      {format(new Date(version.createdAt), "MMM d, yyyy")}
                      <Clock className="h-3 w-3 ml-3 mr-1" /> 
                      {format(new Date(version.createdAt), "h:mm a")}
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleVersionSelect(version.id)}
                    disabled={version.id === currentVersionId}
                  >
                    {version.id === currentVersionId ? "Current" : "Load"}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
