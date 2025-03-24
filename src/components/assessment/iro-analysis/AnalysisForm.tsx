
import { UseFormReturn } from "react-hook-form";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TwoColumnTable } from "./two-column-table/TwoColumnTable";
import { IROFormValues } from "./formSchema";
import { assessmentService } from "@/services/assessmentService";
import { FeatureStatus } from "@/types/training";
import { useToast } from "@/components/ui/use-toast";
import { useEngagement } from "@/hooks/useEngagement";
import { useTranslation } from "react-i18next";

interface AnalysisFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onNext: () => void;
  analysisStatus: FeatureStatus;
}

export function AnalysisForm({ form, onPrevious, onNext, analysisStatus }: AnalysisFormProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const { trackActivity } = useEngagement();
  const { t } = useTranslation();
  
  // Function to open dialog for adding new item
  const openItemDialog = () => {
    setIsAddingItem(true);
  };
  
  // Watch for items changes to track activity
  useEffect(() => {
    let previousItemsLength = form.getValues().items?.length || 0;
    
    const subscription = form.watch((value, { name }) => {
      if (name === 'items' || name?.startsWith('items')) {
        const currentItems = form.getValues().items || [];
        
        // If items were added, track this activity
        if (currentItems.length > previousItemsLength) {
          trackActivity({
            activity_type: 'add_iro_item',
            points_earned: 5,
            metadata: { 
              assessment_type: "iro_analysis",
              items_count: currentItems.length
            }
          });
        }
        
        previousItemsLength = currentItems.length;
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, trackActivity]);
  
  // Autosave functionality
  useEffect(() => {
    // Create a debounce function to limit saves
    let saveTimeout: NodeJS.Timeout;
    
    const saveFormData = () => {
      const formData = form.getValues();
      
      assessmentService.saveAssessmentProgress(
        'iro_analysis',
        analysisStatus,
        66, // Progress is 66% when on Analysis tab
        formData
      ).then(() => {
        console.log("IRO analysis data autosaved");
      }).catch(error => {
        console.error("Error autosaving IRO analysis data:", error);
        toast({
          title: t("common.error"),
          description: t("assessment.errorSaving", "Failed to save your progress. Please try again later."),
          variant: "destructive"
        });
      });
    };
    
    // Watch for changes to the items array
    const subscription = form.watch((value, { name }) => {
      // Only trigger save if items change
      if (name && (name.startsWith('items') || name === 'items')) {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(saveFormData, 2000); // Debounce for 2 seconds
      }
    });
    
    // Cleanup function
    return () => {
      subscription.unsubscribe();
      clearTimeout(saveTimeout);
      
      // Save one final time when component unmounts
      saveFormData();
    };
  }, [form, analysisStatus, toast, t]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("assessment.iroAnalysis.title")}</CardTitle>
          <CardDescription>
            {t("assessment.iroAnalysis.description")}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <TwoColumnTable
            form={form}
            openItemDialog={openItemDialog}
            isAddingItem={isAddingItem}
            setIsAddingItem={setIsAddingItem}
            editingIndex={editingIndex}
            setEditingIndex={setEditingIndex}
          />
        </CardContent>
      </Card>
      
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={onPrevious}
        >
          {t("common.previous", "Previous")}
        </Button>
        <Button onClick={onNext}>
          {t("common.next", "Next")}
        </Button>
      </div>
    </div>
  );
}
