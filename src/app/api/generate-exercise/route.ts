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
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    const claude = getClaudeClient();
    const exercises: GeneratedExercise[] = [];
    const usedAnswers: string[] = [];
    const target = Math.min(count, 5);

    // Generate SEQUENTIALLY so each call knows what was already generated
    for (let i = 0; i < target; i++) {
      const userPrompt = buildExercisePrompt(
        topic.ai_prompt_template,
        difficulty,
        question_type,
        usedAnswers
      );

      try {
        const message = await withTimeout(
          claude.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 350,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
          15000
        );

        const text =
          message.content[0].type === "text" ? message.content[0].text : "";
        const parsed = parseExerciseResponse(text);

        if (parsed) {
          // Dedup: skip if same answer already used (catches 7×4=28 repeated)
          const normalizedAnswer = parsed.answer.trim().toLowerCase();
          const normalizedQuestion = normalizeQuestion(parsed.question);
          const isDupAnswer = usedAnswers.includes(normalizedAnswer);
          const isDupQuestion = exercises.some(
            (e) => normalizeQuestion(e.question) === normalizedQuestion
          );

          if (!isDupAnswer && !isDupQuestion) {
            exercises.push(parsed);
            usedAnswers.push(normalizedAnswer);
          } else {
            console.log("[generate-exercise] Skipped duplicate:", parsed.question);
          }
        }
      } catch (e: unknown) {
        const errMsg = e instanceof Error ? e.message : String(e);
        console.error(`Claude call ${i + 1} failed:`, errMsg);
      }
    }

    // Fallback if everything failed
    if (exercises.length === 0) {
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
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Normalize question text for dedup: lowercase, strip spaces, normalize ×/x/*, ÷//
function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[×x\*]/g, "*")
    .replace(/[÷\/]/g, "/")
    .replace(/[?？]/g, "?");
}
