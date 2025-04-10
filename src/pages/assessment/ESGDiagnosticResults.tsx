
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResultsContainer } from "@/components/assessment/results/ResultsContainer";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { assessmentService } from "@/services/assessmentService";
import { useCompanyProfile } from "@/hooks/useCompanyProfile";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ESGDiagnosticResults() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { company } = useCompanyProfile();
  const [results, setResults] = useState<any>({
    scores: [],
    recommendations: []
  });
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch actual results from the backend
        const data = await assessmentService.getAssessmentResults('rse_diagnostic');
        
        // Make sure we have valid data with the expected structure
        if (data && typeof data === 'object') {
          const safeData = {
            scores: Array.isArray(data.scores) ? data.scores : [],
            recommendations: Array.isArray(data.recommendations) ? data.recommendations : []
          };
          setResults(safeData);
        } else {
          // If no valid data, use mock data
          setResults(mockResults);
          console.log("No valid data returned, using mock data");
        }
      } catch (error) {
        console.error("Failed to fetch results:", error);
        toast({
          title: t("common.error"),
          description: t("assessment.results.loadError"),
          variant: "destructive"
        });
        setResults(mockResults); // Fallback to mock data
      } finally {
        setLoading(false);
      }
    };
    
    fetchResults();
  }, [toast, t]);
  
  // Mock data for demonstration
  const mockResults = {
    scores: [
      { category: "Governance", score: 65 },
      { category: "Social", score: 45 },
      { category: "Environmental", score: 72 },
      { category: "Overall", score: 61 }
    ],
    recommendations: [
      "Establish a formal ESG policy and governance structure",
      "Implement an employee well-being program",
      "Set clear environmental targets and track progress"
    ]
  };
  
  const getBarColor = (score: number) => {
    if (score < 40) return "#ef4444"; // Red
    if (score < 70) return "#f59e0b"; // Amber
    return "#22c55e"; // Green
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Ensure we have arrays to work with, even if empty
  const scores = Array.isArray(results.scores) ? results.scores : [];
  const recommendations = Array.isArray(results.recommendations) ? results.recommendations : [];

  return (
    <ResultsContainer
      title={t("assessment.esgDiagnostic.resultsTitle")}
      description={t("assessment.esgDiagnostic.resultsDescription")}
      reportUrl="/reports/esg-diagnostic-report.pdf"
    >
      {company && (
        <div className="mb-6 flex items-center">
          <Avatar className="h-12 w-12 mr-3">
            <AvatarImage src={company.logo_url || undefined} alt={company.name} />
            <AvatarFallback>{company.name.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-lg">{company.name}</h3>
            <p className="text-sm text-muted-foreground">{company.industry}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">{t("assessment.results.scores")}</h3>
          <div className="h-[300px] w-full">
            {scores.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={scores}
                  margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="category" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                  <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]}>
                    {scores.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                <p className="text-gray-500">No score data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">{t("assessment.results.summary")}</h3>
          <p className="mb-4 text-gray-700">
            Your organization shows moderate ESG performance with strong environmental practices but room for improvement in social areas. 
            Governance structures are partially developed and would benefit from further formalization.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">{t("assessment.results.recommendations")}</h3>
          {recommendations.length > 0 ? (
            <ul className="space-y-3 list-disc pl-5">
              {recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="text-gray-700">{recommendation}</li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500 p-4 bg-gray-100 rounded-md">No recommendations available</p>
          )}
        </div>
      </div>
    </ResultsContainer>
  );
}
