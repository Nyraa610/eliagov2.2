
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Survey, SurveyResult, stakeholderService } from "@/services/stakeholderService";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewResultsDialogProps {
  open: boolean;
  onClose: () => void;
  survey: Survey;
}

export function ViewResultsDialog({ open, onClose, survey }: ViewResultsDialogProps) {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadResults = async () => {
      if (!open) return;

      setIsLoading(true);
      try {
        const surveyResults = await stakeholderService.getSurveyResults(survey.id);
        setResults(surveyResults);
      } catch (error) {
        console.error("Error loading survey results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadResults();
  }, [open, survey.id]);

  const handlePrint = () => {
    window.print();
  };

  // Group responses by question for analysis
  const questionResponses: {
    [questionId: string]: {
      questionText: string;
      responseCount: number;
      type: string;
      answers: Array<string | number>;
      chartData?: { name: string; value: number }[];
    };
  } = {};

  results.forEach((result) => {
    result.answers.forEach((answer) => {
      if (!questionResponses[answer.questionId]) {
        questionResponses[answer.questionId] = {
          questionText: answer.questionText,
          responseCount: 0,
          type: typeof answer.answer === "number" ? "rating" : "text",
          answers: [],
        };
      }

      questionResponses[answer.questionId].answers.push(answer.answer);
      questionResponses[answer.questionId].responseCount++;

      // Prepare chart data for rating questions
      if (typeof answer.answer === "number") {
        if (!questionResponses[answer.questionId].chartData) {
          questionResponses[answer.questionId].chartData = [];
          for (let i = 1; i <= 5; i++) {
            questionResponses[answer.questionId].chartData!.push({
              name: i.toString(),
              value: 0,
            });
          }
        }

        // Increment the count for this rating
        const ratingIndex = Math.min(Math.max(1, Math.round(answer.answer)), 5) - 1;
        questionResponses[answer.questionId].chartData![ratingIndex].value++;
      }
    });
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Survey Results: {survey.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="print:hidden"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
          </DialogTitle>
          <DialogDescription>
            {survey.responseCount} responses received
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center my-8">
            <p>Loading survey results...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center my-8">
            <p>No responses received yet.</p>
          </div>
        ) : (
          <div className="mt-4">
            <Tabs defaultValue="summary">
              <TabsList className="print:hidden">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="individual">Individual Responses</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="mt-4">
                <div className="space-y-6">
                  {Object.entries(questionResponses).map(
                    ([questionId, questionData]) => (
                      <Card key={questionId} className="mb-6">
                        <CardContent className="pt-6">
                          <h3 className="text-lg font-medium mb-2">
                            {questionData.questionText}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4">
                            {questionData.responseCount} responses
                          </p>

                          {questionData.type === "rating" && questionData.chartData ? (
                            <div className="h-64">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                  data={questionData.chartData}
                                  margin={{
                                    top: 5,
                                    right: 30,
                                    left: 20,
                                    bottom: 5,
                                  }}
                                >
                                  <CartesianGrid strokeDasharray="3 3" />
                                  <XAxis dataKey="name" />
                                  <YAxis />
                                  <Tooltip />
                                  <Bar
                                    dataKey="value"
                                    fill="#4f46e5"
                                    name="Responses"
                                  />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          ) : (
                            <div className="max-h-64 overflow-y-auto">
                              <ul className="space-y-2">
                                {questionData.answers.map((answer, index) => (
                                  <li
                                    key={index}
                                    className="p-2 bg-gray-50 rounded-md"
                                  >
                                    {answer.toString()}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  )}
                </div>
              </TabsContent>

              <TabsContent value="individual">
                <div className="space-y-6">
                  {results.map((result) => (
                    <Card key={result.id} className="mb-6">
                      <CardContent className="pt-6">
                        <h3 className="font-medium">
                          {result.contactName}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Submitted {new Date(result.submittedAt).toLocaleString()}
                        </p>

                        <div className="space-y-4">
                          {result.answers.map((answer, index) => (
                            <div key={index}>
                              <p className="font-medium">{answer.questionText}</p>
                              <p className="p-2 bg-gray-50 rounded-md mt-1">
                                {answer.answer.toString()}
                              </p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
