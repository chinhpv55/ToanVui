import { GeneratedExercise } from "@/types/exercise";

export function parseExerciseResponse(raw: string): GeneratedExercise | null {
  try {
    // Strip markdown backticks if present
    let cleaned = raw.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const parsed = JSON.parse(cleaned);

    // Validate required fields
    if (!parsed.question || !parsed.answer || !parsed.question_type) {
      return null;
    }

    // Ensure answer is string
    const exercise: GeneratedExercise = {
      question: String(parsed.question),
      answer: String(parsed.answer),
      question_type: parsed.question_type,
      choices: parsed.choices || null,
      hint: parsed.hint || "",
      visual_context: parsed.visual_context || undefined,
    };

    // Validate multiple_choice has 4 choices including answer
    if (exercise.question_type === "multiple_choice") {
      if (!exercise.choices || exercise.choices.length !== 4) {
        return null;
      }
      if (!exercise.choices.includes(exercise.answer)) {
        exercise.choices[Math.floor(Math.random() * 4)] = exercise.answer;
      }
    }

    return exercise;
  } catch {
    return null;
  }
}
