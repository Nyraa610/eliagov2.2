import { useState, useEffect } from "react";
import { AssessmentBase } from "@/components/assessment/AssessmentBase";
import { useTranslation } from "react-i18next";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { FeatureStatus } from "@/types/training";
import { actionPlanSchema, ActionPlanFormValues } from "@/components/assessment/action-plan/formSchema";
import { ActionPlanTabs } from "@/components/assessment/action-plan/ActionPlanTabs";
import { assessmentService } from "@/services/assessment";
import { useToast } from "@/components/ui/use-toast";
import { engagementService } from "@/services/engagement";

export default function ActionPlan() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("goals");
  const [actionPlanStatus, setActionPlanStatus] = useState<FeatureStatus>("not-started");
  const [progress, setProgress] = useState(0);
  const { toast } = useToast();
  
  // Define tabs to track progress
  const tabs = ["goals", "initiatives", "timeline", "review"];
  const tabWeights = {
    goals: 25,
    initiatives: 25,
    timeline: 25,
    review: 25
  };
  
  // Form definition
  const form = useForm<ActionPlanFormValues>({
    resolver: zodResolver(actionPlanSchema),
    defaultValues: {
      companyName: "",
      shortTermGoals: "",
      midTermGoals: "",
      longTermGoals: "",
      keyInitiatives: "",
      timeline: "",
    },
  });

  // Load saved progress when component mounts
  useEffect(() => {
    const loadSavedProgress = async () => {
      const savedProgress = await assessmentService.getAssessmentProgress('action_plan');
      
      if (savedProgress) {
        setActionPlanStatus(savedProgress.status as FeatureStatus);
        setProgress(savedProgress.progress);
        
        // If there's saved form data, populate the form
        if (savedProgress.form_data) {
          form.reset(savedProgress.form_data);
        }
      }
    };
    
    loadSavedProgress().catch(error => {
      console.error("Error loading action plan progress:", error);
      toast({
        title: "Error",
        description: "Failed to load saved progress",
        variant: "destructive"
      });
    });
  }, [form, toast]);

  // Track form values to update progress
  useEffect(() => {
    const subscription = form.watch((value) => {
      calculateProgress(value as ActionPlanFormValues);
    });
    return () => subscription.unsubscribe();
  }, [form.watch]);

  // Calculate progress based on form completion
  const calculateProgress = (values: ActionPlanFormValues) => {
    let completedWeight = 0;
    
    // Check which sections have data
    if (values.companyName || values.shortTermGoals || values.midTermGoals || values.longTermGoals) {
      completedWeight += tabWeights.goals * getTabCompletion("goals", values);
    }
    
    if (values.keyInitiatives) {
      completedWeight += tabWeights.initiatives * getTabCompletion("initiatives", values);
    }
    
    if (values.timeline) {
      completedWeight += tabWeights.timeline * getTabCompletion("timeline", values);
    }
    
    // Review tab is considered based on overall form completion
    const formCompletion = Object.values(values).filter(Boolean).length / Object.keys(values).length;
    completedWeight += tabWeights.review * formCompletion;
    
    const newProgress = completedWeight;
    setProgress(newProgress);
    
    // Save current form data and progress
    assessmentService.saveAssessmentProgress('action_plan', actionPlanStatus, newProgress, values)
      .catch(error => console.error("Error saving progress:", error));
  };
  
  // Calculate completion percentage for each tab
  const getTabCompletion = (tab: string, values: ActionPlanFormValues) => {
    switch (tab) {
      case "goals":
        const goalFields = [values.companyName, values.shortTermGoals, values.midTermGoals, values.longTermGoals];
        return goalFields.filter(Boolean).length / goalFields.length;
      case "initiatives":
        return values.keyInitiatives ? 1 : 0;
      case "timeline":
        return values.timeline ? 1 : 0;
      default:
        return 0;
    }
  };

  // Handler for tab changes to update status
  const handleTabChange = (tab: string) => {
    // If this is the first tab and status is not-started, change to in-progress
    if (tab === tabs[0] && actionPlanStatus === "not-started") {
      const newStatus: FeatureStatus = "in-progress";
      setActionPlanStatus(newStatus);
      
      // Track starting assessment with engagement service (award 5 points)
      engagementService.trackActivity({
        activity_type: 'start_assessment',
        points_earned: 5,
        metadata: {
          assessment_type: 'action_plan',
          timestamp: new Date().toISOString()
        }
      }).catch(error => {
        console.error("Error tracking action plan start:", error);
      });
      
      assessmentService.saveAssessmentProgress('action_plan', newStatus, progress, form.getValues())
        .catch(error => console.error("Error saving status change:", error));
    }
    
    setActiveTab(tab);
  };

  function onSubmit(values: ActionPlanFormValues) {
    console.log(values);
    const newStatus: FeatureStatus = "waiting-for-approval";
    setActionPlanStatus(newStatus);
    setProgress(100); // Set to 100% on submission
    
    // Save completed form
    assessmentService.saveAssessmentProgress('action_plan', newStatus, 100, values)
      .then(() => {
        toast({
          title: "Success",
          description: "Your action plan has been submitted for approval.",
        });
      })
      .catch(error => {
        console.error("Error saving completed form:", error);
        toast({
          title: "Error",
          description: "Failed to save your action plan",
          variant: "destructive"
        });
      });
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Link to="/assessment" className="text-primary hover:underline flex items-center mb-4">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Assessment
        </Link>
        <h1 className="text-3xl font-bold mb-2">{t("assessment.actionPlan.title")}</h1>
        <p className="text-gray-600">
          {t("assessment.actionPlan.description")}
        </p>
      </div>
      
      <AssessmentBase 
        title={t("assessment.actionPlan.title")} 
        description={t("assessment.actionPlan.description")}
        status={actionPlanStatus}
        progress={progress}
      >
        <ActionPlanTabs
          form={form}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          onSubmit={onSubmit}
        />
      </AssessmentBase>
    </div>
  );
}
