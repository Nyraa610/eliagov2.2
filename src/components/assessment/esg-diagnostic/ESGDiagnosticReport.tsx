
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ClipboardCopy, DownloadCloud, FileText, Mail, LineChart, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { ESGFormValues } from "./ESGFormSchema";

interface ESGDiagnosticReportProps {
  formData: ESGFormValues;
  analysisResult: string;
  onStartNew: () => void;
}

export function ESGDiagnosticReport({ formData, analysisResult, onStartNew }: ESGDiagnosticReportProps) {
  const { toast } = useToast();
  const [showExpertModal, setShowExpertModal] = useState(false);
  
  const handleCopyReport = () => {
    navigator.clipboard.writeText(analysisResult);
    toast({
      title: "Copied to clipboard",
      description: "The ESG diagnostic report has been copied to your clipboard"
    });
  };
  
  const handleDownloadReport = () => {
    const blob = new Blob([
      `ESG DIAGNOSTIC REPORT\n\n` +
      `Company: ${formData.companyName}\n` +
      `Industry: ${formData.industry}\n` +
      `Size: ${formData.employeeCount} employees\n\n` +
      `${analysisResult}`
    ], { type: "text/plain" });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `esg-diagnostic-${formData.companyName.replace(/\s+/g, '-').toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  const handleRequestExpertReview = () => {
    // This would typically send a notification or email to an ESG expert
    setShowExpertModal(true);
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> ESG Diagnostic Report
        </CardTitle>
        <CardDescription>
          Results for {formData.companyName} ({formData.industry})
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-muted/50 p-4 rounded-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <FileText className="h-5 w-5 mr-2" /> Analysis Summary
            </h3>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCopyReport}
                className="gap-1"
              >
                <ClipboardCopy className="h-4 w-4" />
                <span className="hidden sm:inline">Copy</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadReport}
                className="gap-1"
              >
                <DownloadCloud className="h-4 w-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
          
          <div className="prose prose-sm max-w-none">
            <pre className="whitespace-pre-wrap text-sm bg-transparent border-0 p-0 overflow-auto max-h-[500px]">
              {analysisResult}
            </pre>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-between">
          <Button 
            variant="outline" 
            onClick={onStartNew}
            className="gap-1"
          >
            <LineChart className="h-4 w-4" /> Start New Assessment
          </Button>
          
          <Dialog open={showExpertModal} onOpenChange={setShowExpertModal}>
            <DialogTrigger asChild>
              <Button className="gap-1">
                <Mail className="h-4 w-4" /> Request Expert Review
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Expert Review Request</DialogTitle>
                <DialogDescription>
                  Your report will be shared with an ESG expert from Elia Go who will review your diagnostic and provide personalized guidance.
                </DialogDescription>
              </DialogHeader>
              <p className="py-4">
                An ESG consultant will contact you within 2 business days to discuss your report and provide additional insights and recommendations for your sustainability journey.
              </p>
              <DialogFooter>
                <Button 
                  onClick={() => {
                    setShowExpertModal(false);
                    toast({
                      title: "Request submitted",
                      description: "An ESG expert will contact you shortly to review your diagnostic"
                    });
                  }}
                >
                  Confirm Request
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
