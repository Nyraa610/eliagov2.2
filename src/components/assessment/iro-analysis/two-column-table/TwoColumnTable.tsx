
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

// Import components
import { 
  TableHeader, 
  EmptyState, 
  TableToolbar,
  RiskOpportunityCard,
  ItemDialog,
  AIGenerationDialog,
  getRiskScoreColor,
  getImpactLabel,
  getLikelihoodLabel,
  setupItemForEditing,
  prepareItemForSaving,
  parseAIGenerationResult
} from "./";

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
  const handleGenerateWithAI = async (businessContext: string) => {
    try {
      setIsGenerating(true);
      
      const result = await aiService.generateIROAnalysis(businessContext);
      const generatedItems = parseAIGenerationResult(result);
      
      if (generatedItems.length > 0) {
        // Add generated items to existing items
        form.setValue("items", [...items, ...generatedItems]);
        
        toast({
          title: "AI Generation Complete",
          description: `Generated ${generatedItems.length} risks and opportunities.`,
        });
        
        setIsAIDialogOpen(false);
      } else {
        toast({
          title: "AI Generation Issue",
          description: "Could not generate items. Please try again with more detailed context.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Error generating IRO analysis:", error);
      toast({
        title: "Error",
        description: "Failed to generate risks and opportunities. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Render a table row with risk and opportunity side by side
  const renderTableRow = (index: number) => {
    const risk = risks[index];
    const opportunity = opportunities[index];
    
    return (
      <TableRow key={index}>
        {/* Risk Column */}
        <TableCell className="w-1/2 align-top border-r">
          {risk && (
            <RiskOpportunityCard
              item={risk}
              itemIndex={items.indexOf(risk)}
              totalItems={items.length}
              getImpactLabel={(value) => getImpactLabel(value, form.getValues())}
              getLikelihoodLabel={(value) => getLikelihoodLabel(value, form.getValues())}
              getRiskScoreColor={getRiskScoreColor}
              handleEditItem={handleEditItem}
              handleRemoveItem={handleRemoveItem}
              handleMoveItem={handleMoveItem}
              setupItemForEditing={setupItemForEditingHandler}
            />
          )}
        </TableCell>
        
        {/* Opportunity Column */}
        <TableCell className="w-1/2 align-top">
          {opportunity && (
            <RiskOpportunityCard
              item={opportunity}
              itemIndex={items.indexOf(opportunity)}
              totalItems={items.length}
              getImpactLabel={(value) => getImpactLabel(value, form.getValues())}
              getLikelihoodLabel={(value) => getLikelihoodLabel(value, form.getValues())}
              getRiskScoreColor={getRiskScoreColor}
              handleEditItem={handleEditItem}
              handleRemoveItem={handleRemoveItem}
              handleMoveItem={handleMoveItem}
              setupItemForEditing={setupItemForEditingHandler}
            />
          )}
        </TableCell>
      </TableRow>
    );
  };
  
  return (
    <div>
      <TableToolbar 
        onAddItem={() => {
          setupItemForEditingHandler();
          openItemDialog();
        }}
        onGenerateAI={() => setIsAIDialogOpen(true)}
        isGenerating={isGenerating}
      />
      
      <div className="border rounded-md">
        <Table>
          <TableHeader 
            risksCount={risks.length} 
            opportunitiesCount={opportunities.length} 
          />
          <TableBody>
            {maxLength === 0 ? (
              <EmptyState />
            ) : (
              Array.from({ length: maxLength }).map((_, index) => renderTableRow(index))
            )}
          </TableBody>
        </Table>
      </div>
      
      <ItemDialog
        isOpen={isAddingItem}
        setIsOpen={setIsAddingItem}
        form={form}
        onSave={handleSaveItem}
        onCancel={handleCloseDialog}
        editingIndex={editingIndex}
      />
      
      <AIGenerationDialog
        isOpen={isAIDialogOpen}
        setIsOpen={setIsAIDialogOpen}
        onGenerate={handleGenerateWithAI}
        isGenerating={isGenerating}
      />
    </div>
  );
}
