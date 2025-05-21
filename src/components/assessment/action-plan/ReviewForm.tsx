
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketplaceRecommendations } from "@/components/marketplace/MarketplaceRecommendations";
import { ActionPlanFormValues } from "./formSchema";
import { ArrowRight, Check, Lightbulb, Target } from "lucide-react";

interface ReviewFormProps {
  form: UseFormReturn<ActionPlanFormValues>;
  onPrevious: () => void;
  onSubmit: (values: ActionPlanFormValues) => void;
}

export function ReviewForm({ form, onPrevious, onSubmit }: ReviewFormProps) {
  const watchedValues = form.watch();
  const initialValues = form.getValues();
  
  const handleSubmit = () => {
    onSubmit(initialValues);
  };

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Review Your Action Plan</h2>
        <p className="text-gray-600">
          Review your ESG action plan before submitting. You can go back to any section to make changes.
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                ESG Goals
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium">Company</h4>
                <p className="text-sm text-gray-600">{watchedValues.companyName}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium">Short-term Goals</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{watchedValues.shortTermGoals}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium">Mid-term Goals</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{watchedValues.midTermGoals}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium">Long-term Goals</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{watchedValues.longTermGoals}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-primary" />
                Key Initiatives & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1">
                <h4 className="font-medium">Key Initiatives</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{watchedValues.keyInitiatives}</p>
              </div>
              
              <div className="space-y-1">
                <h4 className="font-medium">Timeline</h4>
                <p className="text-sm text-gray-600 whitespace-pre-line">{watchedValues.timeline}</p>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-between">
            <Button variant="outline" onClick={onPrevious}>Previous</Button>
            <Button onClick={handleSubmit} className="gap-2">
              <Check className="h-4 w-4" />
              Submit Action Plan
            </Button>
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <MarketplaceRecommendations actionPlanData={watchedValues} className="h-full" />
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <h3 className="font-medium text-blue-700 mb-2">Need implementation help?</h3>
            <p className="text-sm text-blue-600 mb-4">
              Connect with verified solution providers to help implement your action plan
            </p>
            <Button variant="outline" className="w-full bg-white" asChild>
              <a href="/marketplace" className="flex items-center justify-center gap-1.5">
                Browse All Partners
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
