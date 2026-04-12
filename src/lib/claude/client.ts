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
