
import React, { useRef, useState, forwardRef } from "react";
import { MaterialityChart } from "./MaterialityChart";
import { CategoryLegend } from "./CategoryLegend";
import { MaterialityIssuesSummary } from "./MaterialityIssuesSummary";
import { KeyInsights } from "./KeyInsights";
import { ExportActions } from "./ExportActions";
import { SaveToDeliverableDialog } from "./SaveToDeliverableDialog";
import { useMatrixExport } from "./useMatrixExport";
import { MaterialityIssue, MaterialityFormValues } from "../formSchema";
import { RequestApprovalDialog } from "@/components/approval/RequestApprovalDialog";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabaseService } from "@/services/base/supabaseService";
import { FileCheck } from "lucide-react";

interface MatrixContainerProps {
  data: MaterialityFormValues;
}

export const MatrixContainer = forwardRef<HTMLDivElement, MatrixContainerProps>(
  ({ data }, ref) => {
    const matrixContainerRef = useRef<HTMLDivElement>(null);
    // Use provided ref or fallback to local ref
    const containerRef = (ref || matrixContainerRef) as React.RefObject<HTMLDivElement>;
    const { user } = useAuth();
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false);
    
    // Filter out issues with null or undefined values
    const validIssues = (data.materialIssues || []).filter(issue => 
      typeof issue.financialMateriality === 'number' && 
      typeof issue.impactMateriality === 'number'
    );

    // Destructure the export functions
    const { 
      isSaveDialogOpen, 
      setIsSaveDialogOpen,
      deliverableName,
      setDeliverableName,
      handleDownloadPDF,
      handlePrintMatrix,
      handleSaveToDeliverables
    } = useMatrixExport();
    
    React.useEffect(() => {
      const fetchUserCompany = async () => {
        if (user?.id) {
          try {
            const profile = await supabaseService.getUserProfile();
            if (profile?.company_id) {
              setCompanyId(profile.company_id);
            }
          } catch (error) {
            console.error("Error fetching user company:", error);
          }
        }
      };
      
      fetchUserCompany();
    }, [user?.id]);

    // No data or issues
    if (!data || !validIssues.length) {
      return (
        <div className="text-center p-8 border border-dashed rounded-lg">
          <p>No materiality issues to display. Please add issues and assess their materiality.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* The container that will be exported */}
        <div ref={containerRef} className="bg-white p-6 rounded-lg border">
          <h2 className="text-2xl font-bold mb-4 text-center">{data.companyName} - Double Materiality Matrix</h2>
          
          <div className="flex items-start justify-between gap-6 flex-wrap md:flex-nowrap">
            <div className="w-full md:w-8/12">
              <MaterialityChart issues={validIssues} />
              <div className="mt-4">
                <CategoryLegend />
              </div>
            </div>
            
            <div className="w-full md:w-4/12 space-y-6">
              <MaterialityIssuesSummary issues={validIssues} />
              <KeyInsights issues={validIssues} companyName={data.companyName} />
            </div>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <ExportActions 
              onDownloadPDF={() => handleDownloadPDF(containerRef, validIssues, data.companyName)}
              onPrint={() => handlePrintMatrix(containerRef, validIssues)}
              onSave={() => setIsSaveDialogOpen(true)}
            />
            
            {companyId && (
              <Button 
                variant="outline" 
                onClick={() => setIsApprovalDialogOpen(true)}
              >
                <FileCheck className="mr-2 h-4 w-4" />
                Request Approval
              </Button>
            )}
          </div>
        </div>
        
        {/* Save dialog */}
        <SaveToDeliverableDialog 
          isOpen={isSaveDialogOpen} 
          onClose={() => setIsSaveDialogOpen(false)}
          deliverableName={deliverableName}
          onNameChange={setDeliverableName}
          onSave={() => handleSaveToDeliverables(containerRef, validIssues, data)}
        />
        
        {/* Approval dialog */}
        {companyId && (
          <RequestApprovalDialog
            open={isApprovalDialogOpen}
            onOpenChange={setIsApprovalDialogOpen}
            documentType="materiality_matrix"
            documentId={`materiality_matrix_${Date.now()}`}
            documentTitle={`${data.companyName} - Double Materiality Matrix`}
            companyId={companyId}
          />
        )}
      </div>
    );
  }
);

MatrixContainer.displayName = "MatrixContainer";
