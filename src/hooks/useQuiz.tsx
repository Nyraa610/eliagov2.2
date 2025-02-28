
import { useState, useEffect } from "react";
import { QuizQuestion, QuizAnswer } from "@/types/training";
import { trainingService } from "@/services/trainingService";
import { useToast } from "@/components/ui/use-toast";

export function useQuiz(contentItemId: string, onComplete: (score: number) => void) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuizAnswer[]>>({});
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<{
    totalPoints: number;
    earnedPoints: number;
    correctAnswers: number;
    totalQuestions: number;
    questionResults: Record<string, boolean>;
  }>({
    totalPoints: 0,
    earnedPoints: 0,
    correctAnswers: 0,
    totalQuestions: 0,
    questionResults: {},
  });
  const { toast } = useToast();

  useEffect(() => {
    loadQuiz();
  }, [contentItemId]);

  const loadQuiz = async () => {
    try {
      setIsLoading(true);
      
      // Fetch all questions for this content item
      const fetchedQuestions = await trainingService.getQuizQuestionsByContentItemId(contentItemId);
      setQuestions(fetchedQuestions);
      
      // Fetch answers for each question
      const answersMap: Record<string, QuizAnswer[]> = {};
      
      for (const question of fetchedQuestions) {
        const questionAnswers = await trainingService.getQuizAnswersByQuestionId(question.id);
        answersMap[question.id] = questionAnswers;
      }
      
      setAnswers(answersMap);
      setCurrentQuestionIndex(0);
      setSelectedAnswers({});
      setIsCompleted(false);
      
    } catch (error) {
      console.error("Error loading quiz:", error);
      toast({
        variant: "destructive",
        title: "Failed to Load Quiz",
        description: "There was an error loading the quiz. Please try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelection = (questionId: string, answerId: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: answerId
    });
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      calculateResults();
    }
  };

  const calculateResults = () => {
    const questionResults: Record<string, boolean> = {};
    let correctAnswers = 0;
    let totalPoints = 0;
    let earnedPoints = 0;
    
    questions.forEach(question => {
      totalPoints += question.points;
      
      const selectedAnswerId = selectedAnswers[question.id];
      if (!selectedAnswerId) {
        questionResults[question.id] = false;
        return;
      }
      
      const questionAnswers = answers[question.id] || [];
      const selectedAnswer = questionAnswers.find(a => a.id === selectedAnswerId);
      
      if (selectedAnswer?.is_correct) {
        correctAnswers++;
        earnedPoints += question.points;
        questionResults[question.id] = true;
      } else {
        questionResults[question.id] = false;
      }
    });
    
    setResults({
      totalPoints,
      earnedPoints,
      correctAnswers,
      totalQuestions: questions.length,
      questionResults
    });
    
    setIsCompleted(true);
    
    // Save the quiz result to the database
    saveQuizResult(earnedPoints);
  };

  const saveQuizResult = async (score: number) => {
    try {
      await trainingService.markContentAsCompleted(contentItemId, score);
      onComplete(score);
    } catch (error) {
      console.error("Error saving quiz result:", error);
      toast({
        variant: "destructive",
        title: "Error Saving Result",
        description: "Your quiz completion was recorded, but there was an error saving your score."
      });
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setIsCompleted(false);
  };

  return {
    questions,
    currentQuestionIndex,
    answers,
    selectedAnswers,
    isLoading,
    isCompleted,
    results,
    currentQuestion: questions[currentQuestionIndex],
    currentAnswerOptions: questions[currentQuestionIndex] 
      ? answers[questions[currentQuestionIndex].id] || [] 
      : [],
    handleAnswerSelection,
    handleNext,
    restartQuiz
  };
}
