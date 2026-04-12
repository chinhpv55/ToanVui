import { DifficultyLevel, MasteryLevel } from "@/types/database";

interface AdaptiveInput {
  attempts: number;
  correct: number;
  consecutive_correct: number;
  consecutive_wrong: number;
  current_difficulty: DifficultyLevel;
  mastery_level: MasteryLevel;
}

interface AdaptiveResult {
  new_difficulty: DifficultyLevel;
  new_mastery: MasteryLevel;
  weak_flag: boolean;
}

const DIFFICULTY_ORDER: DifficultyLevel[] = ["easy", "medium", "hard"];

export function calculateAdaptive(input: AdaptiveInput): AdaptiveResult {
  const { attempts, correct, consecutive_correct, consecutive_wrong, current_difficulty, mastery_level } = input;
  const accuracy = attempts > 0 ? correct / attempts : 0;

  // Difficulty adjustment
  let diffIdx = DIFFICULTY_ORDER.indexOf(current_difficulty);
  if (consecutive_correct >= 5 && accuracy >= 0.8) {
    diffIdx = Math.min(diffIdx + 1, 2);
  } else if (consecutive_wrong >= 3 && accuracy < 0.5) {
    diffIdx = Math.max(diffIdx - 1, 0);
  }
  const new_difficulty = DIFFICULTY_ORDER[diffIdx];

  // Mastery progression
  let new_mastery: MasteryLevel = mastery_level;
  if (attempts >= 10 && accuracy >= 0.8) {
    new_mastery = "mastered";
  } else if (attempts >= 5 && accuracy >= 0.6) {
    new_mastery = "practicing";
  } else if (attempts >= 3) {
    new_mastery = "learning";
  }

  // Weak flag
  const weak_flag = attempts >= 5 && accuracy < 0.6;

  return { new_difficulty, new_mastery, weak_flag };
}
