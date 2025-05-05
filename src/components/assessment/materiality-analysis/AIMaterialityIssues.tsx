
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { MaterialityFormValues, MaterialityIssue } from "./formSchema";
import { Loader2, Sparkles, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";

interface AIMaterialityIssuesProps {
  form: UseFormReturn<MaterialityFormValues>;
  onNext: () => void;
}

export function AIMaterialityIssues({ form, onNext }: AIMaterialityIssuesProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [companyContext, setCompanyContext] = useState("");
  const { toast } = useToast();
  const companyName = form.watch("companyName");
  const industry = form.watch("industry");
  const materialIssues = form.watch("materialIssues");
  
  const generateIssues = async () => {
    if (!companyName && !industry && !companyContext) {
      toast({
        title: "More information needed",
        description: "Please provide your company name, industry, or business context to generate relevant ESG issues.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const prompt = `
Generate a comprehensive assessment of ESG (Environmental, Social, Governance) materiality issues for a company with the following details:

${companyName ? `Company Name: ${companyName}` : ''}
${industry ? `Industry: ${industry}` : ''}
${companyContext ? `Business Context: ${companyContext}` : ''}

For each identified materiality issue:
1. Provide a clear title
2. Provide a brief description
3. Assess the financial materiality score (0-10) - how much the issue affects the company's financial performance
4. Assess the impact materiality score (0-10) - how much the company's activities on this issue impact society and environment
5. Indicate which ESG category this issue belongs to (Environmental, Social, Governance, or Economic)

Return the data in this exact JSON format:
[
  {
    "title": "Issue Title",
    "description": "Brief description of the issue",
    "financialMateriality": 7,
    "impactMateriality": 8,
    "category": "Environmental"
  },
  ...more issues
]

Identify 5-10 issues that are most relevant for this company or industry. Ensure a mix of environmental, social and governance issues.
`;

      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'esg-assessment',
          content: prompt,
          analysisType: 'materiality'
        }
      });

      if (error) {
        throw new Error(`Error generating issues: ${error.message}`);
      }

      // Parse the response and extract the issues
      let issues: MaterialityIssue[] = [];
      
      try {
        // Try to parse the result directly as JSON
        if (typeof data.result === 'string') {
          // Extract JSON array if the response is wrapped in text
          const jsonMatch = data.result.match(/\[[\s\S]*\]/);
          if (jsonMatch) {
            issues = JSON.parse(jsonMatch[0]);
          } else {
            throw new Error("Could not extract JSON from response");
          }
        } else {
          issues = data.result;
        }
        
        // Add ID to each issue
        issues = issues.map(issue => ({
          ...issue,
          id: `issue-${Math.random().toString(36).substr(2, 9)}`,
          maturity: Math.floor(Math.random() * 6) + 3 // Random maturity between 3-8
        }));
        
        // Update form with generated issues
        form.setValue("materialIssues", issues);
        
        toast({
          title: "Issues generated successfully",
          description: `${issues.length} materiality issues have been identified for your assessment.`,
        });
      } catch (parseError) {
        console.error("Error parsing AI response:", parseError);
        console.log("AI response:", data.result);
        toast({
          title: "Error parsing response",
          description: "There was an error processing the AI response. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error in AI generation:", error);
      toast({
        title: "Generation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddCustomIssue = () => {
    const customIssue = form.watch("customIssueInput");
    
    if (!customIssue) {
      toast({
        title: "Issue name required",
        description: "Please provide a name for your custom issue.",
        variant: "destructive",
      });
      return;
    }
    
    const newIssue: MaterialityIssue = {
      id: `issue-${Math.random().toString(36).substr(2, 9)}`,
      title: customIssue,
      description: "",
      financialMateriality: 5,
      impactMateriality: 5,
      maturity: 5,
      category: "Custom"
    };
    
    form.setValue("materialIssues", [...materialIssues, newIssue]);
    form.setValue("customIssueInput", "");
    
    toast({
      title: "Custom issue added",
      description: `${customIssue} has been added to your assessment.`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Identify Material Issues</CardTitle>
        <CardDescription>
          Use AI to identify ESG issues relevant to your business or add custom issues
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                placeholder="Your company name"
                {...form.register("companyName")}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                placeholder="Your industry sector"
                {...form.register("industry")}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="companyContext">Business Context (Optional)</Label>
            <Textarea
              id="companyContext"
              placeholder="Provide additional context about your business, operations, or specific ESG concerns..."
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
          
          <Button 
            onClick={generateIssues} 
            className="w-full"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Analyzing your business...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" /> Generate Material Issues with AI
              </>
            )}
          </Button>
        </div>
        
        {materialIssues.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium text-lg">Identified Material Issues</h3>
            <div className="space-y-3">
              {materialIssues.map((issue, index) => (
                <div 
                  key={issue.id || index} 
                  className="border p-3 rounded-md bg-background hover:bg-accent/10"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{issue.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {issue.description || "No description provided"}
                      </p>
                    </div>
                    {issue.category && (
                      <Badge variant="outline" className="ml-2">
                        {issue.category}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Financial Materiality</p>
                      <p className="font-medium">{issue.financialMateriality}/10</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Impact Materiality</p>
                      <p className="font-medium">{issue.impactMateriality}/10</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="border-t pt-4">
          <h3 className="font-medium mb-2">Add Custom Issue</h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter custom issue name"
              {...form.register("customIssueInput")}
            />
            <Button 
              variant="outline" 
              size="icon" 
              onClick={handleAddCustomIssue}
              type="button"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" disabled>
          Previous
        </Button>
        <Button onClick={onNext} disabled={materialIssues.length === 0}>
          Next
        </Button>
      </CardFooter>
    </Card>
  );
}
