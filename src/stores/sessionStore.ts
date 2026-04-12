import { create } from "zustand";
import { DifficultyLevel } from "@/types/database";
import { GeneratedExercise, ExerciseResult } from "@/types/exercise";

interface SessionStore {
  sessionId: string | null;
  topicId: string | null;
  topicName: string;
  questions: GeneratedExercise[];
  currentIndex: number;
  results: ExerciseResult[];
  difficulty: DifficultyLevel;
  isLoading: boolean;
  isFinished: boolean;
  starsEarned: number;
  consecutiveCorrect: number;

  // Actions
  startSession: (topicId: string, topicName: string, difficulty: DifficultyLevel) => void;
  setQuestions: (questions: GeneratedExercise[]) => void;
  addQuestion: (question: GeneratedExercise) => void;
  submitAnswer: (result: ExerciseResult) => void;
  nextQuestion: () => void;
  addStars: (count: number) => void;
  setLoading: (loading: boolean) => void;
  finishSession: () => void;
  resetSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  sessionId: null,
  topicId: null,
  topicName: "",
  questions: [],
  currentIndex: 0,
  results: [],
  difficulty: "easy",
  isLoading: false,
  isFinished: false,
  starsEarned: 0,
  consecutiveCorrect: 0,

  startSession: (topicId, topicName, difficulty) =>
    set({
      sessionId: crypto.randomUUID(),
      topicId,
      topicName,
      difficulty,
      questions: [],
      currentIndex: 0,
      results: [],
      isLoading: true,
      isFinished: false,
      starsEarned: 0,
      consecutiveCorrect: 0,
    }),

  setQuestions: (questions) => {
    // Dedup by question text
    const seen = new Set<string>();
    const unique = questions.filter((q) => {
      if (seen.has(q.question)) return false;
      seen.add(q.question);
      return true;
    });
    return set({ questions: unique, isLoading: false });
  },

  addQuestion: (question) =>
    set((state) => {
      // Skip if duplicate question text
      if (state.questions.some((q) => q.question === question.question)) {
        return state;
      }
      return { questions: [...state.questions, question] };
    }),

  submitAnswer: (result) =>
    set((state) => {
      const newConsecutive = result.is_correct
        ? state.consecutiveCorrect + 1
        : 0;
      let newStars = state.starsEarned;
      if (result.is_correct) {
        newStars += 1;
        if (newConsecutive % 5 === 0) newStars += 3;
      }
      return {
        results: [...state.results, result],
        consecutiveCorrect: newConsecutive,
        starsEarned: newStars,
      };
    }),

  nextQuestion: () =>
    set((state) => {
      const next = state.currentIndex + 1;
      if (next >= state.questions.length) {
        return { isFinished: true };
      }
      return { currentIndex: next };
    }),

  addStars: (count) =>
    set((state) => ({ starsEarned: state.starsEarned + count })),

  setLoading: (loading) => set({ isLoading: loading }),

  finishSession: () => set({ isFinished: true }),

  resetSession: () =>
    set({
      sessionId: null,
      topicId: null,
      topicName: "",
      questions: [],
      currentIndex: 0,
      results: [],
      difficulty: "easy",
      isLoading: false,
      isFinished: false,
      starsEarned: 0,
      consecutiveCorrect: 0,
    }),
}));
