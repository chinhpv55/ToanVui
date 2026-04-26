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
  added: number;
  after: number;
  ai_calls: number;
}

const DIFFICULTIES: DifficultyLevel[] = ["easy", "medium", "hard"];
const BATCH_SIZE = 5;            // exercises per Claude call
const MAX_TOKENS_PER_BATCH = 600; // generous per-exercise budget for verbose Vietnamese hints
const MAX_CALLS_PER_REQUEST = 12; // hard cap to bound cost per HTTP request

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

    let totalCalls = 0;
    const results: DifficultyResult[] = [];
    // Debug: capture the first Claude raw response so the admin panel
    // Network tab can see exactly what's coming back when the parser
    // returns 0 exercises. We capture preview (start), length, and end
    // separately because seeing both ends helps detect truncation.
    let rawPreview: string | undefined;
    let rawLength: number | undefined;
    let rawEnd: string | undefined;

    for (const difficulty of DIFFICULTIES) {
      // Count current items in bank for this (topic, difficulty)
      const { count: beforeCount } = await supabase
        .from("exercise_bank")
        .select("*", { count: "exact", head: true })
        .eq("topic_id", topic_id)
        .eq("difficulty", difficulty);

      const before = beforeCount ?? 0;
      let added = 0;
      let aiCalls = 0;

      while (
        before + added < targetPerDiff &&
        totalCalls < MAX_CALLS_PER_REQUEST
      ) {
        const userPrompt = buildBatchExercisePrompt(
          topic.ai_prompt_template,
          difficulty,
          "fill_blank", // hint only — Claude varies type per spec
          BATCH_SIZE
        );

        let fresh: GeneratedExercise[] = [];
        try {
          const message = await withTimeout(
            claude.messages.create({
              model,
              max_tokens: MAX_TOKENS_PER_BATCH * BATCH_SIZE,
              system: buildBatchSystemPrompt(topic.grade, topic.series),
              messages: [{ role: "user", content: userPrompt }],
            }),
            25000
          );
          const text =
            message.content[0].type === "text" ? message.content[0].text : "";
          if (rawPreview === undefined) {
            rawPreview = text.slice(0, 1500);
            rawLength = text.length;
            rawEnd = text.slice(-300);
          }
          fresh = parseExerciseArrayResponse(text);
          if (fresh.length === 0) {
            console.warn(
              `seed-bank: 0 exercises parsed for ${topic.topic_name} (${difficulty}, model=${model}). Stopping difficulty.`
            );
          }
        } catch (e) {
          console.error(
            "seed-bank Claude call failed:",
            e instanceof Error ? e.message : String(e),
            `topic=${topic.topic_name} diff=${difficulty} model=${model}`
          );
          break; // stop this difficulty on error, move to next
        }
        aiCalls++;
        totalCalls++;

        if (fresh.length === 0) break;

        const rows = fresh.map((q) => ({
          topic_id,
          difficulty,
          question_type: q.question_type,
          question: q.question,
          answer: q.answer,
          choices: q.choices ?? null,
          hint: q.hint ?? null,
        }));

        // Insert with onConflict to skip duplicates (unique idx by question_norm)
        const { count: insertCount, error: insertErr } = await supabase
          .from("exercise_bank")
          .upsert(rows, {
            onConflict: "topic_id,difficulty,question_norm",
            ignoreDuplicates: true,
            count: "exact",
          });

        if (insertErr) {
          console.error("seed-bank insert error:", insertErr);
          break;
        }
        added += insertCount ?? 0;
      }

      const { count: afterCount } = await supabase
        .from("exercise_bank")
        .select("*", { count: "exact", head: true })
        .eq("topic_id", topic_id)
        .eq("difficulty", difficulty);

      results.push({
        difficulty,
        before,
        added,
        after: afterCount ?? before + added,
        ai_calls: aiCalls,
      });

      if (totalCalls >= MAX_CALLS_PER_REQUEST) break;
    }

    return NextResponse.json({
      api_version: "1.3.7",
      parser_version: PARSER_VERSION,
      topic_id,
      topic_name: topic.topic_name,
      grade: topic.grade,
      model,
      total_ai_calls: totalCalls,
      results,
      truncated: totalCalls >= MAX_CALLS_PER_REQUEST,
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
