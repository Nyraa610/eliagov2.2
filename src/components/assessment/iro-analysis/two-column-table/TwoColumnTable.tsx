
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableRow 
} from "@/components/ui/table";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues, IROItem } from "../formSchema";
import { aiService } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";
import { useEngagement } from "@/hooks/useEngagement";
import { useTranslation } from "react-i18next";

// Import components
import { TableHeader } from "./TableHeader";
import { EmptyState } from "./EmptyState";
import { TableToolbar } from "./TableToolbar";
import { RiskOpportunityCard } from "./RiskOpportunityCard";
import { ItemDialog } from "./ItemDialog";
import { AIGenerationDialog } from "./AIGenerationDialog";
import { 
  getRiskScoreColor,
  getImpactLabel,
  getLikelihoodLabel,
  setupItemForEditing,
  prepareItemForSaving,
  parseAIGenerationResult
} from "./utils";

interface TwoColumnTableProps {
  form: UseFormReturn<IROFormValues>;
  openItemDialog: () => void;
  isAddingItem: boolean;
  setIsAddingItem: (value: boolean) => void;
  editingIndex: number | null;
  setEditingIndex: (index: number | null) => void;
}

export function TwoColumnTable({
  form,
  openItemDialog,
  isAddingItem,
  setIsAddingItem,
  editingIndex,
  setEditingIndex
}: TwoColumnTableProps) {
  const { toast } = useToast();
  const { trackActivity } = useEngagement();
  const { t } = useTranslation();
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Get all items from form
  const items = form.watch("items") || [];
  
  // Filter items by type
  const risks = items.filter(item => item.type === "risk");
  const opportunities = items.filter(item => item.type === "opportunity");
  
  // Find the max length of the two arrays for table rendering
  const maxLength = Math.max(risks.length, opportunities.length);
  
  const handleEditItem = (index: number) => {
    setEditingIndex(index);
    setIsAddingItem(true);
  };
  
  const handleRemoveItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    form.setValue("items", newItems);
  };
  
  const handleMoveItem = (index: number, direction: "up" | "down") => {
    if ((direction === "up" && index === 0) || 
        (direction === "down" && index === items.length - 1)) {
      return; // Can't move further up/down
    }
    
    const newItems = [...items];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    
    // Swap items
    [newItems[index], newItems[newIndex]] = [newItems[newIndex], newItems[index]];
    
    form.setValue("items", newItems);
  };
  
  const handleCloseDialog = () => {
    setIsAddingItem(false);
    setEditingIndex(null);
    form.reset(form.getValues());
  };
  
  const handleSaveItem = (values: IROFormValues) => {
    const item = values.currentItem;
    if (!item) return;
    
    const updatedItem = prepareItemForSaving(item);
    
    if (editingIndex !== null) {
      // Update existing item
      const newItems = [...items];
      newItems[editingIndex] = updatedItem;
      form.setValue("items", newItems);
    } else {
      // Add new item
      form.setValue("items", [...items, updatedItem]);
    }
    
    setIsAddingItem(false);
    setEditingIndex(null);
  };
  
  // Setup item for editing or adding
  const setupItemForEditingHandler = (item?: IROItem) => {
    form.setValue("currentItem", setupItemForEditing(item));
  };
  
  // AI Generation handler
  const handleGenerateWithAI = async (context: string) => {
    if (!context.trim()) {
      toast({
        title: t("common.error"),
        description: t("assessment.iroAnalysis.aiGeneration.noContextError"),
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const result = await aiService.generateIROItems(context);
      
      if (!result || !result.result) {
        throw new Error("AI failed to generate items");
      }
      
      const parsedItems = parseAIGenerationResult(result.result);
      
      if (parsedItems.length === 0) {
        throw new Error("No valid items generated");
      }
      
      // Add the generated items to the form
      const currentItems = form.getValues().items || [];
      form.setValue("items", [...currentItems, ...parsedItems]);
      
      // Track activity for AI generation
      trackActivity({
        activity_type: 'use_ai_generator',
        points_earned: 10,
        metadata: { 
          feature: "iro_analysis",
          items_count: parsedItems.length
        }
      });
      
      toast({
        title: t("common.success"),
        description: t("assessment.iroAnalysis.aiGeneration.success", {count: parsedItems.length})
      });
      
      setIsAIDialogOpen(false);
    } catch (error) {
      console.error("Error generating IRO items:", error);
      toast({
        title: t("common.error"),
        description: t("assessment.iroAnalysis.aiGeneration.error"),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <TableToolbar 
        onAddItem={openItemDialog} 
        onGenerateAI={() => setIsAIDialogOpen(true)}
        isGenerating={isGenerating}
      />
      
      {items.length === 0 ? (
        <EmptyState onAddItem={openItemDialog} onGenerateWithAI={() => setIsAIDialogOpen(true)} />
      ) : (
        <Table>
          <TableHeader />
          <TableBody>
            {Array.from({ length: maxLength }).map((_, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                <TableCell>
                  {rowIndex < risks.length && (
                    <RiskOpportunityCard
                      item={risks[rowIndex]}
                      index={items.indexOf(risks[rowIndex])}
                      onEdit={handleEditItem}
                      onRemove={handleRemoveItem}
                      onMove={handleMoveItem}
                      scoreColor={getRiskScoreColor(risks[rowIndex].score)}
                      impactLabel={getImpactLabel(risks[rowIndex].impact)}
                      likelihoodLabel={getLikelihoodLabel(risks[rowIndex].likelihood)}
                    />
                  )}
                </TableCell>
                <TableCell>
                  {rowIndex < opportunities.length && (
                    <RiskOpportunityCard
                      item={opportunities[rowIndex]}
                      index={items.indexOf(opportunities[rowIndex])}
                      onEdit={handleEditItem}
                      onRemove={handleRemoveItem}
                      onMove={handleMoveItem}
                      scoreColor={getRiskScoreColor(opportunities[rowIndex].score)}
                      impactLabel={getImpactLabel(opportunities[rowIndex].impact)}
                      likelihoodLabel={getLikelihoodLabel(opportunities[rowIndex].likelihood)}
                    />
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      
      {/* Item Dialog */}
      <ItemDialog
        open={isAddingItem}
        onOpenChange={setIsAddingItem}
        onClose={handleCloseDialog}
        onSave={handleSaveItem}
        editingIndex={editingIndex}
        form={form}
        setupItemForEditing={setupItemForEditingHandler}
      />
      
      {/* AI Generation Dialog */}
      <AIGenerationDialog
        isOpen={isAIDialogOpen}
        setIsOpen={setIsAIDialogOpen}
        onGenerate={handleGenerateWithAI}
        isGenerating={isGenerating}
      />
    </div>
  );
}
