
import { Button } from "@/components/ui/button";
import { Check, Download, ArrowLeft, Save, History } from "lucide-react";
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { valueChainService } from "@/services/value-chain";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { VersionsDialog } from "../VersionsDialog";

interface ValueChainActionsProps {
  valueChainData: ValueChainData | null;
  activeTab: "view" | "create";
  onValueChainLoad: (valueChain: ValueChainData) => void;
}

export const ValueChainActions = ({ 
  valueChainData, 
  activeTab,
  onValueChainLoad
}: ValueChainActionsProps) => {
  const navigate = useNavigate();
  const { company } = useCompanyProfile();
  const [isVersionsDialogOpen, setIsVersionsDialogOpen] = useState(false);

  const handleBackToEditor = () => {
    navigate("/assessment/value-chain");
  };

  const handleSaveResults = async () => {
    if (!valueChainData || !company) {
      toast.error("No value chain data or company available");
      return;
    }
    
    try {
      // Save the current value chain as a new version
      const success = await valueChainService.saveValueChain({
        ...valueChainData,
        companyId: company.id,
        name: valueChainData.name || `${company.name} Value Chain`
      });
      
      if (success) {
        toast.success("Value chain saved successfully!");
      } else {
        toast.error("Failed to save value chain");
      }
    } catch (error) {
      console.error("Error saving value chain:", error);
      toast.error("Failed to save value chain");
    }
  };

  const handleExportResults = () => {
    if (!valueChainData) return;
    
    try {
      // Create a download for the JSON
      const dataStr = JSON.stringify(valueChainData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportName = valueChainData.name || 'value-chain-export';
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataUri);
      downloadAnchorNode.setAttribute("download", `${exportName}.json`);
      document.body.appendChild(downloadAnchorNode); // required for firefox
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
      
      toast.success("Value chain exported successfully!");
    } catch (error) {
      console.error("Error exporting value chain:", error);
      toast.error("Error exporting value chain");
    }
  };

  const handleVersionSelect = async (versionId: string) => {
    if (!company) return;
    
    try {
      const versionData = await valueChainService.loadValueChainVersion(company.id, versionId);
      if (versionData) {
        onValueChainLoad(versionData);
        toast.success("Version loaded successfully");
      } else {
        toast.error("Failed to load version");
      }
    } catch (error) {
      console.error("Error loading version:", error);
      toast.error("Failed to load version");
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleBackToEditor}
          className="flex items-center gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Value Chain Editor
        </Button>
      </div>
      
      <div className="flex items-center gap-2">
        {valueChainData && (
          <>
            <Button
              variant="outline"
              onClick={() => setIsVersionsDialogOpen(true)}
              className="flex items-center gap-1"
            >
              <History className="h-4 w-4" />
              Versions
            </Button>
            
            {activeTab === "view" && (
              <>
                <Button 
                  variant="outline" 
                  onClick={handleExportResults}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export JSON
                </Button>
                <Button 
                  variant="default" 
                  onClick={handleSaveResults}
                  className="flex items-center gap-1"
                >
                  <Save className="h-4 w-4" />
                  Save Version
                </Button>
              </>
            )}
          </>
        )}
      </div>

      <VersionsDialog
        open={isVersionsDialogOpen}
        onOpenChange={setIsVersionsDialogOpen}
        onVersionSelect={handleVersionSelect}
        currentVersionId={valueChainData?.id}
      />
    </div>
  );
};
