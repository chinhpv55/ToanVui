import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/claude/client";
import { SYSTEM_PROMPT, buildExercisePrompt } from "@/lib/claude/prompts";
import { parseExerciseResponse } from "@/lib/claude/parser";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { ExerciseRequest, GeneratedExercise } from "@/types/exercise";

// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), ms)
    ),
  ]);
}

export async function POST(request: NextRequest) {
  try {
    const body: ExerciseRequest = await request.json();
    const { topic_id, difficulty, question_type, count = 1 } = body;

    // Fetch topic template from DB
    const supabase = createServerSupabaseClient();
    const { data: topic, error } = await supabase
      .from("curriculum_topics")
      .select("ai_prompt_template, topic_name")
      .eq("id", topic_id)
      .single();

    if (error || !topic) {
      console.error("Topic not found:", topic_id, error);
      return NextResponse.json(
        { error: "Topic not found" },
        { status: 404 }
      );
    }

    // Build prompt
    const userPrompt = buildExercisePrompt(
      topic.ai_prompt_template,
      difficulty,
      question_type
    );

    const claude = getClaudeClient();
    const exercises: GeneratedExercise[] = [];

    // Generate exercises with 15s timeout per call
    const errors: string[] = [];
    const promises = Array.from({ length: Math.min(count, 5) }, async () => {
      try {
        console.log("[generate-exercise] Calling Claude API...");
        const message = await withTimeout(
          claude.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 300,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
          15000
        );

        const text =
          message.content[0].type === "text" ? message.content[0].text : "";
        console.log("[generate-exercise] Claude raw response:", text.substring(0, 200));
        const parsed = parseExerciseResponse(text);
        console.log("[generate-exercise] Parsed:", parsed?.question);
        return parsed;
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error("Claude API call failed:", errMsg);
        errors.push(errMsg);
        return null;
      }
    });

    const results = await Promise.all(promises);
    for (const r of results) {
      if (r) exercises.push(r);
    }

    // If all Claude calls failed, return a fallback exercise
    if (exercises.length === 0) {
      console.warn("All Claude calls failed, returning fallback exercise. Errors:", errors);
      exercises.push({
        question: `Tính: 6 × 7 = ?`,
        answer: "42",
        question_type: "fill_blank",
        hint: "Nhẩm bảng nhân 6",
        choices: undefined,
      });
    }

    return NextResponse.json({ questions: exercises });
  } catch (err) {
    console.error("Generate exercise error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
