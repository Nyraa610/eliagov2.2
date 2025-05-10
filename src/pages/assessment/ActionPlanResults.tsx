import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ResultsContainer } from "@/components/assessment/results/ResultsContainer";
import { useToast } from "@/components/ui/use-toast";
import { assessmentService } from "@/services/assessment";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button"; 
import { CalendarDays, CheckCircle2, Clock, Target, FileText, Download } from "lucide-react";

export default function ActionPlanResults() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // Fetch actual results from the backend
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
    ],
    // Add form data from action plan
    formData: {
      shortTermGoals: "Reduce scope 1 emissions by 10% within 1 year",
      midTermGoals: "Achieve 30% renewable energy usage within 2-3 years",
      longTermGoals: "Become carbon neutral by 2030",
      keyInitiatives: "Energy efficiency program, sustainable procurement, waste reduction initiatives"
    }
  };
  
  const handleDownloadReport = async () => {
    try {
      // Create report content based on results
      const reportContent = `
# Action Plan Report
## Goals
${results?.goals?.map((goal: any) => `- ${goal.title} (${goal.timeline}): ${goal.status}`).join('\n') || 'No goals available'}

## Initiatives
${results?.initiatives?.map((initiative: any) => 
  `- ${initiative.title}: ${initiative.description}\n  Status: ${initiative.status}, Completion: ${initiative.completionPercentage}%`
).join('\n\n') || 'No initiatives available'}

## Action Plan Details
- Short-term Goals: ${results?.formData?.shortTermGoals || 'N/A'}
- Mid-term Goals: ${results?.formData?.midTermGoals || 'N/A'}
- Long-term Goals: ${results?.formData?.longTermGoals || 'N/A'}
- Key Initiatives: ${results?.formData?.keyInitiatives || 'N/A'}
`;

      // Create a Blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'action-plan-report.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Success",
        description: "Report downloaded successfully",
      });
    } catch (error) {
      console.error("Failed to download report:", error);
      toast({
        title: "Error",
        description: "Failed to download report",
        variant: "destructive"
      });
    }
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
  const formData = safeResults.formData || {};

  return (
    <ResultsContainer
      title="Action Plan Results"
      description="Review your sustainability action plan with specific goals, initiatives, and timelines."
      reportUrl="#" // We'll handle download with custom function instead
      additionalActions={
        <>
          <Button 
            variant="default" 
            onClick={handleDownloadReport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Download Report
          </Button>
          <Link to="/assessment/document-editor/action-plan">
            <Button variant="default" className="gap-2">
              <FileText className="h-4 w-4" />
              Edit Document
            </Button>
          </Link>
        </>
      }
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-primary" />
            Goals
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
            <div className="text-gray-500 p-4 bg-gray-100 rounded-md">
              <p className="mb-2">No goals from the database yet.</p>
              <p className="text-sm">Form data from action plan:</p>
              <div className="mt-2 pl-3 border-l-2 border-gray-300">
                <p className="text-sm mb-1"><strong>Short-term (1 year):</strong> {formData.shortTermGoals || "Not specified"}</p>
                <p className="text-sm mb-1"><strong>Mid-term (2-3 years):</strong> {formData.midTermGoals || "Not specified"}</p>
                <p className="text-sm"><strong>Long-term (5+ years):</strong> {formData.longTermGoals || "Not specified"}</p>
              </div>
            </div>
          )}
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
            Initiatives
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
            <div className="text-gray-500 p-4 bg-gray-100 rounded-md">
              <p className="mb-2">No initiatives from the database yet.</p>
              <p className="text-sm">Key initiatives from action plan:</p>
              <div className="mt-2 pl-3 border-l-2 border-gray-300">
                <p className="text-sm">{formData.keyInitiatives || "Not specified"}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </ResultsContainer>
  );
}
