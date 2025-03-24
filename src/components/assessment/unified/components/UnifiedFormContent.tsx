
import React, { useState } from "react";
import { Form } from "@/components/ui/form";
import { TabsContent } from "@/components/ui/tabs";
import { useUnifiedForm } from "../context/UnifiedFormContext";
import { CompanyContextForm } from "../../esg-diagnostic/CompanyContextForm";
import { EnvironmentalForm } from "../../esg-diagnostic/EnvironmentalForm";
import { SocialForm } from "../../esg-diagnostic/SocialForm";
import { GovernanceForm } from "../../esg-diagnostic/GovernanceForm";
import { GoalsForm } from "../../esg-diagnostic/GoalsForm";
import { GamificationFeedback } from "../GamificationFeedback";
import { useEngagement } from "@/hooks/useEngagement";
import { useToast } from "@/components/ui/use-toast";

export function UnifiedFormContent() {
  const { form, onSubmit, isSubmitting, onTabChange } = useUnifiedForm();
  const { trackActivity } = useEngagement();
  const { celebrateCompletion } = useToast();
  const [showCelebration, setShowCelebration] = useState({
    environmental: false,
    social: false,
    governance: false,
    goals: false
  });
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [celebrationType, setCelebrationType] = useState<'section' | 'assessment' | 'milestone'>('section');
  
  const handleTabCompletion = (tab: string, nextTab: string) => {
    // Track completion of each section
    trackActivity({
      activity_type: 'complete_assessment_section',
      points_earned: 10,
      metadata: { section: tab }
    });
    
    // Set celebration message based on tab
    const messages = {
      company: "You've completed the company context section!",
      environmental: "Environmental section complete! Keep going!",
      social: "Social responsibility section finished!",
      governance: "Governance section complete! Almost there!",
      goals: "You've completed all sections of the assessment!"
    };
    
    setCelebrationMessage(messages[tab as keyof typeof messages]);
    setCelebrationType(tab === 'goals' ? 'assessment' : 'section');
    
    // Show celebration only for completed tabs (not the first tab)
    if (tab !== 'company') {
      setShowCelebration({ ...showCelebration, [tab]: true });
      celebrateCompletion(
        tab === 'goals' ? "Assessment Completed!" : "Section Complete!",
        tab === 'goals' ? "You've finished the entire assessment. Great job!" : `${tab} section completed successfully!`
      );
    }
    
    // Navigate to next tab
    onTabChange(nextTab);
  };
  
  const handleCelebrationComplete = () => {
    setShowCelebration({
      environmental: false,
      social: false,
      governance: false,
      goals: false
    });
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <TabsContent value="company" className="space-y-4 pt-4">
            <CompanyContextForm 
              form={form} 
              onNext={() => handleTabCompletion("company", "environmental")} 
            />
          </TabsContent>
          
          <TabsContent value="environmental" className="space-y-4 pt-4">
            <EnvironmentalForm 
              form={form} 
              onNext={() => handleTabCompletion("environmental", "social")} 
              onPrev={() => onTabChange("company")} 
            />
          </TabsContent>
          
          <TabsContent value="social" className="space-y-4 pt-4">
            <SocialForm 
              form={form} 
              onNext={() => handleTabCompletion("social", "governance")} 
              onPrev={() => onTabChange("environmental")} 
            />
          </TabsContent>
          
          <TabsContent value="governance" className="space-y-4 pt-4">
            <GovernanceForm 
              form={form} 
              onNext={() => handleTabCompletion("governance", "goals")} 
              onPrev={() => onTabChange("social")} 
            />
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4 pt-4">
            <GoalsForm 
              form={form} 
              onPrev={() => onTabChange("governance")}
              isSubmitting={isSubmitting}
            />
          </TabsContent>
        </form>
      </Form>
      
      {/* Celebration Feedback for tab completions */}
      {(showCelebration.environmental || 
        showCelebration.social || 
        showCelebration.governance || 
        showCelebration.goals) && (
        <GamificationFeedback
          type={celebrationType}
          message={celebrationMessage}
          show={true}
          points={celebrationType === 'assessment' ? 50 : 10}
          onAnimationComplete={handleCelebrationComplete}
        />
      )}
    </>
  );
}
