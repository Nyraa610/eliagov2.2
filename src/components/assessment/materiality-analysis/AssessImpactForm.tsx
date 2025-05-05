
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues, MaterialityIssue } from "./formSchema";
import { useState } from "react";

interface AssessImpactFormProps {
  form: UseFormReturn<MaterialityFormValues>;
  onPrevious: () => void;
  onNext: () => void;
}

export function AssessImpactForm({ form, onPrevious, onNext }: AssessImpactFormProps) {
  const [selectedIssueIndex, setSelectedIssueIndex] = useState<number | null>(0);
  const issues = form.watch("materialIssues") || [];

  const handleFinancialMaterialityChange = (value: number[]) => {
    if (selectedIssueIndex !== null) {
      const updatedIssues = [...issues];
      updatedIssues[selectedIssueIndex] = {
        ...updatedIssues[selectedIssueIndex],
        financialMateriality: value[0]
      };
      form.setValue("materialIssues", updatedIssues);
    }
  };

  const handleImpactMaterialityChange = (value: number[]) => {
    if (selectedIssueIndex !== null) {
      const updatedIssues = [...issues];
      updatedIssues[selectedIssueIndex] = {
        ...updatedIssues[selectedIssueIndex],
        impactMateriality: value[0]
      };
      form.setValue("materialIssues", updatedIssues);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        {issues.length === 0 ? (
          <div className="p-4 border border-amber-200 bg-amber-50 rounded-md">
            <p className="text-amber-800">No material issues have been identified yet. Please go back and add some issues first.</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-3">Issues to Assess</h3>
              <div className="flex flex-wrap gap-2">
                {issues.map((issue, index) => (
                  <button
                    key={issue.id || index}
                    type="button"
                    onClick={() => setSelectedIssueIndex(index)}
                    className={`px-3 py-1.5 text-sm rounded-full transition ${
                      selectedIssueIndex === index
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted hover:bg-muted/80'
                    }`}
                  >
                    {issue.title}
                  </button>
                ))}
              </div>
            </div>

            {selectedIssueIndex !== null && (
              <div className="p-4 border rounded-md space-y-6">
                <h3 className="font-medium">{issues[selectedIssueIndex]?.title}</h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium mb-2">Financial Materiality (0-10)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low Impact (0)</span>
                        <span>High Impact (10)</span>
                      </div>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        defaultValue={[issues[selectedIssueIndex]?.financialMateriality || 5]}
                        onValueChange={handleFinancialMaterialityChange}
                        aria-label="Financial materiality"
                      />
                      <div className="text-center text-sm font-medium">
                        Current rating: {issues[selectedIssueIndex]?.financialMateriality || 5}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">Impact Materiality (0-10)</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Low Impact (0)</span>
                        <span>High Impact (10)</span>
                      </div>
                      <Slider
                        min={0}
                        max={10}
                        step={1}
                        defaultValue={[issues[selectedIssueIndex]?.impactMateriality || 5]}
                        onValueChange={handleImpactMaterialityChange}
                        aria-label="Impact materiality"
                      />
                      <div className="text-center text-sm font-medium">
                        Current rating: {issues[selectedIssueIndex]?.impactMateriality || 5}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={onPrevious}>
            Previous
          </Button>
          <Button type="button" onClick={onNext} disabled={issues.length === 0}>
            Next: Stakeholder Input
          </Button>
        </div>
      </form>
    </Form>
  );
}
