
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, FileText, AlertCircle } from "lucide-react";
import { aiAnalysisService, AnalysisResult } from "@/services/aiAnalysisService";

export function TextAnalysisForm() {
  const [text, setText] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!text.trim()) {
      toast({
        title: "Empty text",
        description: "Please enter some text to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await aiAnalysisService.analyzeText(text);
      setResult(analysisResult);
      toast({
        title: "Analysis complete",
        description: "Your text has been analyzed successfully.",
      });
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze text.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600';
      case 'negative': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <FileText className="h-6 w-6" />
            AI Text Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Textarea
              placeholder="Enter your text here for AI analysis..."
              className="min-h-[200px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border">
              <h3 className="font-semibold text-lg mb-2">Analysis Results</h3>
              <div className="space-y-3">
                <div>
                  <span className="font-medium">Summary:</span> {result.summary}
                </div>
                <div>
                  <span className="font-medium">Sentiment:</span>{" "}
                  <span className={getSentimentColor(result.sentiment)}>
                    {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                  </span>
                </div>
                <div>
                  <span className="font-medium">Confidence:</span>{" "}
                  {(result.confidence * 100).toFixed(1)}%
                </div>
                <div>
                  <span className="font-medium">Key Points:</span>
                  <ul className="list-disc ml-5 mt-1">
                    {result.keyPoints.map((point, index) => (
                      <li key={index}>{point}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button 
            onClick={handleAnalyze} 
            disabled={isAnalyzing || !text.trim()}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze Text'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
