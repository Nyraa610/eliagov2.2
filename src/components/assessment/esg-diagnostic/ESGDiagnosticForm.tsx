
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { ArrowRight, ArrowLeft, Save, FileCheck, Building2, Leaf, Users, ShieldCheck } from "lucide-react";
import { ESGFormValues, esgFormSchema } from "./ESGFormSchema";
import { CompanyContextForm } from "./CompanyContextForm";
import { EnvironmentalForm } from "./EnvironmentalForm";
import { SocialForm } from "./SocialForm";
import { GovernanceForm } from "./GovernanceForm";
import { GoalsForm } from "./GoalsForm";
import { supabase } from "@/lib/supabase";

interface ESGDiagnosticFormProps {
  onSubmit: (values: ESGFormValues) => void;
  onAnalysisComplete: (analysisResult: string) => void;
}

export function ESGDiagnosticForm({ onSubmit, onAnalysisComplete }: ESGDiagnosticFormProps) {
  const [activeTab, setActiveTab] = useState("company");
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<ESGFormValues>({
    resolver: zodResolver(esgFormSchema),
    defaultValues: {
      companyName: "",
      industry: "",
      employeeCount: "",
      wasteManagement: "",
      carbonFootprint: "",
      renewableEnergy: "",
      employeeWellbeing: "",
      communityEngagement: "",
      diversityInitiatives: "",
      independentBoard: "",
      transparencyPractices: "",
      ethicalDecisionMaking: "",
      mainGoals: "",
      existingInitiatives: "",
    },
  });

  const handleTabChange = (value: string) => {
    // Save current form state before changing tabs
    setActiveTab(value);
  };

  const navigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  const handleFormSubmit = async (values: ESGFormValues) => {
    setIsSubmitting(true);
    try {
      // Save form data to Supabase
      const { data: session } = await supabase.auth.getSession();
      const userId = session?.session?.user.id;
      
      if (!userId) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your diagnostic.",
          variant: "destructive"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Convert form values to content for analysis
      const contentForAnalysis = generateContentForAnalysis(values);
      
      // Call the parent onSubmit to process the form submission
      onSubmit(values);
      
      // Perform AI analysis on the form data
      const { data, error } = await supabase.functions.invoke('ai-analysis', {
        body: {
          type: 'esg-assessment',
          content: contentForAnalysis
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Call the callback with the analysis result
      if (data && data.result) {
        onAnalysisComplete(data.result);
      }
      
      toast({
        title: "ESG Diagnostic submitted",
        description: "Your assessment has been saved and analyzed successfully."
      });
    } catch (error) {
      console.error("Error submitting ESG diagnostic:", error);
      toast({
        title: "Submission failed",
        description: error instanceof Error ? error.message : "An error occurred during submission",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Function to format form data for API analysis
  const generateContentForAnalysis = (values: ESGFormValues): string => {
    return `
Company: ${values.companyName}
Industry: ${values.industry}
Size: ${values.employeeCount} employees

EXISTING INITIATIVES:
${values.existingInitiatives || "No information provided"}

MAIN GOALS:
${values.mainGoals || "No information provided"}

ENVIRONMENTAL PRACTICES:
- Waste Management & Emissions: ${values.wasteManagement || "No information provided"}
- Carbon Footprint Measurement: ${values.carbonFootprint || "No information provided"}
- Renewable Energy: ${values.renewableEnergy || "No information provided"}

SOCIAL RESPONSIBILITY:
- Employee Wellbeing: ${values.employeeWellbeing || "No information provided"}
- Community Engagement: ${values.communityEngagement || "No information provided"}
- Diversity & Inclusion: ${values.diversityInitiatives || "No information provided"}

GOVERNANCE:
- Independent Board: ${values.independentBoard || "No information provided"}
- Transparency Practices: ${values.transparencyPractices || "No information provided"}
- Ethical Decision Making: ${values.ethicalDecisionMaking || "No information provided"}
`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>ESG Diagnostic Assessment</CardTitle>
        <CardDescription>
          Complete this assessment to evaluate your company's Environmental, Social, and Governance practices
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid grid-cols-5 mb-4">
            <TabsTrigger value="company" className="flex items-center gap-1">
              <Building2 className="h-4 w-4" /> Company
            </TabsTrigger>
            <TabsTrigger value="environmental" className="flex items-center gap-1">
              <Leaf className="h-4 w-4" /> Environmental
            </TabsTrigger>
            <TabsTrigger value="social" className="flex items-center gap-1">
              <Users className="h-4 w-4" /> Social
            </TabsTrigger>
            <TabsTrigger value="governance" className="flex items-center gap-1">
              <ShieldCheck className="h-4 w-4" /> Governance
            </TabsTrigger>
            <TabsTrigger value="goals" className="flex items-center gap-1">
              <FileCheck className="h-4 w-4" /> Goals
            </TabsTrigger>
          </TabsList>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleFormSubmit)}>
              <TabsContent value="company" className="space-y-4 pt-4">
                <CompanyContextForm 
                  form={form} 
                  onNext={() => navigateToTab("environmental")} 
                />
              </TabsContent>
              
              <TabsContent value="environmental" className="space-y-4 pt-4">
                <EnvironmentalForm 
                  form={form} 
                  onNext={() => navigateToTab("social")} 
                  onPrev={() => navigateToTab("company")} 
                />
              </TabsContent>
              
              <TabsContent value="social" className="space-y-4 pt-4">
                <SocialForm 
                  form={form} 
                  onNext={() => navigateToTab("governance")} 
                  onPrev={() => navigateToTab("environmental")} 
                />
              </TabsContent>
              
              <TabsContent value="governance" className="space-y-4 pt-4">
                <GovernanceForm 
                  form={form} 
                  onNext={() => navigateToTab("goals")} 
                  onPrev={() => navigateToTab("social")} 
                />
              </TabsContent>
              
              <TabsContent value="goals" className="space-y-4 pt-4">
                <GoalsForm 
                  form={form} 
                  onPrev={() => navigateToTab("governance")}
                  isSubmitting={isSubmitting}
                />
              </TabsContent>
            </form>
          </Form>
        </Tabs>
      </CardContent>
    </Card>
  );
}
