import { GeneratedExercise } from "@/types/exercise";

function stripFences(raw: string): string {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return cleaned;
}

function validateExercise(parsed: unknown): GeneratedExercise | null {
  if (!parsed || typeof parsed !== "object") return null;
  const p = parsed as Record<string, unknown>;
  if (!p.question || !p.answer || !p.question_type) return null;

  const exercise: GeneratedExercise = {
    question: String(p.question),
    answer: String(p.answer),
    question_type: p.question_type as GeneratedExercise["question_type"],
    choices: Array.isArray(p.choices) ? (p.choices as string[]) : undefined,
    hint: typeof p.hint === "string" ? p.hint : "",
    visual_context:
      typeof p.visual_context === "string" ? p.visual_context : undefined,
  };

  if (exercise.question_type === "multiple_choice") {
    if (!exercise.choices || exercise.choices.length !== 4) return null;
    if (!exercise.choices.includes(exercise.answer)) {
      exercise.choices[Math.floor(Math.random() * 4)] = exercise.answer;
    }
  }

  return exercise;
}

export function parseExerciseArrayResponse(raw: string): GeneratedExercise[] {
  try {
    let cleaned = stripFences(raw);

    // Some models (esp. Haiku) prepend a sentence like "Here's the array:" or
    // wrap output as `{ "exercises": [...] }`. Extract the first JSON array
    // we can find as a fallback.
    if (!cleaned.startsWith("[")) {
      const arrayMatch = cleaned.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (arrayMatch) cleaned = arrayMatch[0];
    }

    const parsed = JSON.parse(cleaned);
    const arr = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { exercises?: unknown }).exercises)
      ? (parsed as { exercises: unknown[] }).exercises
      : [parsed];
    const out = arr
      .map(validateExercise)
      .filter((x): x is GeneratedExercise => x !== null);

    if (out.length === 0) {
      console.error(
        "parseExerciseArrayResponse: parsed but no valid exercises. Raw start:",
        raw.slice(0, 300)
      );
    }
    return out;
  } catch (e) {
    console.error(
      "parseExerciseArrayResponse failed:",
      e instanceof Error ? e.message : String(e),
      "Raw start:",
      raw.slice(0, 300)
    );
    return [];
  }
}

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
