
import { useRef } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";
import { 
  MatrixContainer,
  MaterialityIssuesSummary,
  KeyInsights,
  ExportActions,
  SaveToDeliverableDialog,
  useMatrixExport
} from "./matrix-components";

interface MaterialityMatrixProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onFinish: (values: MaterialityFormValues) => void;
}

export function MaterialityMatrix({ form, onPrevious, onFinish }: MaterialityMatrixProps) {
  const matrixContainerRef = useRef<HTMLDivElement>(null);
  const issues = form.watch("materialIssues") || [];
  const {
    isSaveDialogOpen,
    setIsSaveDialogOpen,
    deliverableName,
    setDeliverableName,
    handleDownloadPDF,
    handlePrintMatrix,
    handleSaveToDeliverables
  } = useMatrixExport();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Double Materiality Matrix</CardTitle>
        <CardDescription>
          Visualize your ESG issues based on financial materiality and impact materiality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {issues.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted/20">
            <div className="text-center text-muted-foreground">
              <p>No material issues identified yet.</p>
              <p className="text-sm">Please go back and identify issues first.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <MatrixContainer 
              ref={matrixContainerRef} 
              issues={issues} 
            />
            
            <ExportActions 
              onPrint={() => handlePrintMatrix(matrixContainerRef, issues)}
              onDownloadPDF={() => handleDownloadPDF(
                matrixContainerRef, 
                issues, 
                form.getValues().companyName || "Company"
              )}
              onOpenSaveDialog={() => setIsSaveDialogOpen(true)}
            />
            
            <MaterialityIssuesSummary issues={issues} />
            
            <KeyInsights issues={issues} />
          </div>
        )}

        <SaveToDeliverableDialog 
          isOpen={isSaveDialogOpen} 
          onClose={() => setIsSaveDialogOpen(false)}
          deliverableName={deliverableName}
          onNameChange={setDeliverableName}
          onSave={() => handleSaveToDeliverables(
            matrixContainerRef, 
            issues, 
            form.getValues()
          )}
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={() => onFinish(form.getValues())} disabled={issues.length === 0}>
          Complete Assessment
        </Button>
      </CardFooter>
    </Card>
  );
}
