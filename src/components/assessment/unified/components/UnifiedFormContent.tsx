
import { FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UnifiedFormTabs } from "./UnifiedFormTabs";
import { useUnifiedFormContext } from "../context/UnifiedFormContext";
import { Sparkles } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { GamificationFeedback } from "@/components/assessment/unified/GamificationFeedback";

export function UnifiedFormContent() {
  const { 
    form, 
    activeTab, 
    setActiveTab, 
    steps, 
    handleSubmit, 
    isSubmitting,
    formProgress 
  } = useUnifiedFormContext();
  
  const [showCompletionFeedback, setShowCompletionFeedback] = useState(false);
  const { toast } = useToast();
  
  const onSubmitSuccess = () => {
    setShowCompletionFeedback(true);
    toast({
      title: "Assessment Submitted!",
      description: "Your ESG assessment has been successfully submitted.",
    });
  };

  return (
    <>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit, () => {
          toast({
            title: "Form Error",
            description: "Please correct the errors in the form before submitting.",
            variant: "destructive",
          });
        })} className="space-y-6">
          <Card className="p-6">
            <UnifiedFormTabs 
              activeTab={activeTab} 
              setActiveTab={setActiveTab} 
              steps={steps}
              progress={formProgress}
            />
            
            {activeTab === "review" && (
              <div className="flex justify-end mt-6">
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="relative overflow-hidden group"
                >
                  <Sparkles className="h-4 w-4 mr-2 absolute left-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 group-hover:translate-x-2 transition-transform">
                    {isSubmitting ? "Submitting..." : "Submit Assessment"}
                  </span>
                </Button>
              </div>
            )}
          </Card>
        </form>
      </FormProvider>
      
      <GamificationFeedback
        type="assessment"
        message="Congratulations on completing your ESG assessment! This is a significant milestone for your sustainability journey."
        show={showCompletionFeedback}
        points={100}
        onAnimationComplete={() => setShowCompletionFeedback(false)}
      />
    </>
  );
}
