import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient, pickModelForGrade } from "@/lib/claude/client";
import { buildBatchSystemPrompt, buildBatchExercisePrompt } from "@/lib/claude/prompts";
import { parseExerciseArrayResponse } from "@/lib/claude/parser";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  checkUserAccess,
  incrementExerciseCount,
  buildAccessDeniedPayload,
} from "@/lib/userAccount";
import { ExerciseRequest, GeneratedExercise } from "@/types/exercise";
import { SeriesType } from "@/types/database";

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
    const target = Math.min(Math.max(count, 1), 5);

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

    // ─── Fetch topic (need template + grade for model picker) ───
    const { data: topic, error: topicErr } = await supabase
      .from("curriculum_topics")
      .select("ai_prompt_template, topic_name, grade, series")
      .eq("id", topic_id)
      .single();

    if (topicErr || !topic) {
      console.error("Topic not found:", topic_id, topicErr);
      return NextResponse.json({ error: "Topic not found" }, { status: 404 });
    }

    // ─── 1) Try the bank first ──────────────────────────────────
    const { data: bankRows, error: bankErr } = await supabase.rpc(
      "get_unseen_exercises",
      {
        p_student_id: user.id,
        p_topic_id: topic_id,
        p_difficulty: difficulty,
        p_count: target,
      }
    );
    if (bankErr) console.error("get_unseen_exercises error:", bankErr);

    interface BankRow {
      id: string;
      question: string;
      answer: string;
      question_type: GeneratedExercise["question_type"];
      choices: string[] | null;
      hint: string | null;
    }
    const fromBank: BankRow[] = (bankRows as BankRow[]) || [];

    const exercises: GeneratedExercise[] = fromBank.map((b) => ({
      question: b.question,
      answer: b.answer,
      question_type: b.question_type,
      choices: b.choices ?? undefined,
      hint: b.hint ?? "",
    }));
    const seenBankIds: string[] = fromBank.map((b) => b.id);

    // ─── 2) If bank short, ask Claude for the rest ──────────────
    const missing = target - exercises.length;
    if (missing > 0) {
      const fresh = await generateAndStoreFresh(
        supabase,
        topic.ai_prompt_template,
        difficulty,
        question_type,
        missing,
        topic.grade,
        topic.series,
        topic_id
      );
      exercises.push(...fresh);
    }

    // ─── Dedup (bank rows already unique by question_norm; this guards
    //     against fresh AI output colliding with bank items) ────
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
      // Last-ditch fallback so practice page doesn't break.
      deduped.push({
        question: `Tính: 6 × 7 = ?`,
        answer: "42",
        question_type: "fill_blank",
        hint: "Nhẩm bảng nhân 6",
        choices: undefined,
      });
    }

    // ─── 3) Mark bank items as seen for this student ────────────
    if (seenBankIds.length > 0) {
      const { error: markErr } = await supabase.rpc("mark_exercises_seen", {
        p_student_id: user.id,
        p_exercise_ids: seenBankIds,
      });
      if (markErr) console.error("mark_exercises_seen error:", markErr);
    }

    // ─── 4) Increment trial counter (only on session-start) ─────
    if (access.allowed && access.plan === "trial" && is_session_start) {
      await incrementExerciseCount(supabase, user.id, 1);
    }

    return NextResponse.json({ questions: deduped });
  } catch (err) {
    console.error("Generate exercise error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ─── Generate `n` exercises via Claude and persist them to the bank ──
async function generateAndStoreFresh(
  supabase: ReturnType<typeof createServerSupabaseClient>,
  template: string,
  difficulty: ExerciseRequest["difficulty"],
  questionType: ExerciseRequest["question_type"],
  n: number,
  grade: number,
  series: SeriesType,
  topicId: string
): Promise<GeneratedExercise[]> {
  const claude = getClaudeClient();
  const userPrompt = buildBatchExercisePrompt(template, difficulty, questionType, n);
  const model = pickModelForGrade(grade);

  let fresh: GeneratedExercise[] = [];
  try {
    const message = await withTimeout(
      claude.messages.create({
        model,
        max_tokens: 350 * n,
        system: buildBatchSystemPrompt(grade, series),
        messages: [{ role: "user", content: userPrompt }],
      }),
      20000
    );
    const text =
      message.content[0].type === "text" ? message.content[0].text : "";
    fresh = parseExerciseArrayResponse(text);
  } catch (e: unknown) {
    console.error("Claude call failed:", e instanceof Error ? e.message : e);
  }

  // Persist to bank (best-effort; ignore unique-violation collisions).
  if (fresh.length > 0) {
    const rows = fresh.map((q) => ({
      topic_id: topicId,
      difficulty,
      question_type: q.question_type,
      question: q.question,
      answer: q.answer,
      choices: q.choices ?? null,
      hint: q.hint ?? null,
    }));
    const { error } = await supabase
      .from("exercise_bank")
      .insert(rows, { count: "exact" });
    if (error && !error.message.includes("duplicate")) {
      console.error("exercise_bank insert error:", error);
    }
  }

  return fresh;
}

function normalizeQuestion(q: string): string {
  return q
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/[×x\*]/g, "*")
    .replace(/[÷\/]/g, "/")
    .replace(/[?？]/g, "?");
}
