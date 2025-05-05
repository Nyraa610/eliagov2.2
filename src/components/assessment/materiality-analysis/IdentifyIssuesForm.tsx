
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues, MaterialityIssue, issueCategories } from "./formSchema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pen, Plus, Trash2, X } from "lucide-react";

interface IdentifyIssuesFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onNext: () => void;
}

export function IdentifyIssuesForm({ form, onNext }: IdentifyIssuesFormProps) {
  const [issuesText, setIssuesText] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentIssue, setCurrentIssue] = useState<MaterialityIssue | null>(null);
  const [editIndex, setEditIndex] = useState<number | null>(null);
  
  // Function to handle adding issues from text to the form
  const handleAddIssues = () => {
    const lines = issuesText.split('\n').filter(line => line.trim().length > 0);
    const issues = lines.map(line => ({
      id: crypto.randomUUID(),
      title: line,
      description: "",
      financialMateriality: 5, // Default value
      impactMateriality: 5, // Default value
      maturity: 5, // Default value
      category: "Environmental" as const // Default category
    }));
    
    if (issues.length > 0) {
      form.setValue("materialIssues", [...form.watch("materialIssues") || [], ...issues]);
      setIssuesText(""); // Clear the textarea after adding issues
    }
  };
  
  // Function to handle removing an issue
  const handleRemoveIssue = (index: number) => {
    const currentIssues = [...form.watch("materialIssues") || []];
    currentIssues.splice(index, 1);
    form.setValue("materialIssues", currentIssues);
  };

  // Function to handle editing an issue
  const handleEditIssue = (issue: MaterialityIssue, index: number) => {
    setCurrentIssue({...issue});
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };

  // Function to save a new issue
  const handleSaveNewIssue = () => {
    if (currentIssue && currentIssue.title) {
      form.setValue("materialIssues", [
        ...(form.watch("materialIssues") || []),
        {
          ...currentIssue,
          id: crypto.randomUUID()
        }
      ]);
      setIsAddDialogOpen(false);
      setCurrentIssue(null);
    }
  };

  // Function to update an edited issue
  const handleUpdateIssue = () => {
    if (currentIssue && editIndex !== null) {
      const currentIssues = [...form.watch("materialIssues") || []];
      currentIssues[editIndex] = currentIssue;
      form.setValue("materialIssues", currentIssues);
      setIsEditDialogOpen(false);
      setCurrentIssue(null);
      setEditIndex(null);
    }
  };
  
  // Initialize new issue form
  const handleOpenAddIssue = () => {
    setCurrentIssue({
      id: undefined,
      title: "",
      description: "",
      financialMateriality: 5,
      impactMateriality: 5,
      maturity: 5,
      category: "Environmental" as const
    });
    setIsAddDialogOpen(true);
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your company name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Material Issues</FormLabel>
          <FormDescription>
            Add material issues individually or enter multiple issues (one per line) in the text area below
          </FormDescription>
          
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Material Issues List</h3>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={handleOpenAddIssue} size="sm" className="flex items-center gap-1">
                  <Plus className="h-4 w-4" /> Add Issue
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New Material Issue</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <label htmlFor="title" className="text-sm font-medium">Title</label>
                    <Input 
                      id="title" 
                      placeholder="Issue title"
                      value={currentIssue?.title || ''}
                      onChange={(e) => setCurrentIssue(prev => prev ? {...prev, title: e.target.value} : null)} 
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="description" className="text-sm font-medium">Description</label>
                    <Textarea 
                      id="description" 
                      placeholder="Issue description" 
                      value={currentIssue?.description || ''}
                      onChange={(e) => setCurrentIssue(prev => prev ? {...prev, description: e.target.value} : null)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                    <Select 
                      value={currentIssue?.category || 'Environmental'}
                      onValueChange={(value) => setCurrentIssue(prev => prev ? {...prev, category: value as any} : null)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueCategories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                  <Button onClick={handleSaveNewIssue}>Save Issue</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {form.watch("materialIssues")?.length > 0 ? (
            <div className="space-y-2">
              {form.watch("materialIssues").map((issue, index) => (
                <Card key={issue.id || index} className="overflow-hidden">
                  <CardHeader className="py-3">
                    <CardTitle className="flex justify-between items-center text-base">
                      <span>{issue.title}</span>
                      <div className="flex gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditIssue(issue, index)}
                          className="h-8 w-8"
                        >
                          <Pen className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleRemoveIssue(index)}
                          className="h-8 w-8 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="py-2 text-sm">
                    <div className="flex justify-between items-center">
                      <div>
                        {issue.description ? (
                          <p className="text-muted-foreground line-clamp-2">{issue.description}</p>
                        ) : (
                          <p className="text-muted-foreground italic">No description</p>
                        )}
                      </div>
                      <div>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          issue.category === 'Environmental' ? 'bg-green-100 text-green-800' :
                          issue.category === 'Social' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {issue.category}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-muted/50">
              <CardContent className="p-4 text-center">
                <p className="text-muted-foreground">No material issues added yet</p>
              </CardContent>
            </Card>
          )}
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Material Issue</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="edit-title" className="text-sm font-medium">Title</label>
                  <Input 
                    id="edit-title" 
                    placeholder="Issue title"
                    value={currentIssue?.title || ''}
                    onChange={(e) => setCurrentIssue(prev => prev ? {...prev, title: e.target.value} : null)} 
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-description" className="text-sm font-medium">Description</label>
                  <Textarea 
                    id="edit-description" 
                    placeholder="Issue description" 
                    value={currentIssue?.description || ''}
                    onChange={(e) => setCurrentIssue(prev => prev ? {...prev, description: e.target.value} : null)}
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="edit-category" className="text-sm font-medium">Category</label>
                  <Select 
                    value={currentIssue?.category || 'Environmental'}
                    onValueChange={(value) => setCurrentIssue(prev => prev ? {...prev, category: value as any} : null)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {issueCategories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleUpdateIssue}>Save Changes</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <div className="rounded-md border mt-4">
            <div className="bg-muted px-4 py-2 border-b">
              <h3 className="text-sm font-medium">Bulk Add Issues</h3>
            </div>
            <div className="p-4 space-y-4">
              <Textarea 
                placeholder="Enter issues, one per line..." 
                className="min-h-[150px]"
                value={issuesText}
                onChange={(e) => setIssuesText(e.target.value)}
              />
              
              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleAddIssues}>
                  Add Issues
                </Button>
                <Button type="button" variant="secondary" onClick={() => {
                  setIssuesText("Climate change impact\nResource depletion\nBiodiversity loss\nEmployee wellbeing\nCommunity relations\nBoard diversity\nRisk management\nEthical business conduct");
                }}>
                  Sample Issues
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button type="button" onClick={onNext}>
            Next: Assess Impact
          </Button>
        </div>
      </form>
    </Form>
  );
}
