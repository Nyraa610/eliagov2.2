
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResultsContainer } from "@/components/assessment/results/ResultsContainer";
import { useToast } from "@/components/ui/use-toast";
import { assessmentService } from "@/services/assessmentService";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { Link } from "react-router-dom"; 
import { CalendarDays, CheckCircle2, Clock, Target, FileText } from "lucide-react";

export default function ActionPlanResults() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch actual results from the backend
        const data = await assessmentService.getAssessmentResults('action_plan');
        
        if (data && typeof data === 'object') {
          setResults(data);
        } else {
          setResults(mockResults); // Fallback to mock data
          console.log("No valid data returned, using mock data");
        }
      } catch (error) {
        console.error("Failed to fetch results:", error);
        toast({
          title: "Error",
          description: "Failed to load action plan results",
          variant: "destructive"
        });
        setResults(mockResults); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [toast]);
  
  // Mock data for demonstration
  const mockResults = {
    goals: [
      { id: 1, title: "Reduce carbon emissions by 30%", timeline: "2026", status: "in-progress" },
      { id: 2, title: "Implement sustainable procurement policy", timeline: "2024", status: "completed" },
      { id: 3, title: "Achieve zero waste in operations", timeline: "2027", status: "not-started" }
    ],
    initiatives: [
      { 
        id: 1, 
        title: "Energy Efficiency Program", 
        description: "Upgrade facilities with energy-efficient equipment and lighting", 
        startDate: "2023-10-01", 
        endDate: "2024-06-30",
        status: "in-progress",
        completionPercentage: 45,
        owner: "Operations Team"
      },
      { 
        id: 2, 
        title: "Supplier Code of Conduct", 
        description: "Develop and implement a sustainability code of conduct for all suppliers", 
        startDate: "2023-07-15", 
        endDate: "2023-12-31",
        status: "completed",
        completionPercentage: 100,
        owner: "Procurement Team"
      },
      { 
        id: 3, 
        title: "Waste Reduction Initiative", 
        description: "Implement comprehensive recycling and composting programs", 
        startDate: "2024-01-01", 
        endDate: "2024-12-31",
        status: "not-started",
        completionPercentage: 0,
        owner: "Sustainability Committee"
      }
    ]
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "not-started": return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use safe defaults if data is missing
  const safeResults = results || mockResults;
  const goals = Array.isArray(safeResults.goals) ? safeResults.goals : [];
  const initiatives = Array.isArray(safeResults.initiatives) ? safeResults.initiatives : [];

  return (
    <ResultsContainer
      title={t("assessment.actionPlan.resultsTitle")}
      description={t("assessment.actionPlan.resultsDescription")}
      reportUrl="/reports/action-plan-report.pdf"
      additionalActions={
        <Link to="/assessment/document-editor/action-plan">
          <Button variant="default" className="gap-2">
            <FileText className="h-4 w-4" />
            {t("assessment.results.editDocument")}
          </Button>
        </Link>
      }
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            {t("assessment.actionPlan.goals")}
          </h3>
          {goals.length > 0 ? (
            <div className="grid gap-4">
              {goals.map((goal: any) => (
                <div key={goal.id || `goal-${Math.random()}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>Target: {goal.timeline}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(goal.status)}>
                      {goal.status === "completed" ? "Completed" : 
                       goal.status === "in-progress" ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 p-4 bg-gray-100 rounded-md">No goals available</p>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
            {t("assessment.actionPlan.initiatives")}
          </h3>
          {initiatives.length > 0 ? (
            <div className="space-y-6">
              {initiatives.map((initiative: any) => (
                <div key={initiative.id || `initiative-${Math.random()}`} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-medium">{initiative.title}</h4>
                    <Badge className={getStatusColor(initiative.status)}>
                      {initiative.status === "completed" ? "Completed" : 
                       initiative.status === "in-progress" ? "In Progress" : "Not Started"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{initiative.description}</p>
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <CalendarDays className="h-4 w-4 mr-1" />
                    <span>
                      {initiative.startDate && initiative.endDate ? 
                        `${new Date(initiative.startDate).toLocaleDateString()} - ${new Date(initiative.endDate).toLocaleDateString()}` :
                        "Dates not specified"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Owner: {initiative.owner || "Not assigned"}</span>
                    <span>{initiative.completionPercentage || 0}% complete</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${initiative.completionPercentage || 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 p-4 bg-gray-100 rounded-md">No initiatives available</p>
          )}
        </div>
      </div>
    </ResultsContainer>
  );
}
