
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileUp, Wand2 } from "lucide-react";

interface IntroductionCardProps {
  onOpenUploadDialog: () => void;
  onOpenAIDialog: () => void;
  isUploading: boolean;
  isGenerating: boolean;
  uploadProgress: number;
  generationProgress: number;
}

export function IntroductionCard({
  onOpenUploadDialog,
  onOpenAIDialog,
  isUploading,
  isGenerating,
  uploadProgress,
  generationProgress
}: IntroductionCardProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Value Chain Analysis for ESG Reporting</CardTitle>
        <CardDescription>
          Visualize and analyze your company's value creation process to enhance ESG performance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 text-muted-foreground">
          <p>
            A value chain model is crucial for ESG reporting as it helps identify environmental, social, and governance impacts across your business activities. By mapping your value chain, you can:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Identify key sustainability hotspots where environmental or social impacts are concentrated</li>
            <li>Prioritize areas for improvement to maximize ESG performance</li>
            <li>Demonstrate transparency and traceability in your sustainability reporting</li>
            <li>Facilitate stakeholder engagement by clearly illustrating how your business creates value</li>
            <li>Enable more accurate scope 1, 2, and 3 emissions calculations</li>
          </ul>
          <p className="font-semibold mt-4 text-foreground">Getting Started:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-2 font-medium text-foreground">
                <FileUp className="h-5 w-5" />
                <span>Upload Company Documents</span>
              </div>
              <p className="text-sm">
                Upload existing documents like business plans, pitch decks, organizational charts, or process flows 
                to help build an accurate value chain model based on your company's specific operations.
              </p>
              <Button 
                onClick={onOpenUploadDialog} 
                variant="outline" 
                size="sm" 
                className="mt-3 w-full"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <span className="animate-pulse">Uploading...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="h-4 w-4 mr-2" />
                    Upload Documents
                  </>
                )}
              </Button>
              
              {isUploading && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Uploading documents...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-1.5" />
                </div>
              )}
            </div>
            <div className="border rounded-md p-3">
              <div className="flex items-center gap-2 mb-2 font-medium text-foreground">
                <Wand2 className="h-5 w-5" />
                <span>AI-Powered Generation</span>
              </div>
              <p className="text-sm">
                Let our AI analyze your company information and generate a comprehensive value chain model optimized 
                for ESG reporting, saving you time and ensuring all key activities are captured.
              </p>
              <Button 
                onClick={onOpenAIDialog} 
                variant="secondary" 
                size="sm" 
                className="mt-3 w-full"
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <span className="animate-pulse">Generating...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Generate with AI
                  </>
                )}
              </Button>
              
              {isGenerating && (
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span>Generating value chain...</span>
                    <span>{generationProgress}%</span>
                  </div>
                  <Progress value={generationProgress} className="h-1.5" />
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
