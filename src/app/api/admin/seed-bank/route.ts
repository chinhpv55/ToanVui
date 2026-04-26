import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient, pickModelForGrade } from "@/lib/claude/client";
import { buildBatchSystemPrompt, buildBatchExercisePrompt } from "@/lib/claude/prompts";
import { parseExerciseArrayResponse, PARSER_VERSION } from "@/lib/claude/parser";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DifficultyLevel } from "@/types/database";
import { GeneratedExercise } from "@/types/exercise";

// Seed the exercise_bank for ONE topic up to `target_per_difficulty` items
// across all 3 difficulty levels. Admin-only.
//
// Caller pattern: frontend loops over topics and POSTs once per topic, so
// each request stays under Vercel's per-request timeout.

interface SeedRequest {
  topic_id: string;
  target_per_difficulty?: number; // default 30
}

interface DifficultyResult {
  difficulty: DifficultyLevel;
  before: number;
  parsed: number; // exercises parser returned (before insert)
  added: number;  // rows actually inserted (after RLS + dedup)
  after: number;
  ai_calls: number;
}

// Vercel: explicit 60s ceiling. Pro plan can extend to 300s, Hobby caps
// at 60s. Either way this gives the route a deterministic budget instead
// of inheriting plan defaults (10s/15s) which truncate seeding.
export const maxDuration = 60;

const DIFFICULTIES: DifficultyLevel[] = ["easy", "medium", "hard"];
const BATCH_SIZE = 5;             // exercises per Claude call
const MAX_TOKENS_PER_BATCH = 600; // generous per-exercise budget for verbose Vietnamese hints
// Per-difficulty parallel burst. 7 calls * 5 = 35 candidates → after Claude's
// internal repetition (~10-20%) we expect 28-32 unique → enough to hit
// target=30 in one shot most of the time. 7 parallel Haiku calls finish in
// ~5-8s vs 30+ s sequential, so 3 difficulties fit comfortably under 60s.
const BURST_SIZE = 7;

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
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Admin gate
    const { data: account } = await supabase
      .from("user_accounts")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!account?.is_admin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as SeedRequest;
    const { topic_id } = body;
    const targetPerDiff = Math.min(Math.max(body.target_per_difficulty ?? 30, 1), 100);

    if (!topic_id) {
      return NextResponse.json({ error: "topic_id required" }, { status: 400 });
    }

    const { data: topic, error: topicErr } = await supabase
      .from("curriculum_topics")
      .select("ai_prompt_template, topic_name, grade, series")
      .eq("id", topic_id)
      .single();
    if (topicErr || !topic) {
      return NextResponse.json({ error: "topic not found" }, { status: 404 });
    }

    const claude = getClaudeClient();
    const model = pickModelForGrade(topic.grade);

    // Debug: capture the first non-empty Claude raw response across all
    // difficulties so the admin panel Network tab can see exactly what's
    // coming back. Preview (start), length, end aid truncation diagnosis.
    let rawPreview: string | undefined;
    let rawLength: number | undefined;
    let rawEnd: string | undefined;

    // Step 1: parallel-count current bank for all 3 difficulties.
    const beforeCounts = await Promise.all(
      DIFFICULTIES.map(async (difficulty) => {
        const { count } = await supabase
          .from("exercise_bank")
          .select("*", { count: "exact", head: true })
          .eq("topic_id", topic_id)
          .eq("difficulty", difficulty);
        return { difficulty, before: count ?? 0 };
      })
    );

    const systemPrompt = buildBatchSystemPrompt(topic.grade, topic.series);

    // Step 2: build flat call list. Each difficulty contributes BURST_SIZE
    // parallel calls UNLESS already at/over target. Tagging each promise
    // with its difficulty lets us re-group results after Promise.all.
    type Tagged = { difficulty: DifficultyLevel; text: string | null };
    const flatCalls: Promise<Tagged>[] = [];
    for (const { difficulty, before } of beforeCounts) {
      if (before >= targetPerDiff) continue;
      const userPrompt = buildBatchExercisePrompt(
        topic.ai_prompt_template,
        difficulty,
        "fill_blank",
        BATCH_SIZE
      );
      for (let i = 0; i < BURST_SIZE; i++) {
        flatCalls.push(
          withTimeout(
            claude.messages.create({
              model,
              max_tokens: MAX_TOKENS_PER_BATCH * BATCH_SIZE,
              system: systemPrompt,
              messages: [{ role: "user", content: userPrompt }],
            }),
            25000
          )
            .then(
              (m): Tagged => ({
                difficulty,
                text: m.content[0].type === "text" ? m.content[0].text : "",
              })
            )
            .catch((e): Tagged => {
              console.error(
                "seed-bank Claude call failed:",
                e instanceof Error ? e.message : String(e),
                `topic=${topic.topic_name} diff=${difficulty} model=${model}`
              );
              return { difficulty, text: null };
            })
        );
      }
    }

    // Step 3: ONE Promise.all for ALL difficulties. Total wall time ≈ slowest
    // single Claude call (~10-20s typical), not sum across difficulties.
    const tagged = await Promise.all(flatCalls);
    const totalCalls = flatCalls.length;

    // Step 4: group parsed exercises by difficulty.
    const freshByDiff = new Map<DifficultyLevel, GeneratedExercise[]>();
    for (const t of tagged) {
      if (!t.text) continue;
      if (rawPreview === undefined) {
        rawPreview = t.text.slice(0, 1500);
        rawLength = t.text.length;
        rawEnd = t.text.slice(-300);
      }
      const list = freshByDiff.get(t.difficulty) ?? [];
      list.push(...parseExerciseArrayResponse(t.text));
      freshByDiff.set(t.difficulty, list);
    }

    // Step 5: insert per difficulty (sequential to avoid Postgres deadlocks
    // on the same unique index, but each insert is fast).
    const results: DifficultyResult[] = [];
    for (const { difficulty, before } of beforeCounts) {
      const fresh = freshByDiff.get(difficulty) ?? [];
      const parsed = fresh.length;
      const aiCalls = before >= targetPerDiff ? 0 : BURST_SIZE;

      let added = 0;
      if (fresh.length > 0) {
        const rows = fresh.map((q) => ({
          topic_id,
          difficulty,
          question_type: q.question_type,
          question: q.question,
          answer: q.answer,
          choices: q.choices ?? null,
          hint: q.hint ?? null,
        }));

        const { data: insertedRows, error: insertErr } = await supabase
          .from("exercise_bank")
          .upsert(rows, {
            onConflict: "topic_id,difficulty,question_norm",
            ignoreDuplicates: true,
          })
          .select("id");

        if (insertErr) {
          console.error("seed-bank insert error:", insertErr);
        } else {
          added = insertedRows?.length ?? 0;
        }
      }

      results.push({
        difficulty,
        before,
        parsed,
        added,
        after: before + added,
        ai_calls: aiCalls,
      });
    }

    return NextResponse.json({
      api_version: "1.3.11",
      parser_version: PARSER_VERSION,
      topic_id,
      topic_name: topic.topic_name,
      grade: topic.grade,
      model,
      total_ai_calls: totalCalls,
      results,
      truncated: false, // parallel burst is single-shot per difficulty; no truncation concept
      raw_preview: rawPreview ?? null,
      raw_length: rawLength ?? null,
      raw_end: rawEnd ?? null,
    });
  } catch (err) {
    console.error("seed-bank error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
