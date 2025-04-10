
import { IROFormValues, IROItem, calculateRiskScore } from "../formSchema";
import { UseFormReturn } from "react-hook-form";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { v4 as uuidv4 } from "uuid";

interface ItemDialogProps {
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  form: UseFormReturn<IROFormValues>;
  onSave: (values: IROFormValues) => void;
  onCancel: () => void;
  editingIndex: number | null;
  setupItemForEditing: (item?: IROItem) => void;
}

export function ItemDialog({
  isOpen,
  setIsOpen,
  form,
  onSave,
  onCancel,
  editingIndex,
  setupItemForEditing
}: ItemDialogProps) {
  const handleSaveItem = () => {
    // Get the current form values
    const values = form.getValues();
    const currentItem = values.currentItem;
    
    if (!currentItem) return;
    
    // Make sure the item has an ID
    if (!currentItem.id) {
      currentItem.id = uuidv4();
    }
    
    // Calculate risk score
    const riskScore = calculateRiskScore(currentItem.impact, currentItem.likelihood);
    const completeItem = { ...currentItem, riskScore };
    
    // Update existing items array
    const updatedItems = [...(values.items || [])];
    
    if (editingIndex !== null) {
      // Replace existing item
      updatedItems[editingIndex] = completeItem;
    } else {
      // Add new item
      updatedItems.push(completeItem);
    }
    
    // Update the form
    form.setValue('items', updatedItems);
    
    // Call the parent save function
    onSave(form.getValues());
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {editingIndex !== null ? "Edit Item" : "Add New Risk or Opportunity"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={(e) => {
            e.preventDefault();
            handleSaveItem();
          }}>
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
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleSaveItem}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
