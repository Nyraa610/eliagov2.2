
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Sparkles } from "lucide-react";
import { AIAnalysisType, aiService } from "@/services/aiService";
import { useToast } from "@/components/ui/use-toast";

interface AIAnalysisProps {
  /** Type of analysis to perform */
  analysisType: AIAnalysisType;
  /** Initial content to analyze (optional) */
  initialContent?: string;
  /** Title for the analysis card */
  title: string;
  /** Description for the analysis card */
  description: string;
  /** Placeholder text for the textarea */
  placeholder?: string;
  /** Button text */
  buttonText?: string;
  /** Callback when analysis is completed */
  onAnalysisComplete?: (result: string) => void;
  /** Display the input textarea (defaults to true) */
  showInput?: boolean;
}

export function AIAnalysis({
  analysisType,
  initialContent = "",
  title,
  description,
  placeholder = "Enter content to analyze...",
  buttonText = "Analyze with AI",
  onAnalysisComplete,
  showInput = true
}: AIAnalysisProps) {
  const [content, setContent] = useState(initialContent);
  const [result, setResult] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const handleAnalysis = async () => {
    if (!content && showInput) {
      toast({
        title: "Content required",
        description: "Please enter some content to analyze.",
        variant: "destructive"
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      let analysisResult: string;
      
      if (analysisType === 'course-summary') {
        analysisResult = await aiService.generateCourseSummary(content);
      } else if (analysisType === 'esg-assessment') {
        analysisResult = await aiService.generateESGAnalysis(content);
      } else {
        const response = await aiService.analyzeContent({
          type: analysisType,
          content
        });
        analysisResult = response.result;
      }
      
      setResult(analysisResult);
      
      if (onAnalysisComplete) {
        onAnalysisComplete(analysisResult);
      }
      
      toast({
        title: "Analysis complete",
        description: "AI has successfully analyzed your content."
      });
    } catch (error) {
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {showInput && (
          <Textarea
            placeholder={placeholder}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[150px]"
          />
        )}
        
        {result && (
          <div className="mt-4 p-4 bg-muted/50 rounded-md">
            <h3 className="text-sm font-medium mb-2">Analysis Result:</h3>
            <div className="whitespace-pre-wrap text-sm">{result}</div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleAnalysis} 
          disabled={isAnalyzing || (!content && showInput)}
          className="w-full sm:w-auto"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> {buttonText}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
