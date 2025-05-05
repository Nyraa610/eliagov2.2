
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MaterialityIssue, MaterialityFormValues, issueCategories } from "./formSchema";
import { UseFormReturn } from "react-hook-form";
import { v4 as uuidv4 } from 'uuid';

interface AIMaterialityIssuesProps {
  form: UseFormReturn<MaterialityFormValues>;
  onNext: () => void;
}

export function AIMaterialityIssues({ form, onNext }: AIMaterialityIssuesProps) {
  const [customIssue, setCustomIssue] = useState('');
  const issues = form.watch("materialIssues") || [];
  const setIssues = (newIssues: MaterialityIssue[]) => {
    form.setValue("materialIssues", newIssues);
  };

  const handleAddIssue = () => {
    if (!customIssue.trim()) return;
    
    // Make sure to use a valid category from the issueCategories array
    setIssues([
      ...issues, 
      { 
        id: uuidv4(), 
        title: customIssue, 
        financialMateriality: 5, 
        impactMateriality: 5, 
        category: "Environmental" // Using the enum value directly
      }
    ]);
    setCustomIssue('');
  };

  const handleRemoveIssue = (id: string) => {
    const updatedIssues = issues.filter(issue => issue.id !== id);
    setIssues(updatedIssues);
  };

  const handleCategoryChange = (id: string, category: typeof issueCategories[number]) => {
    const updatedIssues = issues.map(issue => {
      if (issue.id === id) {
        return { ...issue, category };
      }
      return issue;
    });
    setIssues(updatedIssues);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identify Materiality Issues</CardTitle>
        <CardDescription>
          Identify and categorize the materiality issues relevant to your company.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="issue">Add Custom Issue</Label>
          <div className="flex gap-2">
            <Input 
              id="issue" 
              placeholder="Enter issue title" 
              value={customIssue}
              onChange={(e) => setCustomIssue(e.target.value)}
            />
            <Button type="button" onClick={handleAddIssue}>Add</Button>
          </div>
        </div>
        
        {issues.length > 0 ? (
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Identified Issues</h3>
            <ul className="space-y-2">
              {issues.map((issue) => (
                <li key={issue.id} className="flex items-center justify-between border rounded-md p-3">
                  <span>{issue.title}</span>
                  <div className="flex items-center space-x-3">
                    <Select 
                      defaultValue={issue.category}
                      onValueChange={(value) => handleCategoryChange(issue.id as string, value as typeof issueCategories[number])}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {issueCategories.map((category) => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" onClick={() => handleRemoveIssue(issue.id as string)}>
                      Remove
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            No issues identified yet. Add issues to get started.
          </div>
        )}
        
        <div className="flex justify-end">
          <Button onClick={onNext} disabled={issues.length === 0}>
            Next: Stakeholder Input
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
