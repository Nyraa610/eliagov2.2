
export interface Course {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  points: number;
  created_at: string;
  updated_at: string;
}

export interface Module {
  id: string;
  course_id: string;
  title: string;
  description: string | null;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: string;
  module_id: string;
  title: string;
  content_type: 'video' | 'text' | 'quiz';
  content: string | null;
  video_url: string | null;
  sequence_order: number;
  created_at: string;
  updated_at: string;
}

export interface QuizQuestion {
  id: string;
  content_item_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  points: number;
  sequence_order: number;
  created_at: string;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  sequence_order: number;
  created_at: string;
}

export interface UserEnrollment {
  id: string;
  user_id: string;
  course_id: string;
  is_completed: boolean;
  progress_percentage: number;
  points_earned: number;
  started_at: string;
  completed_at: string | null;
}

export interface ModuleCompletion {
  id: string;
  user_id: string;
  module_id: string;
  is_completed: boolean;
  completed_at: string | null;
}

export interface ContentCompletion {
  id: string;
  user_id: string;
  content_item_id: string;
  is_completed: boolean;
  quiz_score: number | null;
  completed_at: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  certificate_url: string | null;
  points_earned: number;
  issued_at: string;
}
