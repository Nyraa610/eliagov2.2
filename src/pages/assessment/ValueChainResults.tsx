
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ResultsContainer } from "@/components/assessment/results/ResultsContainer";
import { useToast } from "@/components/ui/use-toast";
import { assessmentService } from "@/services/assessment";
import { FileText, Link as LinkIcon, ExternalLink, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ValueChainResults() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // In a real implementation, fetch actual results from the backend
        const data = await assessmentService.getAssessmentResults('value_chain');
        setResults(data || mockResults);
      } catch (error) {
        console.error("Failed to fetch results:", error);
        toast({
          title: "Error",
          description: "Failed to load value chain results",
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
    summary: {
      totalNodes: 15,
      primaryActivities: 8,
      supportActivities: 5,
      externalFactors: 2,
      connections: 24
    },
    hotspots: [
      { name: "Raw Material Sourcing", impact: "High", description: "Major environmental impact due to extraction processes" },
      { name: "Manufacturing", impact: "Medium", description: "Energy intensive processes with moderate emissions" },
      { name: "Distribution", impact: "Medium", description: "Long-distance transportation contributing to carbon footprint" }
    ],
    documents: [
      { id: 1, name: "Value Chain Analysis Report", path: "/reports/value-chain-analysis.pdf", type: "PDF" },
      { id: 2, name: "Environmental Impact Assessment", path: "/reports/environmental-impact.xlsx", type: "Excel" }
    ],
    recommendations: [
      "Partner with suppliers on sustainable sourcing practices",
      "Invest in renewable energy for manufacturing facilities",
      "Optimize logistics to reduce transportation emissions",
      "Implement circular economy principles in product design"
    ]
  };
  
  const getImpactBadge = (impact: string) => {
    switch (impact.toLowerCase()) {
      case "high":
        return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">High</span>;
      case "medium":
        return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">Medium</span>;
      case "low":
        return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Low</span>;
      default:
        return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">{impact}</span>;
    }
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
      title={t("assessment.valueChain.resultsTitle")}
      description={t("assessment.valueChain.resultsDescription")}
      reportUrl="/reports/value-chain-report.pdf"
    >
      <div className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <LinkIcon className="h-5 w-5 mr-2 text-primary" />
            {t("assessment.valueChain.summary")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{results.summary.totalNodes}</div>
                <p className="text-sm text-muted-foreground">Total Nodes</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{results.summary.primaryActivities}</div>
                <p className="text-sm text-muted-foreground">Primary Activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{results.summary.supportActivities}</div>
                <p className="text-sm text-muted-foreground">Support Activities</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{results.summary.externalFactors}</div>
                <p className="text-sm text-muted-foreground">External Factors</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <div className="text-2xl font-bold">{results.summary.connections}</div>
                <p className="text-sm text-muted-foreground">Connections</p>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-primary" />
            {t("assessment.valueChain.hotspots")}
          </h3>
          <div className="space-y-4">
            {results.hotspots.map((hotspot: any, index: number) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-medium">{hotspot.name}</h4>
                  {getImpactBadge(hotspot.impact)}
                </div>
                <p className="text-sm text-gray-600">{hotspot.description}</p>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-primary" />
            {t("assessment.valueChain.documents")}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.documents.map((document: any) => (
              <div key={document.id} className="border rounded-lg p-4 flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-xs text-gray-500">{document.type}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-1" asChild>
                  <a href={document.path} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4" />
                    <span>View</span>
                  </a>
                </Button>
              </div>
            ))}
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
