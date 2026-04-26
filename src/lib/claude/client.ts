import Anthropic from "@anthropic-ai/sdk";

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    // Use VUITOAN_CLAUDE_API_KEY first (avoids conflicts with Claude Code env),
    // fallback to ANTHROPIC_API_KEY
    const apiKey = process.env.VUITOAN_CLAUDE_API_KEY || process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error("VUITOAN_CLAUDE_API_KEY or ANTHROPIC_API_KEY is not set");
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

// Pick the right model for the topic's grade level.
//   Grade 1-5: Haiku 4.5  — ~12x cheaper, plenty for elementary arithmetic.
//   Grade 6-9: Sonnet 4.6 — better reasoning for algebra/geometry word problems.
//
// `mode="seed"` forces Sonnet for ALL grades. Seeding is a one-time admin
// cost — Sonnet's higher pass-rate on parser+dedup fills the bank in fewer
// calls. Runtime requests still use the cheap Haiku for grade 1-5.
export type ModelMode = "runtime" | "seed";

export function pickModelForGrade(grade: number, mode: ModelMode = "runtime"): string {
  if (mode === "seed") return "claude-sonnet-4-6";
  if (grade <= 5) return "claude-haiku-4-5-20251001";
  return "claude-sonnet-4-6";
}
