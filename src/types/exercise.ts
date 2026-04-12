import { DifficultyLevel, QuestionType } from "./database";

export interface GeneratedExercise {
  question: string;
  answer: string;
  question_type: QuestionType;
  choices?: string[];
  hint: string;
  visual_context?: string;
}

export interface ExerciseRequest {
  topic_id: string;
  difficulty: DifficultyLevel;
  question_type: QuestionType;
  count?: number;
}

export interface ExerciseResult {
  question: GeneratedExercise;
  student_answer: string;
  correct_answer: string;
  is_correct: boolean;
  ai_explanation?: string;
}

export interface SessionState {
  session_id: string;
  topic_id: string;
  topic_name: string;
  questions: GeneratedExercise[];
  current_index: number;
  results: ExerciseResult[];
  difficulty: DifficultyLevel;
  is_loading: boolean;
  is_finished: boolean;
  stars_earned: number;
  consecutive_correct: number;
}

export interface ExplanationRequest {
  question: string;
  student_answer: string;
  correct_answer: string;
  topic_name: string;
}

export interface ExplanationResponse {
  explanation: string;
}
