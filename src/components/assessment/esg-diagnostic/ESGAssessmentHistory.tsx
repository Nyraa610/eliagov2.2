
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Clock, ClipboardCopy, DownloadCloud, Eye, FileText, Loader2, PlusCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface ESGAssessmentProps {
  onStartNew?: () => void;
}

interface ESGAssessment {
  id: string;
  created_at: string;
  form_data: {
    content: string;
    analysis_result: string;
    completed_at: string;
  };
}

export function ESGAssessmentHistory({ onStartNew }: ESGAssessmentProps) {
  const [assessments, setAssessments] = useState<ESGAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssessment, setSelectedAssessment] = useState<ESGAssessment | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessments();
  }, []);

  const fetchAssessments = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assessment_progress')
        .select('*')
        .eq('assessment_type', 'rse_diagnostic')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching ESG assessments:', error);
      toast({
        title: 'Failed to load assessments',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const handleViewAssessment = (assessment: ESGAssessment) => {
    setSelectedAssessment(assessment);
    setShowDialog(true);
  };

  const handleCopyResult = () => {
    if (selectedAssessment?.form_data?.analysis_result) {
      navigator.clipboard.writeText(selectedAssessment.form_data.analysis_result);
      toast({
        title: 'Copied to clipboard',
        description: 'The assessment has been copied to your clipboard.',
      });
    }
  };

  const handleDownloadResult = () => {
    if (selectedAssessment?.form_data?.analysis_result) {
      const blob = new Blob([selectedAssessment.form_data.analysis_result], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `esg-assessment-${formatDate(selectedAssessment.created_at).replace(/[\s,:]/g, '-')}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: 'Your assessment report is being downloaded.',
      });
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> ESG Assessment History
          </CardTitle>
          <CardDescription>View and manage your past ESG diagnostic assessments</CardDescription>
        </div>
        {onStartNew && (
          <Button 
            onClick={onStartNew}
            className="flex items-center gap-1"
          >
            <PlusCircle className="h-4 w-4" />
            Start New Assessment
          </Button>
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : assessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>No ESG assessment history found.</p>
            <p className="text-sm mt-2">Complete an assessment to see your history here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assessments.map((assessment) => (
              <div
                key={assessment.id}
                className="flex justify-between items-center p-4 border rounded-md hover:bg-accent/50 transition-colors"
              >
                <div>
                  <h4 className="font-medium">ESG Assessment</h4>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(assessment.created_at)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAssessment(assessment)}
                  className="gap-1"
                >
                  <Eye className="h-4 w-4" /> View
                </Button>
              </div>
            ))}
          </div>
        )}

        {selectedAssessment && (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>ESG Assessment Report</DialogTitle>
                <DialogDescription>
                  Completed on {formatDate(selectedAssessment.created_at)}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 mt-4">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyResult}
                    className="gap-1"
                  >
                    <ClipboardCopy className="h-4 w-4" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadResult}
                    className="gap-1"
                  >
                    <DownloadCloud className="h-4 w-4" /> Download
                  </Button>
                </div>

                <div className="bg-muted/50 p-4 rounded-md">
                  <pre className="whitespace-pre-wrap text-sm overflow-auto max-h-[50vh]">
                    {selectedAssessment.form_data.analysis_result}
                  </pre>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}
