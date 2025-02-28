
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Loader2, File, Upload, AlertCircle } from "lucide-react";
import { aiAnalysisService, FileAnalysisResult } from "@/services/aiAnalysisService";
import { Input } from "@/components/ui/input";

export function FileAnalysisUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<FileAnalysisResult | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Reset previous results when new file is selected
      setResult(null);
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    try {
      const analysisResult = await aiAnalysisService.analyzeFile(file);
      setResult(analysisResult);
      toast({
        title: "Analysis complete",
        description: "Your file has been analyzed successfully.",
      });
    } catch (error) {
      console.error("File analysis error:", error);
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze file.",
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

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <File className="h-6 w-6" />
            AI File Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center">
            <Input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
              accept=".pdf,.txt,.docx,.csv,.xlsx"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer flex flex-col items-center justify-center"
            >
              <Upload className="h-10 w-10 text-gray-400 mb-2" />
              <span className="text-sm text-gray-600">
                Click to upload or drag and drop
              </span>
              <span className="text-xs text-gray-500 mt-1">
                PDF, TXT, DOCX, CSV, XLSX files supported
              </span>
            </label>
          </div>

          {file && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md flex items-center gap-2">
              <File className="h-5 w-5 text-blue-500" />
              <div className="text-sm">
                <div className="font-medium">{file.name}</div>
                <div className="text-gray-500 text-xs">{formatFileSize(file.size)}</div>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-6 p-4 bg-gray-50 rounded-md border">
              <h3 className="font-semibold text-lg mb-2">Analysis Results</h3>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="font-medium">File Name:</span> {result.fileName}</div>
                  <div><span className="font-medium">File Size:</span> {formatFileSize(result.fileSize)}</div>
                  <div><span className="font-medium">File Type:</span> {result.fileType}</div>
                  <div>
                    <span className="font-medium">Sentiment:</span>{" "}
                    <span className={getSentimentColor(result.sentiment)}>
                      {result.sentiment.charAt(0).toUpperCase() + result.sentiment.slice(1)}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="font-medium">Summary:</span> {result.summary}
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
            disabled={isAnalyzing || !file}
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze File'
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
