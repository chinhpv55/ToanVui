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
    const target = Math.min(count, 5);

    // Each slot gets a DIFFERENT variation hint → forces variety even in parallel
    const SLOT_HINTS = [
      "Dùng số nhỏ (1–3) hoặc bài toán đơn giản nhất của chủ đề này.",
      "Dùng số vừa (4–6) hoặc độ khó trung bình của chủ đề này.",
      "Dùng số lớn (7–9) hoặc bài khó hơn của chủ đề này.",
      "Đổi cách hỏi: tìm số còn thiếu, điền vào ô trống, hoặc hỏi ngược.",
      "Dùng bài toán có lời văn thực tế (đồ vật, con vật, học sinh...) liên quan chủ đề.",
    ];

    // Fire all calls in PARALLEL — each with a different slot hint to guarantee variety
    const promises = Array.from({ length: target }, async (_, i) => {
      const userPrompt = buildExercisePrompt(
        topic.ai_prompt_template,
        difficulty,
        question_type,
        SLOT_HINTS[i % SLOT_HINTS.length]
      );
      try {
        const message = await withTimeout(
          claude.messages.create({
            model: "claude-sonnet-4-20250514",
            max_tokens: 350,
            system: SYSTEM_PROMPT,
            messages: [{ role: "user", content: userPrompt }],
          }),
          12000
        );
        const text =
          message.content[0].type === "text" ? message.content[0].text : "";
        return parseExerciseResponse(text);
      } catch (e: unknown) {
        console.error(`Claude slot ${i + 1} failed:`, e instanceof Error ? e.message : e);
        return null;
      }
    });

    const results = await Promise.all(promises);

    // Dedup by normalized question AND answer
    const exercises: GeneratedExercise[] = [];
    const seenQuestions = new Set<string>();
    const seenAnswers = new Set<string>();

    for (const r of results) {
      if (!r) continue;
      const nq = normalizeQuestion(r.question);
      const na = r.answer.trim().toLowerCase();
      if (seenQuestions.has(nq) || seenAnswers.has(na)) continue;
      seenQuestions.add(nq);
      seenAnswers.add(na);
      exercises.push(r);
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
