
import { useState } from "react";
import { toPng, toJpeg, toSvg } from "html-to-image";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, Save, Check } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";
import { documentService } from "@/services/document";
import { toast } from "sonner";

interface MapExportControlsProps {
  reactFlowRef: React.RefObject<HTMLDivElement>;
  onSaveVersion: (imageUrl: string, versionName: string) => Promise<void>;
}

export function MapExportControls({ reactFlowRef, onSaveVersion }: MapExportControlsProps) {
  const [isSaving, setIsSaving] = useState(false);
  
  const addWatermark = (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    
    // Add Elia GO watermark with logo in bottom right
    const logoImg = new Image();
    logoImg.src = "/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png";
    
    logoImg.onload = () => {
      // Draw semi-transparent background for logo
      ctx.globalAlpha = 0.9;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(canvas.width - 150, canvas.height - 50, 140, 40);
      
      // Draw logo
      ctx.globalAlpha = 1;
      ctx.drawImage(logoImg, canvas.width - 140, canvas.height - 45, 30, 30);
      
      // Draw text
      ctx.font = "bold 16px Arial";
      ctx.fillStyle = "#000000";
      ctx.fillText("ELIA GO", canvas.width - 100, canvas.height - 25);
    };
    
    return canvas;
  };
  
  const exportToImage = async (type: "png" | "jpeg") => {
    if (!reactFlowRef.current) return null;
    
    try {
      // Get the canvas of the current flow view
      const dataUrl = type === "png" 
        ? await toPng(reactFlowRef.current, { backgroundColor: "#ffffff" })
        : await toJpeg(reactFlowRef.current, { backgroundColor: "#ffffff", quality: 0.95 });
      
      // Create a canvas to add watermark
      const canvas = document.createElement("canvas");
      const img = new Image();
      
      // When image loads, set canvas dimensions and draw image with watermark
      return new Promise<string>((resolve) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(dataUrl);
            return;
          }
          
          // Draw the original image
          ctx.drawImage(img, 0, 0);
          
          // Add logo and text
          ctx.globalAlpha = 0.9;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(canvas.width - 150, canvas.height - 50, 140, 40);
          
          // Draw text
          ctx.globalAlpha = 1;
          ctx.font = "bold 16px Arial";
          ctx.fillStyle = "#000000";
          ctx.fillText("ELIA GO", canvas.width - 100, canvas.height - 25);
          
          // Create logo image
          const logoImg = new Image();
          logoImg.onload = () => {
            ctx.drawImage(logoImg, canvas.width - 140, canvas.height - 45, 30, 30);
            const finalDataUrl = canvas.toDataURL(type === "png" ? "image/png" : "image/jpeg");
            resolve(finalDataUrl);
          };
          logoImg.src = "/lovable-uploads/038cd54e-d43d-4877-aa24-981675e8c9f7.png";
        };
        img.src = dataUrl;
      });
    } catch (error) {
      console.error("Error exporting image:", error);
      toast.error("Failed to export image");
      return null;
    }
  };
  
  const exportAsPNG = async () => {
    const dataUrl = await exportToImage("png");
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `stakeholder-map-${new Date().toISOString().split("T")[0]}.png`;
      link.href = dataUrl;
      link.click();
    }
  };
  
  const exportAsJPEG = async () => {
    const dataUrl = await exportToImage("jpeg");
    if (dataUrl) {
      const link = document.createElement("a");
      link.download = `stakeholder-map-${new Date().toISOString().split("T")[0]}.jpg`;
      link.href = dataUrl;
      link.click();
    }
  };
  
  const exportAsPDF = async () => {
    if (!reactFlowRef.current) return;
    
    try {
      const dataUrl = await exportToImage("png");
      if (!dataUrl) return;
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = 297; // A4 height in mm
      
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save(`stakeholder-map-${new Date().toISOString().split("T")[0]}.pdf`);
      
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF");
    }
  };
  
  const saveVersion = async () => {
    if (!reactFlowRef.current) return;
    
    try {
      setIsSaving(true);
      const dataUrl = await exportToImage("png");
      if (!dataUrl) {
        setIsSaving(false);
        return;
      }
      
      const versionName = `Stakeholder Map - ${new Date().toLocaleString()}`;
      await onSaveVersion(dataUrl, versionName);
      toast.success("Map version saved successfully");
    } catch (error) {
      console.error("Error saving version:", error);
      toast.error("Failed to save map version");
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <div className="flex gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={exportAsPNG}>
            Export as PNG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsJPEG}>
            Export as JPEG
          </DropdownMenuItem>
          <DropdownMenuItem onClick={exportAsPDF}>
            Export as PDF
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      
      <Button 
        variant="outline" 
        className="gap-2" 
        onClick={saveVersion}
        disabled={isSaving}
      >
        {isSaving ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {isSaving ? "Saving..." : "Save Version"}
      </Button>
    </div>
  );
}
