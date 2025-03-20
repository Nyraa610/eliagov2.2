
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UseFormReturn, useFieldArray } from "react-hook-form";
import { IROFormValues, IROItem, calculateRiskScore } from "./formSchema";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface AnalysisFormProps {
  form: UseFormReturn<IROFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AnalysisForm({ form, onPrevious, onNext }: AnalysisFormProps) {
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  const { fields, append, update, remove } = useFieldArray({
    control: form.control,
    name: "items",
  });
  
  const handleAddItem = () => {
    setIsAddingItem(true);
    setEditingIndex(null);
  };
  
  const handleEditItem = (index: number) => {
    setIsAddingItem(true);
    setEditingIndex(index);
  };
  
  const handleCloseDialog = () => {
    setIsAddingItem(false);
    setEditingIndex(null);
    form.reset(form.getValues());
  };
  
  const handleSaveItem = (values: IROFormValues) => {
    const item = form.getValues("items")[0] || {
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
      update(editingIndex, updatedItem);
    } else {
      // Add new item
      append(updatedItem);
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
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact, Risks & Opportunities Analysis</CardTitle>
        <CardDescription>
          Identify and assess potential risks and opportunities from your materiality analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4 flex justify-between items-center">
          <h3 className="text-lg font-medium">Items ({fields.length})</h3>
          <Button onClick={handleAddItem} variant="outline" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" /> Add Item
          </Button>
        </div>
        
        {fields.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Impact</TableHead>
                <TableHead>Likelihood</TableHead>
                <TableHead>Score</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((item, index) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.issueTitle}</TableCell>
                  <TableCell>
                    <Badge variant={item.type === "risk" ? "destructive" : "default"}>
                      {item.type === "risk" ? "Risk" : "Opportunity"}
                    </Badge>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{getImpactLabel(item.impact)}</TableCell>
                  <TableCell>{getLikelihoodLabel(item.likelihood)}</TableCell>
                  <TableCell>
                    <Badge className={getRiskScoreColor(item.riskScore || 0)}>
                      {item.riskScore}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleEditItem(index)}
                      >
                        Edit
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 bg-muted/50 rounded-md">
            <p className="text-muted-foreground">No items added yet. Click "Add Item" to start.</p>
          </div>
        )}
        
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
                  name={editingIndex !== null ? `items.${editingIndex}.issueTitle` : "items.0.issueTitle"}
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
                    name={editingIndex !== null ? `items.${editingIndex}.type` : "items.0.type"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <Select 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
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
                    name={editingIndex !== null ? `items.${editingIndex}.category` : "items.0.category"}
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
                  name={editingIndex !== null ? `items.${editingIndex}.description` : "items.0.description"}
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
                    name={editingIndex !== null ? `items.${editingIndex}.impact` : "items.0.impact"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Impact</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value.toString()}
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
                    name={editingIndex !== null ? `items.${editingIndex}.likelihood` : "items.0.likelihood"}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Likelihood</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(Number(value))} 
                          defaultValue={field.value.toString()}
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
                  name={editingIndex !== null ? `items.${editingIndex}.mitigationMeasures` : "items.0.mitigationMeasures"}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mitigation/Enhancement Measures</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe how to mitigate this risk or enhance this opportunity" 
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
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onPrevious}>
          Previous
        </Button>
        <Button onClick={onNext}>
          Continue to Review
        </Button>
      </CardFooter>
    </Card>
  );
}
