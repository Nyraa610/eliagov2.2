
import { Button } from "@/components/ui/button";
import { Check, Download, ArrowLeft } from "lucide-react";
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface ValueChainActionsProps {
  valueChainData: ValueChainData | null;
  activeTab: "view" | "create";
}

export const ValueChainActions = ({ valueChainData, activeTab }: ValueChainActionsProps) => {
  const navigate = useNavigate();

  const handleBackToEditor = () => {
    navigate("/assessment/value-chain");
  };

  const handleSaveResults = () => {
    toast.success("Value chain saved successfully!");
    // You can implement actual saving functionality later
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
        {valueChainData && activeTab === "view" && (
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
              <Check className="h-4 w-4" />
              Save Results
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
