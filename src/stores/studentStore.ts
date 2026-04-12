import { create } from "zustand";
import { Student } from "@/types/database";

interface StudentStore {
  student: Student | null;
  isParentMode: boolean;

  setStudent: (student: Student) => void;
  updateStars: (amount: number) => void;
  updateStreak: (days: number) => void;
  toggleParentMode: () => void;
  clear: () => void;
}

export const useStudentStore = create<StudentStore>((set) => ({
  student: null,
  isParentMode: false,

  setStudent: (student) => set({ student }),

  updateStars: (amount) =>
    set((state) => ({
      student: state.student
        ? { ...state.student, total_stars: state.student.total_stars + amount }
        : null,
    })),

  updateStreak: (days) =>
    set((state) => ({
      student: state.student
        ? { ...state.student, streak_days: days }
        : null,
    })),

  toggleParentMode: () =>
    set((state) => ({ isParentMode: !state.isParentMode })),

  clear: () => set({ student: null, isParentMode: false }),
}));
