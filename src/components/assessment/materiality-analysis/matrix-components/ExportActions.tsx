
import React from "react";
import { Button } from "@/components/ui/button";
import { Download, Printer, Save } from "lucide-react";

interface ExportActionsProps {
  onPrint: () => void;
  onDownloadPDF: () => void;
  onOpenSaveDialog: () => void;
}

export function ExportActions({ 
  onPrint, 
  onDownloadPDF, 
  onOpenSaveDialog 
}: ExportActionsProps) {
  return (
    <div className="flex justify-center space-x-3">
      <Button variant="outline" size="sm" onClick={onPrint}>
        <Printer className="h-4 w-4 mr-2" /> Print
      </Button>
      <Button variant="outline" size="sm" onClick={onDownloadPDF}>
        <Download className="h-4 w-4 mr-2" /> Download PDF
      </Button>
      <Button variant="outline" size="sm" onClick={onOpenSaveDialog}>
        <Save className="h-4 w-4 mr-2" /> Save to Deliverables
      </Button>
    </div>
  );
}
