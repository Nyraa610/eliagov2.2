
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues } from "./formSchema";
import { useState } from "react";

interface IdentifyIssuesFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onNext: () => void;
}

export function IdentifyIssuesForm({ form, onNext }: IdentifyIssuesFormProps) {
  // State to track issues as a string for the textarea
  const [issuesText, setIssuesText] = useState("");
  
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
      category: "Undefined" // Default category
    }));
    
    if (issues.length > 0) {
      form.setValue("materialIssues", [...form.watch("materialIssues") || [], ...issues]);
    }
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
            Enter material issues (one per line) or use our AI to generate them automatically
          </FormDescription>
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
            <Button type="button" variant="secondary">
              Generate with AI
            </Button>
          </div>
          
          {form.watch("materialIssues")?.length > 0 && (
            <div className="mt-4">
              <h3 className="font-medium mb-2">Added Issues:</h3>
              <ul className="space-y-1 list-disc pl-5">
                {form.watch("materialIssues").map((issue, index) => (
                  <li key={issue.id || index}>{issue.title}</li>
                ))}
              </ul>
            </div>
          )}
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
