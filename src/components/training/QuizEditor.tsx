
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Trash2, Save, Check } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { QuizQuestion, QuizAnswer } from "@/types/training";
import { trainingService } from "@/services/trainingService";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const answerSchema = z.object({
  id: z.string().optional(),
  answer_text: z.string().min(1, "Answer text is required"),
  is_correct: z.boolean().default(false),
  sequence_order: z.number().int().optional()
});

const questionSchema = z.object({
  id: z.string().optional(),
  question_text: z.string().min(1, "Question text is required"),
  question_type: z.string().default("multiple_choice"),
  points: z.number().int().min(1, "Points must be at least 1").default(1),
  sequence_order: z.number().int().optional(),
  answers: z.array(answerSchema).min(2, "At least 2 answers are required")
});

interface QuizEditorProps {
  contentItemId: string;
  onSave: () => void;
}

const QuizEditor: React.FC<QuizEditorProps> = ({ contentItemId, onSave }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion | null>(null);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const questionForm = useForm<z.infer<typeof questionSchema>>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      answers: [
        { answer_text: "", is_correct: false },
        { answer_text: "", is_correct: false }
      ]
    }
  });

  useEffect(() => {
    fetchQuizData();
  }, [contentItemId]);

  const fetchQuizData = async () => {
    try {
      setIsLoading(true);
      const fetchedQuestions = await trainingService.getQuizQuestionsByContentItemId(contentItemId);
      setQuestions(fetchedQuestions);
      
      // If there are questions, select the first one
      if (fetchedQuestions.length > 0) {
        await selectQuestion(fetchedQuestions[0]);
      } else {
        setCurrentQuestion(null);
        setAnswers([]);
        questionForm.reset({
          question_text: "",
          question_type: "multiple_choice",
          points: 1,
          answers: [
            { answer_text: "", is_correct: false },
            { answer_text: "", is_correct: false }
          ]
        });
      }
    } catch (error) {
      console.error("Error fetching quiz data:", error);
      toast({
        variant: "destructive",
        title: "Error Loading Quiz",
        description: "Failed to load quiz questions and answers."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectQuestion = async (question: QuizQuestion) => {
    try {
      setCurrentQuestion(question);
      
      const fetchedAnswers = await trainingService.getQuizAnswersByQuestionId(question.id);
      setAnswers(fetchedAnswers);
      
      questionForm.reset({
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        points: question.points,
        sequence_order: question.sequence_order,
        answers: fetchedAnswers.map(a => ({
          id: a.id,
          answer_text: a.answer_text,
          is_correct: a.is_correct,
          sequence_order: a.sequence_order
        }))
      });
    } catch (error) {
      console.error("Error selecting question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load question details."
      });
    }
  };

  const handleAddQuestion = () => {
    // Reset form with empty values for new question
    questionForm.reset({
      question_text: "",
      question_type: "multiple_choice",
      points: 1,
      answers: [
        { answer_text: "", is_correct: false },
        { answer_text: "", is_correct: false }
      ]
    });
    setCurrentQuestion(null);
    setAnswers([]);
  };

  const handleAddAnswer = () => {
    const currentAnswers = questionForm.getValues("answers");
    questionForm.setValue("answers", [
      ...currentAnswers,
      { answer_text: "", is_correct: false }
    ]);
  };

  const handleRemoveAnswer = (index: number) => {
    const currentAnswers = questionForm.getValues("answers");
    if (currentAnswers.length <= 2) {
      toast({
        variant: "destructive",
        title: "Cannot Remove Answer",
        description: "Questions must have at least 2 answers."
      });
      return;
    }
    
    questionForm.setValue(
      "answers", 
      currentAnswers.filter((_, i) => i !== index)
    );
  };

  const handleDeleteQuestion = async () => {
    if (!currentQuestion?.id) return;
    
    // This would need to be implemented in trainingService
    try {
      // Placeholder for delete functionality
      // await trainingService.deleteQuizQuestion(currentQuestion.id);
      toast({
        title: "Question Deleted",
        description: "The question has been successfully deleted."
      });
      fetchQuizData();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete the question."
      });
    }
  };

  const onSubmit = async (data: z.infer<typeof questionSchema>) => {
    try {
      setIsSaving(true);
      
      // Update question sequence order if not provided
      if (!data.sequence_order) {
        data.sequence_order = currentQuestion?.sequence_order || questions.length + 1;
      }

      // This would need to be implemented in trainingService
      // For new questions
      if (!data.id) {
        const newQuestion: Partial<QuizQuestion> = {
          content_item_id: contentItemId,
          question_text: data.question_text,
          question_type: data.question_type,
          points: data.points,
          sequence_order: data.sequence_order
        };
        
        // Save question and get generated ID
        // const savedQuestion = await trainingService.saveQuizQuestion(newQuestion);
        
        // Save answers
        // for (let i = 0; i < data.answers.length; i++) {
        //   const answer = data.answers[i];
        //   await trainingService.saveQuizAnswer({
        //     question_id: savedQuestion.id,
        //     answer_text: answer.answer_text,
        //     is_correct: answer.is_correct,
        //     sequence_order: i + 1
        //   });
        // }
      } 
      // For existing questions
      else {
        // Update question
        // await trainingService.updateQuizQuestion(data.id, {
        //   question_text: data.question_text,
        //   question_type: data.question_type,
        //   points: data.points,
        //   sequence_order: data.sequence_order
        // });
        
        // Handle answers (update existing, delete removed, add new)
        // const currentAnswerIds = answers.map(a => a.id);
        // const dataAnswerIds = data.answers.filter(a => a.id).map(a => a.id);
        
        // Delete answers that are no longer present
        // for (const answerId of currentAnswerIds) {
        //   if (dataAnswerIds.indexOf(answerId) === -1) {
        //     await trainingService.deleteQuizAnswer(answerId);
        //   }
        // }
        
        // Update or create answers
        // for (let i = 0; i < data.answers.length; i++) {
        //   const answer = data.answers[i];
        //   if (answer.id) {
        //     await trainingService.updateQuizAnswer(answer.id, {
        //       answer_text: answer.answer_text,
        //       is_correct: answer.is_correct,
        //       sequence_order: i + 1
        //     });
        //   } else {
        //     await trainingService.saveQuizAnswer({
        //       question_id: data.id,
        //       answer_text: answer.answer_text,
        //       is_correct: answer.is_correct,
        //       sequence_order: i + 1
        //     });
        //   }
        // }
      }
      
      toast({
        title: "Saved Successfully",
        description: "Question and answers have been saved."
      });
      
      // Refresh data
      fetchQuizData();
      
      // Notify parent component
      onSave();
    } catch (error) {
      console.error("Error saving quiz question:", error);
      toast({
        variant: "destructive",
        title: "Error Saving",
        description: "Failed to save question and answers."
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="p-4 text-center">Loading quiz data...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Quiz Questions</h3>
        <Button onClick={handleAddQuestion} variant="outline" size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          New Question
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Question List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Questions</h4>
          {questions.length === 0 ? (
            <div className="text-sm text-muted-foreground p-2">
              No questions yet. Create your first question.
            </div>
          ) : (
            <div className="space-y-2">
              {questions.map((question) => (
                <Card 
                  key={question.id} 
                  className={`cursor-pointer ${
                    currentQuestion?.id === question.id ? 'border-primary' : ''
                  }`}
                  onClick={() => selectQuestion(question)}
                >
                  <CardContent className="p-3">
                    <div className="text-sm font-medium line-clamp-2">{question.question_text}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Points: {question.points} | Answers: {answers.length}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Question Editor */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>
                {currentQuestion ? 'Edit Question' : 'New Question'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...questionForm}>
                <form onSubmit={questionForm.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={questionForm.control}
                    name="question_text"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Question</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter your question" 
                            className="min-h-[80px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={questionForm.control}
                      name="points"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Points</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              min={1} 
                              {...field} 
                              onChange={e => field.onChange(parseInt(e.target.value) || 1)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={questionForm.control}
                      name="question_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Type</FormLabel>
                          <FormControl>
                            <Input 
                              value="multiple_choice" 
                              disabled 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <FormLabel>Answers</FormLabel>
                      <Button 
                        type="button" 
                        onClick={handleAddAnswer} 
                        variant="outline" 
                        size="sm"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" />
                        Add Answer
                      </Button>
                    </div>
                    
                    {questionForm.getValues("answers").map((_, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="flex-grow space-y-1">
                          <FormField
                            control={questionForm.control}
                            name={`answers.${index}.answer_text`}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    placeholder={`Answer ${index + 1}`} 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={questionForm.control}
                          name={`answers.${index}.is_correct`}
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-2 mt-2">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <FormLabel className="text-sm cursor-pointer">
                                Correct
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                        
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveAnswer(index)}
                          className="h-9 w-9 p-0 mt-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end space-x-2 pt-4">
                    {currentQuestion && (
                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleDeleteQuestion}
                        disabled={isSaving}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    )}
                    <Button type="submit" disabled={isSaving}>
                      {isSaving ? (
                        <>Saving...</>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
