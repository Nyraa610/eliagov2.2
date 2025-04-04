
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResultsContainer } from "@/components/assessment/results/ResultsContainer";
import { useToast } from "@/components/ui/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { assessmentService } from "@/services/assessmentService";

export default function ESGDiagnosticResults() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch actual results from the backend
        const data = await assessmentService.getAssessmentResults('rse_diagnostic');
        setResults(data || mockResults);
      } catch (error) {
        console.error("Failed to fetch results:", error);
        toast({
          title: "Error",
          description: "Failed to load assessment results",
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

  return (
    <ResultsContainer
      title={t("assessment.esgDiagnostic.resultsTitle")}
      description={t("assessment.esgDiagnostic.resultsDescription")}
      reportUrl="/reports/esg-diagnostic-report.pdf"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">{t("assessment.results.scores")}</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={results.scores}
                margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="category" />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, "Score"]} />
                <Bar dataKey="score" fill="#8884d8" radius={[4, 4, 0, 0]}>
                  {results.scores.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4">{t("assessment.results.recommendations")}</h3>
          <ul className="space-y-3 list-disc pl-5">
            {results.recommendations.map((recommendation: string, index: number) => (
              <li key={index} className="text-gray-700">{recommendation}</li>
            ))}
          </ul>
        </div>
      </div>
    </ResultsContainer>
  );
}
