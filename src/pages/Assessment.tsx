
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ESGAnalysis } from "@/components/ai/ESGAnalysis";
import { Clipboard, FileText, Sparkles } from "lucide-react";

export default function Assessment() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("assessment");

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Authentication required",
          description: "Please sign in to access the assessment.",
        });
        navigate("/register");
      }
    };

    checkAuth();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sage-light/10 to-mediterranean-light/10">
      <Navigation />
      
      <main className="container mx-auto px-4 py-24">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-3xl font-bold text-primary">ESG Assessment</h1>
          <p className="text-gray-600">
            Start your sustainability journey by completing our comprehensive ESG assessment.
          </p>
          
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="assessment">
                <Clipboard className="mr-2 h-4 w-4" />
                Assessment Form
              </TabsTrigger>
              <TabsTrigger value="ai-analysis">
                <Sparkles className="mr-2 h-4 w-4" />
                AI Analysis
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="assessment" className="pt-6">
              <Card>
                <CardHeader>
                  <CardTitle>ESG Assessment Form</CardTitle>
                  <CardDescription>
                    Complete the questionnaire to evaluate your company's ESG performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    The assessment form will be implemented here. For now, you can use the AI Analysis tool
                    to get insights about your ESG practices.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="ai-analysis" className="pt-6">
              <ESGAnalysis />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
