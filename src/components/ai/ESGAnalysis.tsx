
import { useState } from "react";
import { AIAnalysis } from "./AIAnalysis";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ClipboardCopy, DownloadCloud, FileText, Sparkles } from "lucide-react";

export function ESGAnalysis() {
  const [activeTab, setActiveTab] = useState("input");
  const [assessmentData, setAssessmentData] = useState("");
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAnalysisComplete = (result: string) => {
    setAnalysisResult(result);
    setActiveTab("result");
  };

  const handleCopyResult = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      toast({
        title: "Copied to clipboard",
        description: "The analysis has been copied to your clipboard."
      });
    }
  };

  const handleDownloadResult = () => {
    if (analysisResult) {
      const blob = new Blob([analysisResult], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "esg-analysis-report.txt";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> ESG Analysis Tool
          </CardTitle>
          <CardDescription>
            Analyze your company's ESG performance using AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="input">Input Data</TabsTrigger>
              <TabsTrigger value="result" disabled={!analysisResult}>
                Analysis Result
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="input" className="space-y-4 pt-4">
              <p className="text-sm text-muted-foreground">
                Enter information about your company's environmental, social, and governance practices for AI analysis.
              </p>
              <Textarea
                placeholder="Enter your company's ESG data here... Include information about environmental initiatives, social responsibility programs, governance structure, etc."
                value={assessmentData}
                onChange={(e) => setAssessmentData(e.target.value)}
                className="min-h-[250px]"
              />
              
              <AIAnalysis
                analysisType="esg-assessment"
                initialContent={assessmentData}
                title="ESG Assessment Analysis"
                description="AI will analyze your ESG data and provide insights"
                buttonText="Generate ESG Analysis"
                onAnalysisComplete={handleAnalysisComplete}
                showInput={false}
              />
            </TabsContent>
            
            <TabsContent value="result" className="space-y-4 pt-4">
              {analysisResult && (
                <>
                  <div className="bg-muted/50 p-4 rounded-md">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-lg font-medium flex items-center">
                        <FileText className="h-5 w-5 mr-2" /> ESG Analysis Report
                      </h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleCopyResult}
                          className="gap-1"
                        >
                          <ClipboardCopy className="h-4 w-4" />
                          <span className="hidden sm:inline">Copy</span>
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={handleDownloadResult}
                          className="gap-1"
                        >
                          <DownloadCloud className="h-4 w-4" />
                          <span className="hidden sm:inline">Download</span>
                        </Button>
                      </div>
                    </div>
                    <div className="prose prose-sm max-w-none">
                      <pre className="whitespace-pre-wrap text-sm bg-transparent border-0 p-0">
                        {analysisResult}
                      </pre>
                    </div>
                  </div>
                </>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
