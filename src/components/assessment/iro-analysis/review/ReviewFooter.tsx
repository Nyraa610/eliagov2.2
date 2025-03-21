
import { Button } from "@/components/ui/button";
import { CardFooter } from "@/components/ui/card";
import { IROFormValues } from "../formSchema";
import { exportToPDF } from "./utils";
import { FileText } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";

interface ReviewFooterProps {
  onPrevious: () => void;
  onSubmit: (values: IROFormValues) => void;
  formValues: IROFormValues;
}

export function ReviewFooter({ onPrevious, onSubmit, formValues }: ReviewFooterProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      // Get company name from the form if available, or use default
      const companyName = formValues.companyName || "Your Company";
      
      const success = exportToPDF(formValues.items, companyName);
      
      if (success) {
        toast({
          title: "Export Successful",
          description: "Your IRO analysis has been exported to PDF",
        });
      } else {
        toast({
          title: "Export Failed",
          description: "There was an error exporting to PDF. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        title: "Export Error",
        description: "Failed to export PDF. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  return (
    <CardFooter className="flex justify-between">
      <Button variant="outline" onClick={onPrevious}>
        Previous
      </Button>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={handleExportPDF} 
          disabled={isExporting || formValues.items.length === 0}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Export to PDF
        </Button>
        <Button onClick={() => onSubmit(formValues)}>
          Submit Analysis
        </Button>
      </div>
    </CardFooter>
  );
}
