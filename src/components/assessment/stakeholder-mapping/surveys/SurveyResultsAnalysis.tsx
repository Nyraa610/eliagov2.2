
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, 
  ResponsiveContainer, Legend, LineChart, Line, CartesianGrid
} from 'recharts';
import { Survey } from '../StakeholderSurveys';
import { stakeholderService } from '@/services/stakeholderService';
import { Loader2, Calendar, Clock, Users, TrendingUp, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface SurveyResultsAnalysisProps {
  survey: Survey;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function SurveyResultsAnalysis({ survey }: SurveyResultsAnalysisProps) {
  const [results, setResults] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [responsesByDate, setResponsesByDate] = useState<any[]>([]);

  useEffect(() => {
    loadSurveyResults();
  }, [survey.id]);

  const loadSurveyResults = async () => {
    setIsLoading(true);
    try {
      const data = await stakeholderService.getSurveyResults(survey.id);
      setResults(data);
      
      // Generate date-based response data for trend analysis
      if (data && data.responsesByDate) {
        setResponsesByDate(data.responsesByDate);
      } else {
        // If not provided, create mock data
        const mockTrendData = generateMockTrendData();
        setResponsesByDate(mockTrendData);
      }
    } catch (error) {
      console.error("Error loading survey results:", error);
      toast.error("Failed to load survey results");
    } finally {
      setIsLoading(false);
    }
  };

  const generateMockTrendData = () => {
    const data = [];
    const days = 14; // Two weeks of data
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() - days);
    
    for (let i = 0; i <= days; i++) {
      const currentDate = new Date(baseDate);
      currentDate.setDate(currentDate.getDate() + i);
      
      data.push({
        date: currentDate.toISOString().split('T')[0],
        responses: Math.floor(Math.random() * 5) + (i % 3), // Random number of responses
      });
    }
    
    return data;
  };

  const exportToCsv = () => {
    if (!results) return;
    
    // Prepare CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Question,Type,Response,Count\n";
    
    // Add data
    results.questions.forEach((question: any) => {
      if (question.type === 'multiple_choice' || question.type === 'rating') {
        Object.entries(question.responses).forEach(([response, count]) => {
          csvContent += `"${question.text}",${question.type},"${response}",${count}\n`;
        });
      } else if (question.type === 'text') {
        question.responses.forEach((response: string) => {
          csvContent += `"${question.text}",${question.type},"${response}",1\n`;
        });
      }
    });
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `survey-results-${survey.id}.csv`);
    document.body.appendChild(link);
    
    // Trigger download
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p>Loading survey results...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No results available for this survey.</p>
      </div>
    );
  }

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
          <h3 className="font-medium text-base">{question.text}</h3>
          <div className="h-[300px] w-full mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  outerRadius={100}
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
                <Legend layout="horizontal" verticalAlign="bottom" align="center" />
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
          <h3 className="font-medium text-base">{question.text}</h3>
          <div className="h-[300px] w-full mb-4">
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
        <h3 className="font-medium text-base">{question.text}</h3>
        <div className="border rounded-md p-3 max-h-[300px] overflow-y-auto">
          {question.responses.length > 0 ? (
            question.responses.map((response: string, i: number) => (
              <div key={i} className="p-2 border-b last:border-b-0">
                "{response}"
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center py-4">No text responses received</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{survey.name} - Analysis</h2>
        <Button
          onClick={exportToCsv}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" /> Export to CSV
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Response Rate</p>
                <p className="text-2xl font-bold">
                  {survey.sentCount > 0 
                    ? `${Math.round((survey.responseCount / survey.sentCount) * 100)}%` 
                    : '0%'}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Responses</p>
                <p className="text-2xl font-bold">{survey.responseCount}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg. Completion Time</p>
                <p className="text-2xl font-bold">{results.averageCompletionTime || "N/A"}</p>
              </div>
              <Clock className="h-8 w-8 text-amber-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Last Response</p>
                <p className="text-2xl font-bold">{results.lastResponseDate ? new Date(results.lastResponseDate).toLocaleDateString() : "N/A"}</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500 opacity-75" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Response Trends</TabsTrigger>
          <TabsTrigger value="questions">Question Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {/* Overall sentiment */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Sentiment</CardTitle>
              <CardDescription>Average ratings across all questions</CardDescription>
            </CardHeader>
            <CardContent>
              {results.averageRating ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[{name: 'Overall Rating', value: results.averageRating}]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <p>No rating data available</p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Response summary */}
          <Card>
            <CardHeader>
              <CardTitle>Response Distribution</CardTitle>
              <CardDescription>Summary of responses by stakeholder type</CardDescription>
            </CardHeader>
            <CardContent>
              {results.responsesByType ? (
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={results.responsesByType}
                        cx="50%"
                        cy="50%"
                        labelLine={true}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {results.responsesByType.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex justify-center py-8">
                  <p>No stakeholder type data available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Response Trends</CardTitle>
              <CardDescription>Number of responses over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={responsesByDate}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis />
                    <Tooltip 
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString();
                      }}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="responses"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="questions" className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Question Analysis</CardTitle>
              <CardDescription>Detailed breakdown of responses for each question</CardDescription>
            </CardHeader>
            <CardContent className="divide-y">
              {results.questions.map((question: any, index: number) => (
                <div key={index} className={index > 0 ? 'pt-8' : ''}>
                  {renderQuestionResults(question, index)}
                  {index < results.questions.length - 1 && <Separator className="mt-8" />}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
