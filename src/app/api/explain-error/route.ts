import { NextRequest, NextResponse } from "next/server";
import { getClaudeClient } from "@/lib/claude/client";
import {
  EXPLANATION_SYSTEM_PROMPT,
  buildExplanationPrompt,
} from "@/lib/claude/prompts";
import { ExplanationRequest } from "@/types/exercise";

export async function POST(request: NextRequest) {
  try {
    const body: ExplanationRequest = await request.json();
    const { question, student_answer, correct_answer, topic_name } = body;

    const claude = getClaudeClient();
    const userPrompt = buildExplanationPrompt(
      question,
      student_answer,
      correct_answer,
      topic_name
    );

    const message = await claude.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 200,
      system: EXPLANATION_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
    });

    const explanation =
      message.content[0].type === "text" ? message.content[0].text : "";

    return NextResponse.json({ explanation });
  } catch (err) {
    console.error("Explain error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
