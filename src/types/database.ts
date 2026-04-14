export type SubjectType = "toan" | "tieng_viet" | "tnxh" | "tieng_anh";
export type SeriesType = "canh_dieu" | "kntt" | "chan_troi";
export type SkillType = "so_hoc" | "hinh_hoc" | "do_luong" | "toan_do" | "bieu_thuc" | "thong_ke";
export type MasteryLevel = "not_started" | "learning" | "practicing" | "mastered";
export type DifficultyLevel = "easy" | "medium" | "hard";
export type QuestionType = "fill_blank" | "multiple_choice" | "drag_drop";

export interface CurriculumTopic {
  id: string;
  subject: SubjectType;
  grade: number;
  series: SeriesType;
  semester: number;
  chapter_code: string;
  chapter_name: string;
  topic_code: string;
  topic_name: string;
  skill_type: SkillType;
  week_suggestion: number | null;
  sort_order: number;
  ai_prompt_template: string;
  difficulty_levels: {
    easy: { description: string; number_range?: number[] };
    medium: { description: string; number_range?: number[] };
    hard: { description: string; number_range?: number[] };
  };
  created_at: string;
}

export type GenderType = "male" | "female" | "other";

export interface Student {
  id: string;
  parent_id: string;
  name: string;
  grade: number;
  series: SeriesType;
  current_week: number;
  avatar_id: string;
  // Extended profile fields (migration 003)
  username: string | null;
  avatar_url: string | null;
  gender: GenderType | null;
  school: string | null;
  total_stars: number;
  streak_days: number;
  last_practice_date: string | null;
  assigned_topic_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface StudentTopicProgress {
  student_id: string;
  topic_id: string;
  attempts: number;
  correct: number;
  accuracy_rate: number;
  mastery_level: MasteryLevel;
  current_difficulty: DifficultyLevel;
  consecutive_correct: number;
  consecutive_wrong: number;
  last_practiced_at: string | null;
  weak_flag: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExerciseSession {
  id: string;
  student_id: string;
  topic_id: string;
  question_generated: string;
  question_type: QuestionType;
  student_answer: string | null;
  correct_answer: string;
  is_correct: boolean | null;
  ai_explanation: string | null;
  difficulty_used: DifficultyLevel;
  created_at: string;
}
