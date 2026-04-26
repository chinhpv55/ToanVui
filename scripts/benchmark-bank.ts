/* eslint-disable @typescript-eslint/no-require-imports */
// Benchmark script: measure how fast `exercise_bank` queries are.
//
// Goal: prove the "lấy từ kho" path is fast (<500ms) so we know users
// hitting topics with bank coverage get an instant practice page.
//
// Usage from app/ dir:
//   npx tsx scripts/benchmark-bank.ts
//
// What it does:
//   1. Loads all topics from curriculum_topics
//   2. For each (topic, difficulty), fetches up to 10 rows from exercise_bank
//      and times the query
//   3. Summarizes p50/p95/max latency, per-topic coverage, and how many
//      topics would force a Claude fallback at runtime

import { createClient } from "@supabase/supabase-js";
import * as fs from "fs";
import * as path from "path";

// Load .env.local manually (no extra deps).
const envPath = path.join(__dirname, "..", ".env.local");
const envFile = fs.readFileSync(envPath, "utf-8");
for (const line of envFile.split("\n")) {
  const m = line.match(/^([A-Z_]+)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const DIFFICULTIES = ["easy", "medium", "hard"] as const;
const PRACTICE_BATCH = 10; // how many questions a real practice session asks for

interface TopicRow {
  id: string;
  topic_name: string;
  grade: number;
}

interface Sample {
  topic: string;
  grade: number;
  difficulty: string;
  rows: number;
  ms: number;
  fullCoverage: boolean;
}

function pct(arr: number[], p: number): number {
  const sorted = [...arr].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((sorted.length - 1) * p));
  return sorted[idx];
}

async function main() {
  console.log("→ Loading curriculum_topics…");
  const { data: topics, error: topicsErr } = await supabase
    .from("curriculum_topics")
    .select("id, topic_name, grade")
    .order("grade")
    .order("topic_name");
  if (topicsErr || !topics) {
    console.error("Failed to load topics:", topicsErr);
    process.exit(1);
  }
  console.log(`  Found ${topics.length} topics.\n`);

  // Warm-up: connection + DNS + TLS handshake.
  await supabase.from("exercise_bank").select("id", { head: true, count: "exact" }).limit(1);

  const samples: Sample[] = [];

  let done = 0;
  const total = topics.length * DIFFICULTIES.length;
  process.stdout.write("→ Probing bank ");

  for (const t of topics as TopicRow[]) {
    for (const difficulty of DIFFICULTIES) {
      const t0 = performance.now();
      const { data, error } = await supabase
        .from("exercise_bank")
        .select("id, question, answer")
        .eq("topic_id", t.id)
        .eq("difficulty", difficulty)
        .limit(PRACTICE_BATCH);
      const ms = performance.now() - t0;

      if (error) {
        console.error(`\n[${t.topic_name}/${difficulty}]`, error.message);
        continue;
      }

      const rows = data?.length ?? 0;
      samples.push({
        topic: t.topic_name,
        grade: t.grade,
        difficulty,
        rows,
        ms,
        fullCoverage: rows >= PRACTICE_BATCH,
      });

      done++;
      if (done % 50 === 0) process.stdout.write(".");
    }
  }
  console.log(" done.\n");

  // ─── Latency summary ──────────────────────────────────────────
  const latencies = samples.map((s) => s.ms);
  console.log("=".repeat(60));
  console.log("LATENCY (single bank query, 1 round-trip Vercel→Supabase)");
  console.log("=".repeat(60));
  console.log(`  samples : ${samples.length}`);
  console.log(`  min     : ${Math.min(...latencies).toFixed(0)} ms`);
  console.log(`  p50     : ${pct(latencies, 0.5).toFixed(0)} ms`);
  console.log(`  p95     : ${pct(latencies, 0.95).toFixed(0)} ms`);
  console.log(`  max     : ${Math.max(...latencies).toFixed(0)} ms`);
  console.log(
    `  avg     : ${(latencies.reduce((a, b) => a + b, 0) / latencies.length).toFixed(0)} ms`
  );
  console.log();
  console.log(
    "  (note: this is from your laptop. Vercel→Supabase is typically 2-3x faster.)"
  );

  // ─── Coverage summary ─────────────────────────────────────────
  const fullCount = samples.filter((s) => s.fullCoverage).length;
  const emptyCount = samples.filter((s) => s.rows === 0).length;
  const partialCount = samples.length - fullCount - emptyCount;

  console.log();
  console.log("=".repeat(60));
  console.log(`COVERAGE (per (topic × difficulty), threshold = ${PRACTICE_BATCH} rows)`);
  console.log("=".repeat(60));
  console.log(
    `  full (${PRACTICE_BATCH}+ rows, instant) : ${fullCount}/${samples.length} (${((fullCount / samples.length) * 100).toFixed(0)}%)`
  );
  console.log(
    `  partial (1-${PRACTICE_BATCH - 1} rows)        : ${partialCount}/${samples.length} (${((partialCount / samples.length) * 100).toFixed(0)}%)`
  );
  console.log(
    `  empty (0 rows, MUST call Claude)  : ${emptyCount}/${samples.length} (${((emptyCount / samples.length) * 100).toFixed(0)}%)`
  );

  // ─── Top 10 empty cells (most urgent to seed) ─────────────────
  const emptyCells = samples.filter((s) => s.rows === 0);
  if (emptyCells.length > 0) {
    console.log();
    console.log("=".repeat(60));
    console.log(`EMPTY CELLS (first 15 of ${emptyCells.length}) — these force Claude calls today`);
    console.log("=".repeat(60));
    for (const s of emptyCells.slice(0, 15)) {
      console.log(`  L${s.grade} | ${s.difficulty.padEnd(6)} | ${s.topic}`);
    }
  }

  // ─── User-experience estimate ─────────────────────────────────
  console.log();
  console.log("=".repeat(60));
  console.log("ESTIMATED USER EXPERIENCE (assuming uniform topic picks)");
  console.log("=".repeat(60));
  const fastP = (fullCount / samples.length) * 100;
  const claudeP = (emptyCount / samples.length) * 100;
  const partialP = (partialCount / samples.length) * 100;
  console.log(
    `  ${fastP.toFixed(0)}% lượt → instant từ kho   (~${pct(latencies, 0.5).toFixed(0)} ms từ máy anh)`
  );
  console.log(
    `  ${partialP.toFixed(0)}% lượt → 1 phần kho + 1 call Claude (~3-8s)`
  );
  console.log(
    `  ${claudeP.toFixed(0)}% lượt → toàn bộ Claude  (~5-15s)`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
