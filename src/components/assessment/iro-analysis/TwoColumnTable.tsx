
import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PlusCircle, Trash2, Edit, ArrowUp, ArrowDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { IROFormValues, IROItem, calculateRiskScore } from "./formSchema";

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
    const item = form.getValues("currentItem") || {
      issueTitle: "",
      description: "",
      impact: 1,
      likelihood: 1,
      type: "risk" as const,
      category: "",
      mitigationMeasures: "",
    };
    
    // Calculate risk score
    const riskScore = calculateRiskScore(item.impact, item.likelihood);
    const updatedItem = { ...item, riskScore };
    
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
  
  const getRiskScoreColor = (score: number) => {
    if (score <= 3) return "bg-green-100 text-green-800";
    if (score <= 6) return "bg-yellow-100 text-yellow-800";
    if (score <= 8) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };
  
  const getImpactLabel = (value: number) => {
    const scale = form.getValues().methodology.impactScale;
    return scale.find(item => item.value === value)?.label || value.toString();
  };
  
  const getLikelihoodLabel = (value: number) => {
    const scale = form.getValues().methodology.likelihoodScale;
    return scale.find(item => item.value === value)?.label || value.toString();
  };
  
  // Setup item for editing or adding
  const setupItemForEditing = (item?: IROItem) => {
    const defaultItem = {
      issueTitle: "",
      description: "",
      impact: 1,
      likelihood: 1,
      type: "risk" as const,
      category: "",
      mitigationMeasures: "",
    };
    
    form.setValue("currentItem", item || defaultItem);
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
            <div className="p-2 rounded-md bg-muted/30 mb-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{risk.issueTitle}</h4>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMoveItem(items.indexOf(risk), "up")}
                    disabled={items.indexOf(risk) === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMoveItem(items.indexOf(risk), "down")}
                    disabled={items.indexOf(risk) === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setupItemForEditing(risk);
                      handleEditItem(items.indexOf(risk));
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveItem(items.indexOf(risk))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                <Badge variant="destructive">Risk</Badge>
                <Badge variant="outline">{risk.category}</Badge>
                <Badge className={getRiskScoreColor(risk.riskScore || 0)}>
                  Score: {risk.riskScore}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{risk.description}</p>
              <div className="text-sm">
                <span className="font-medium">Impact:</span> {getImpactLabel(risk.impact)} · 
                <span className="font-medium"> Likelihood:</span> {getLikelihoodLabel(risk.likelihood)}
              </div>
              {risk.mitigationMeasures && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-sm font-medium">Mitigation Measures:</p>
                  <p className="text-sm text-muted-foreground">{risk.mitigationMeasures}</p>
                </div>
              )}
            </div>
          )}
        </TableCell>
        
        {/* Opportunity Column */}
        <TableCell className="w-1/2 align-top">
          {opportunity && (
            <div className="p-2 rounded-md bg-muted/30 mb-2">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium">{opportunity.issueTitle}</h4>
                <div className="flex gap-1">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMoveItem(items.indexOf(opportunity), "up")}
                    disabled={items.indexOf(opportunity) === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleMoveItem(items.indexOf(opportunity), "down")}
                    disabled={items.indexOf(opportunity) === items.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => {
                      setupItemForEditing(opportunity);
                      handleEditItem(items.indexOf(opportunity));
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleRemoveItem(items.indexOf(opportunity))}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                <Badge>Opportunity</Badge>
                <Badge variant="outline">{opportunity.category}</Badge>
                <Badge className={getRiskScoreColor(opportunity.riskScore || 0)}>
                  Score: {opportunity.riskScore}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2">{opportunity.description}</p>
              <div className="text-sm">
                <span className="font-medium">Impact:</span> {getImpactLabel(opportunity.impact)} · 
                <span className="font-medium"> Likelihood:</span> {getLikelihoodLabel(opportunity.likelihood)}
              </div>
              {opportunity.mitigationMeasures && (
                <div className="mt-2 border-t pt-2">
                  <p className="text-sm font-medium">Enhancement Measures:</p>
                  <p className="text-sm text-muted-foreground">{opportunity.mitigationMeasures}</p>
                </div>
              )}
            </div>
          )}
        </TableCell>
      </TableRow>
    );
  };
  
  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={() => {
          setupItemForEditing();
          openItemDialog();
        }} variant="outline" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" /> Add Item
        </Button>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-1/2 text-center bg-red-50 text-red-800 border-r">
                Risks ({risks.length})
              </TableHead>
              <TableHead className="w-1/2 text-center bg-green-50 text-green-800">
                Opportunities ({opportunities.length})
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {maxLength === 0 ? (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-8">
                  <p className="text-muted-foreground">No items added yet. Click "Add Item" to start.</p>
                </TableCell>
              </TableRow>
            ) : (
              Array.from({ length: maxLength }).map((_, index) => renderTableRow(index))
            )}
          </TableBody>
        </Table>
      </div>
      
      <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>
              {editingIndex !== null ? "Edit Item" : "Add New Risk or Opportunity"}
            </DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control}
                name="currentItem.issueTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentItem.type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="risk">Risk</SelectItem>
                          <SelectItem value="opportunity">Opportunity</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currentItem.category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="E.g., Environmental, Social" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="currentItem.description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the risk or opportunity" 
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="currentItem.impact"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impact</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select impact" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.getValues().methodology.impactScale.map((scale) => (
                            <SelectItem key={scale.value} value={scale.value.toString()}>
                              {scale.label} ({scale.value})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="currentItem.likelihood"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Likelihood</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(Number(value))} 
                        value={field.value.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select likelihood" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {form.getValues().methodology.likelihoodScale.map((scale) => (
                            <SelectItem key={scale.value} value={scale.value.toString()}>
                              {scale.label} ({scale.value})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="currentItem.mitigationMeasures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {form.watch("currentItem.type") === "risk" 
                        ? "Mitigation Measures" 
                        : "Enhancement Measures"}
                    </FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder={form.watch("currentItem.type") === "risk"
                          ? "Describe how to mitigate this risk"
                          : "Describe how to enhance this opportunity"
                        }
                        className="min-h-[100px]" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={() => handleSaveItem(form.getValues())}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
