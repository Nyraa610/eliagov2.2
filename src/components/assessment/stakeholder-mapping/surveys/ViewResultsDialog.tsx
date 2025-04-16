
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Survey } from '../StakeholderSurveys';
import { stakeholderService } from '@/services/stakeholderService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface ViewResultsDialogProps {
  open: boolean;
  onClose: () => void;
  survey: Survey;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function ViewResultsDialog({
  open,
  onClose,
  survey
}: ViewResultsDialogProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (open) {
      const loadResults = async () => {
        setIsLoading(true);
        try {
          const data = await stakeholderService.getSurveyResults(survey.id);
          setResults(data);
        } catch (error) {
          console.error("Error loading survey results:", error);
        } finally {
          setIsLoading(false);
        }
      };
      
      loadResults();
    }
  }, [open, survey.id]);

  const renderQuestionResults = (question: any, index: number) => {
    if (!question || !question.responses) {
      return <p>No data available</p>;
    }

    if (question.type === 'multiple_choice') {
      const data = Object.entries(question.responses).map(([label, count]) => ({
        name: label,
        value: count
      }));

      return (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{question.text}</h3>
          <div className="h-[200px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    if (question.type === 'rating') {
      const data = Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        return {
          name: rating.toString(),
          count: question.responses[rating] || 0
        };
      });

      return (
        <div className="space-y-2">
          <h3 className="text-sm font-medium">{question.text}</h3>
          <div className="h-[200px] mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" label={{ value: 'Rating', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Responses', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      );
    }

    // For text responses
    return (
      <div className="space-y-2">
        <h3 className="text-sm font-medium">{question.text}</h3>
        <div className="border rounded-md p-3 max-h-[200px] overflow-y-auto">
          {question.responses.map((response: string, i: number) => (
            <div key={i} className="p-2 border-b last:border-b-0">
              "{response}"
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>{survey.name} - Results</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <p>Loading survey results...</p>
            </div>
          ) : !results ? (
            <div className="text-center py-8">
              <p>No results found for this survey.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Response Rate</p>
                  <p className="text-2xl font-bold">
                    {survey.sentCount > 0 
                      ? `${Math.round((survey.responseCount / survey.sentCount) * 100)}%` 
                      : '0%'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {survey.responseCount} of {survey.sentCount} responded
                  </p>
                </Card>
                
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                  <p className="text-2xl font-bold">
                    {results.averageCompletionTime || 'N/A'}
                  </p>
                </Card>
                
                <Card className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">Avg. Rating</p>
                  <p className="text-2xl font-bold">
                    {results.averageRating ? `${results.averageRating.toFixed(1)}/5` : 'N/A'}
                  </p>
                </Card>
              </div>
              
              <div className="space-y-8">
                <h3 className="text-lg font-medium">Question Results</h3>
                
                {results.questions && results.questions.map((question: any, index: number) => (
                  <div key={index} className="border-t pt-4">
                    {renderQuestionResults(question, index)}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
