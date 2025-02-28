
import { supabaseService } from "./base/supabaseService";
import { QuizQuestion, QuizAnswer } from "@/types/training";

const { supabase } = supabaseService;

export const quizService = {
  async getQuizQuestionsByContentItemId(contentItemId: string): Promise<QuizQuestion[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_questions')
        .select('*')
        .eq('content_item_id', contentItemId)
        .order('sequence_order');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching quiz questions:", error);
      return [];
    }
  },

  async getQuizAnswersByQuestionId(questionId: string): Promise<QuizAnswer[]> {
    try {
      const { data, error } = await supabase
        .from('quiz_answers')
        .select('*')
        .eq('question_id', questionId)
        .order('sequence_order');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error("Error fetching quiz answers:", error);
      return [];
    }
  },

  async saveQuizQuestion(question: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .insert([question])
      .select()
      .single();
    
    if (error) throw error;
    return data as QuizQuestion;
  },

  async updateQuizQuestion(id: string, updates: Partial<QuizQuestion>): Promise<QuizQuestion> {
    const { data, error } = await supabase
      .from('quiz_questions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as QuizQuestion;
  },

  async deleteQuizQuestion(id: string): Promise<void> {
    try {
      // First delete all answers associated with this question
      const { error: answersError } = await supabase
        .from('quiz_answers')
        .delete()
        .eq('question_id', id);
      
      if (answersError) throw answersError;
      
      // Then delete the question
      const { error } = await supabase
        .from('quiz_questions')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting quiz question:", error);
      throw error;
    }
  },

  async saveQuizAnswer(answer: Partial<QuizAnswer>): Promise<QuizAnswer> {
    const { data, error } = await supabase
      .from('quiz_answers')
      .insert([answer])
      .select()
      .single();
    
    if (error) throw error;
    return data as QuizAnswer;
  },

  async updateQuizAnswer(id: string, updates: Partial<QuizAnswer>): Promise<QuizAnswer> {
    const { data, error } = await supabase
      .from('quiz_answers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as QuizAnswer;
  },

  async deleteQuizAnswer(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('quiz_answers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting quiz answer:", error);
      throw error;
    }
  }
};
