
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues, MaterialityIssue } from "./formSchema";
import { IdentifyIssuesForm } from "./IdentifyIssuesForm";
import { AssessImpactForm } from "./AssessImpactForm";
import { Loader2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface AIMaterialityIssuesProps {
  form: UseFormReturn<MaterialityFormValues>;
  onNext: () => void;
}

export function AIMaterialityIssues({ form, onNext }: AIMaterialityIssuesProps) {
  const [activeStep, setActiveStep] = useState<"identify" | "assess">("identify");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  
  const generateAIMaterialIssues = async () => {
    const companyName = form.getValues("companyName");
    const industry = form.getValues("industry");
    
    if (!companyName) {
      toast({
        title: "Company name required",
        description: "Please enter your company name before generating AI issues",
        variant: "destructive"
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Simulating AI-generated issues (in a real implementation, this would call an AI service)
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const generatedIssues: MaterialityIssue[] = [
        {
          id: crypto.randomUUID(),
          title: "Carbon Footprint Reduction",
          description: "Addressing the organization's greenhouse gas emissions and efforts to reduce its carbon footprint.",
          financialMateriality: 8,
          impactMateriality: 9,
          maturity: 6,
          category: "Environmental"
        },
        {
          id: crypto.randomUUID(),
          title: "Workforce Diversity and Inclusion",
          description: "Ensuring diversity, equity, and inclusion in hiring practices, workplace culture, and leadership positions.",
          financialMateriality: 7,
          impactMateriality: 8,
          maturity: 5,
          category: "Social"
        },
        {
          id: crypto.randomUUID(),
          title: "Ethical Business Practices",
          description: "Maintaining high standards of business ethics, including anti-corruption measures and fair competition practices.",
          financialMateriality: 9,
          impactMateriality: 7,
          maturity: 7,
          category: "Governance"
        },
        {
          id: crypto.randomUUID(),
          title: "Resource Efficiency",
          description: "Managing the use of natural resources, energy efficiency, and waste reduction in operations.",
          financialMateriality: 6,
          impactMateriality: 8,
          maturity: 4,
          category: "Environmental"
        },
        {
          id: crypto.randomUUID(),
          title: "Data Privacy and Security",
          description: "Ensuring proper protection of customer, employee, and organizational data.",
          financialMateriality: 9,
          impactMateriality: 6,
          maturity: 6,
          category: "Governance"
        }
      ];
      
      form.setValue("materialIssues", generatedIssues);
      
      toast({
        title: "Issues generated successfully",
        description: `Generated ${generatedIssues.length} material issues based on your company profile`,
      });
      
      // Move to the assessment step after generating
      setActiveStep("assess");
    } catch (error) {
      console.error("Error generating issues:", error);
      toast({
        title: "Failed to generate issues",
        description: "An error occurred while generating material issues. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {activeStep === "identify" ? "Identify Material Issues" : "Assess Issue Impact"}
        </CardTitle>
        <CardDescription>
          {activeStep === "identify" 
            ? "Identify sustainability issues that are material to your business"
            : "Evaluate the impact of each material issue on your business and stakeholders"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeStep === "identify" && (
          <div className="space-y-6">
            <div className="space-y-4">
              <FormSection title="Company Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="company-name" className="text-sm font-medium">Company Name</label>
                    <Input 
                      id="company-name" 
                      placeholder="Enter company name" 
                      value={form.watch("companyName") || ""}
                      onChange={(e) => form.setValue("companyName", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="industry" className="text-sm font-medium">Industry</label>
                    <Input 
                      id="industry" 
                      placeholder="Enter your industry" 
                      value={form.watch("industry") || ""}
                      onChange={(e) => form.setValue("industry", e.target.value)}
                    />
                  </div>
                </div>
              </FormSection>
              
              <FormSection title="Manual Entry">
                <p className="text-sm text-muted-foreground mb-4">
                  Enter your material issues manually or use our AI assistant to help identify them
                </p>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="custom-issue" className="text-sm font-medium">Add Custom Issue</label>
                    <div className="flex gap-2">
                      <Input 
                        id="custom-issue" 
                        placeholder="Enter issue title" 
                        value={form.watch("customIssueInput") || ""}
                        onChange={(e) => form.setValue("customIssueInput", e.target.value)}
                      />
                      <Button 
                        type="button" 
                        variant="secondary"
                        onClick={() => {
                          const customInput = form.getValues("customIssueInput");
                          if (customInput?.trim()) {
                            const newIssue: MaterialityIssue = {
                              id: crypto.randomUUID(),
                              title: customInput.trim(),
                              description: "",
                              financialMateriality: 5,
                              impactMateriality: 5,
                              maturity: 5,
                              category: "Uncategorized"
                            };
                            
                            const currentIssues = form.getValues("materialIssues") || [];
                            form.setValue("materialIssues", [...currentIssues, newIssue]);
                            form.setValue("customIssueInput", "");
                          }
                        }}
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              </FormSection>
              
              <FormSection title="AI-Generated Issues">
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Our AI can analyze your company profile and suggest material issues relevant to your business and industry.
                  </p>
                  <Button
                    type="button"
                    onClick={generateAIMaterialIssues}
                    disabled={isGenerating}
                    className="w-full sm:w-auto"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Material Issues with AI
                      </>
                    )}
                  </Button>
                </div>
              </FormSection>
              
              {form.watch("materialIssues")?.length > 0 && (
                <FormSection title="Identified Issues">
                  <div className="space-y-2">
                    {form.watch("materialIssues").map((issue, index) => (
                      <div key={issue.id || index} className="flex justify-between items-center border p-3 rounded-md">
                        <div>
                          <p className="font-medium">{issue.title}</p>
                          {issue.category && (
                            <p className="text-xs text-muted-foreground">{issue.category}</p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const currentIssues = form.getValues("materialIssues") || [];
                            form.setValue("materialIssues", currentIssues.filter((_, i) => i !== index));
                          }}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                </FormSection>
              )}
            </div>
          </div>
        )}
        
        {activeStep === "assess" && (
          <AssessImpactForm 
            form={form}
            onPrevious={() => setActiveStep("identify")}
            onNext={onNext}
          />
        )}
      </CardContent>
      {activeStep === "identify" && (
        <CardFooter className="flex justify-between">
          <Button 
            variant="ghost" 
            onClick={() => {
              // Reset form
              form.reset({
                companyName: form.getValues("companyName"),
                industry: form.getValues("industry"),
                materialIssues: [],
                stakeholderFeedback: "",
              });
            }}
          >
            Reset
          </Button>
          <Button
            onClick={() => form.watch("materialIssues")?.length > 0 && setActiveStep("assess")}
            disabled={!form.watch("materialIssues")?.length}
          >
            Next: Assess Impact
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Helper component for form sections
function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3 border p-4 rounded-md">
      <h3 className="font-medium">{title}</h3>
      {children}
    </div>
  );
}
