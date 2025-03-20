
import { ValueChainData } from "@/types/valueChain";
import { toast } from "sonner";

/**
 * Service for exporting and importing value chain data
 */
export const valueChainExportService = {
  /**
   * Export value chain data as a JSON file
   * @param valueChain The value chain data to export
   */
  exportAsJson: (valueChain: ValueChainData): void => {
    try {
      // Create a JSON string from the value chain data
      const jsonStr = JSON.stringify(valueChain, null, 2);
      
      // Create a blob from the JSON string
      const blob = new Blob([jsonStr], { type: 'application/json' });
      
      // Create a URL for the blob
      const url = URL.createObjectURL(blob);
      
      // Create a download link and click it
      const link = document.createElement('a');
      link.href = url;
      link.download = `${valueChain.name || 'value-chain'}.json`;
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      toast.success("Value chain exported successfully");
    } catch (error) {
      console.error("Error exporting value chain:", error);
      toast.error("Failed to export value chain");
    }
  },
  
  /**
   * Export value chain as an image
   * @param canvasId The ID of the ReactFlow canvas element
   */
  exportAsImage: (canvasId: string): void => {
    try {
      // This is a placeholder - actual implementation would use html2canvas or similar
      // to capture the ReactFlow canvas as an image
      toast.error("Export as image not yet implemented");
    } catch (error) {
      console.error("Error exporting value chain as image:", error);
      toast.error("Failed to export value chain as image");
    }
  }
};
