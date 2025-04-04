
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResultsContainer } from "@/components/assessment/results/ResultsContainer";
import { useToast } from "@/components/ui/use-toast";
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from "recharts";
import { assessmentService } from "@/services/assessmentService";

export default function CarbonEvaluationResults() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch actual results from the backend
        const data = await assessmentService.getAssessmentResults('carbon_evaluation');
        
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
          description: "Failed to load carbon evaluation results",
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
    totalEmissions: 45.7, // in tonnes CO2e
    emissionsByScope: [
      { name: "Scope 1", value: 12.3 },
      { name: "Scope 2", value: 18.4 },
      { name: "Scope 3", value: 15.0 }
    ],
    emissionsBySource: [
      { name: "Electricity", value: 15.2 },
      { name: "Natural Gas", value: 8.3 },
      { name: "Transportation", value: 10.8 },
      { name: "Purchased Goods", value: 7.1 },
      { name: "Waste", value: 4.3 }
    ],
    reductionPotential: 18.5, // tonnes CO2e
    recommendations: [
      "Switch to renewable energy sources",
      "Implement a company-wide travel policy",
      "Engage with suppliers on reducing their emissions"
    ]
  };
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28BFC'];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Use safe defaults if data is missing
  const safeResults = results || mockResults;
  const emissionsByScope = Array.isArray(safeResults.emissionsByScope) ? safeResults.emissionsByScope : [];
  const emissionsBySource = Array.isArray(safeResults.emissionsBySource) ? safeResults.emissionsBySource : [];
  const recommendations = Array.isArray(safeResults.recommendations) ? safeResults.recommendations : [];

  return (
    <ResultsContainer
      title={t("assessment.carbonEvaluation.resultsTitle")}
      description={t("assessment.carbonEvaluation.resultsDescription")}
      reportUrl="/reports/carbon-evaluation-report.pdf"
    >
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("assessment.carbonEvaluation.totalEmissions")}</p>
            <p className="text-3xl font-bold text-green-700">{safeResults.totalEmissions || 0} <span className="text-lg">tCO2e</span></p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("assessment.carbonEvaluation.reductionPotential")}</p>
            <p className="text-3xl font-bold text-blue-700">{safeResults.reductionPotential || 0} <span className="text-lg">tCO2e</span></p>
          </div>
          <div className="bg-amber-50 rounded-lg p-4 text-center">
            <p className="text-sm text-gray-500 mb-1">{t("assessment.carbonEvaluation.reductionPercentage")}</p>
            <p className="text-3xl font-bold text-amber-700">
              {safeResults.totalEmissions && safeResults.reductionPotential 
                ? Math.round((safeResults.reductionPotential / safeResults.totalEmissions) * 100)
                : 0}%
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{t("assessment.carbonEvaluation.emissionsByScope")}</h3>
            <div className="h-[300px]">
              {emissionsByScope.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emissionsByScope}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emissionsByScope.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} tCO2e`, "Emissions"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                  <p className="text-gray-500">No emissions data available</p>
                </div>
              )}
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-medium mb-4">{t("assessment.carbonEvaluation.emissionsBySource")}</h3>
            <div className="h-[300px]">
              {emissionsBySource.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emissionsBySource}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {emissionsBySource.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Legend />
                    <Tooltip formatter={(value) => [`${value} tCO2e`, "Emissions"]} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full bg-gray-100 rounded-md">
                  <p className="text-gray-500">No source data available</p>
                </div>
              )}
            </div>
          </div>
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
