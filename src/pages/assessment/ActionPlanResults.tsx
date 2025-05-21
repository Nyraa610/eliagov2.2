
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Download, ExternalLink } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assessmentService } from "@/services/assessment";
import { MarketplaceRecommendations } from "@/components/marketplace/MarketplaceRecommendations";

export default function ActionPlanResults() {
  const [actionPlanData, setActionPlanData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadActionPlanData = async () => {
      try {
        setIsLoading(true);
        const data = await assessmentService.getAssessmentProgress('action_plan');
        if (data?.form_data) {
          setActionPlanData(data.form_data);
        }
      } catch (error) {
        console.error("Error loading action plan data:", error);
        toast({
          title: "Error",
          description: "Failed to load action plan data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadActionPlanData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!actionPlanData) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-6">
          <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
          </Link>
          <h1 className="text-3xl font-bold mb-2">Action Plan Results</h1>
        </div>
        
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-xl font-medium mb-4">No action plan found</h2>
            <p className="text-gray-500 mb-6">You haven't created an action plan yet.</p>
            <Button asChild>
              <Link to="/assessment/action-plan">Create Action Plan</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <h1 className="text-3xl font-bold mb-2">Action Plan Results</h1>
        <p className="text-gray-600">
          Review your ESG action plan and next steps
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Action Plan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Company</h3>
                <p className="text-gray-700">{actionPlanData.companyName || "Your Company"}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Short-term Goals</h3>
                <p className="text-gray-700 whitespace-pre-line">{actionPlanData.shortTermGoals}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Mid-term Goals</h3>
                <p className="text-gray-700 whitespace-pre-line">{actionPlanData.midTermGoals}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Long-term Goals</h3>
                <p className="text-gray-700 whitespace-pre-line">{actionPlanData.longTermGoals}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Key Initiatives</h3>
                <p className="text-gray-700 whitespace-pre-line">{actionPlanData.keyInitiatives}</p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Timeline</h3>
                <p className="text-gray-700 whitespace-pre-line">{actionPlanData.timeline}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Action Plan
            </Button>
            <Button variant="outline" asChild>
              <Link to="/assessment/action-plan" className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Edit Action Plan
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/integrations/action-plan-export" className="flex items-center gap-2">
                <ExternalLink className="h-4 w-4" />
                Export to Notion
              </Link>
            </Button>
          </div>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <MarketplaceRecommendations 
            actionPlanData={actionPlanData} 
            className="h-full"
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Next Steps</CardTitle>
              <CardDescription>
                Continue your sustainability journey
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="font-bold text-primary">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Explore solution providers</p>
                    <p className="text-sm text-muted-foreground">
                      Contact recommended partners
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="font-bold text-primary">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Set implementation timeline</p>
                    <p className="text-sm text-muted-foreground">
                      Create detailed milestones
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="font-bold text-primary">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Monitor progress</p>
                    <p className="text-sm text-muted-foreground">
                      Track and report on key metrics
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button asChild variant="outline" className="w-full">
                  <Link to="/marketplace">Browse All Partners</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
