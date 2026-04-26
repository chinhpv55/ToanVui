import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/claude/client";
import { BATCH_SYSTEM_PROMPT, buildBatchExercisePrompt } from "@/lib/claude/prompts";
import { parseExerciseArrayResponse } from "@/lib/claude/parser";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  checkUserAccess,
  incrementExerciseCount,
  buildAccessDeniedPayload,
} from "@/lib/userAccount";
import { ExerciseRequest, GeneratedExercise } from "@/types/exercise";

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
    const {
      topic_id,
      difficulty,
      question_type,
      count = 1,
      is_session_start = true,
    } = body;

    const supabase = createServerSupabaseClient();

    // ─── Auth + plan gating ─────────────────────────────────────
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const access = await checkUserAccess(supabase, user.id);
    if (!access.allowed) {
      return NextResponse.json(buildAccessDeniedPayload(access.reason), {
        status: 402,
      });
    }

    // ─── Fetch topic ────────────────────────────────────────────
    const { data: topic, error } = await supabase
      .from("curriculum_topics")
      .select("ai_prompt_template, topic_name")
      .eq("id", topic_id)
      .single();

    if (error || !topic) {
      console.error("Topic not found:", topic_id, error);
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // ─── Generate exercises (ONE call returning an array) ───────
    // Old code fired 5 parallel Sonnet calls per request. We now ask Claude
    // for the whole array in one call → ~5x cheaper input cost, similar
    // output cost, simpler error path.
    const claude = getClaudeClient();
    const target = Math.min(Math.max(count, 1), 5);

    const userPrompt = buildBatchExercisePrompt(
      topic.ai_prompt_template,
      difficulty,
      question_type,
      target
    );

    let exercises: GeneratedExercise[] = [];
    try {
      const message = await withTimeout(
        claude.messages.create({
          model: "claude-sonnet-4-20250514",
          max_tokens: 350 * target, // ~350 tokens per exercise
          system: BATCH_SYSTEM_PROMPT,
          messages: [{ role: "user", content: userPrompt }],
        }),
        20000
      );
      const text =
        message.content[0].type === "text" ? message.content[0].text : "";
      exercises = parseExerciseArrayResponse(text);
    } catch (e: unknown) {
      console.error(
        "Claude batch call failed:",
        e instanceof Error ? e.message : e
      );
    }

    // ─── Dedup by normalized question + answer ──────────────────
    const seenQuestions = new Set<string>();
    const seenAnswers = new Set<string>();
    const deduped: GeneratedExercise[] = [];
    for (const r of exercises) {
      const nq = normalizeQuestion(r.question);
      const na = r.answer.trim().toLowerCase();
      if (seenQuestions.has(nq) || seenAnswers.has(na)) continue;
      seenQuestions.add(nq);
      seenAnswers.add(na);
      deduped.push(r);
    }

    if (deduped.length === 0) {
      // Fallback so practice doesn't break if Claude failed entirely
      deduped.push({
        question: `Tính: 6 × 7 = ?`,
        answer: "42",
        question_type: "fill_blank",
        hint: "Nhẩm bảng nhân 6",
        choices: undefined,
      });
    }

    // ─── Increment trial counter (only on session-start) ────────
    // 1 increment = 1 luyện-tập session. Prefetch calls (is_session_start
    // = false) reuse the same credit so a session = 1 unit, matching
    // "trial: 10 lần bài tập".
    if (access.allowed && access.plan === "trial" && is_session_start) {
      await incrementExerciseCount(supabase, user.id, 1);
    }

    return NextResponse.json({ questions: deduped });
  } catch (err) {
    console.error("Generate exercise error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[×x\*]/g, "*")
    .replace(/[÷\/]/g, "/")
    .replace(/[?？]/g, "?");
}
