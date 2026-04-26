import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import nodemailer from "nodemailer";

// Bulk email via Gmail SMTP. Admin posts a list of recipient emails plus
// subject and body; we send via the chinhpv@gmail.com app password from env.
//
// Gmail free quota: 500 messages/day per personal account, plenty for the
// ~100-user beta cohort. If we ever outgrow this, swap to Resend with a
// verified domain.

export const maxDuration = 60;

interface NotifyRequest {
  recipients: string[];
  subject: string;
  body: string; // plain text or HTML
  is_html?: boolean;
}

interface SendResult {
  email: string;
  ok: boolean;
  error?: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { data: account } = await supabase
      .from("user_accounts")
      .select("is_admin")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!account?.is_admin) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const { recipients, subject, body, is_html } =
      (await request.json()) as NotifyRequest;

    if (!Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json(
        { error: "recipients required" },
        { status: 400 }
      );
    }
    if (!subject?.trim() || !body?.trim()) {
      return NextResponse.json(
        { error: "subject and body required" },
        { status: 400 }
      );
    }

    const cleaned = Array.from(
      new Set(
        recipients
          .map((s) => s.trim().toLowerCase())
          .filter((s) => EMAIL_RE.test(s))
      )
    );
    if (cleaned.length === 0) {
      return NextResponse.json(
        { error: "no valid emails after dedup" },
        { status: 400 }
      );
    }
    if (cleaned.length > 200) {
      return NextResponse.json(
        { error: "max 200 recipients per call" },
        { status: 400 }
      );
    }

    const fromEmail = process.env.GMAIL_FROM;
    const password = process.env.GMAIL_APP_PASSWORD;
    if (!fromEmail || !password) {
      return NextResponse.json(
        { error: "GMAIL_FROM / GMAIL_APP_PASSWORD env not set" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: fromEmail, pass: password },
      pool: true,
      maxConnections: 3,
    });

    // Send sequentially with small delay batching to stay under Gmail's
    // burst limits and so a single bad recipient doesn't fail the lot.
    const results: SendResult[] = [];
    for (const to of cleaned) {
      try {
        await transporter.sendMail({
          from: `"Toán Vui" <${fromEmail}>`,
          to,
          subject,
          [is_html ? "html" : "text"]: body,
        });
        results.push({ email: to, ok: true });
      } catch (e) {
        results.push({
          email: to,
          ok: false,
          error: e instanceof Error ? e.message : String(e),
        });
      }
    }
    transporter.close();

    const sent = results.filter((r) => r.ok).length;
    const failed = results.length - sent;

    return NextResponse.json({
      total: results.length,
      sent,
      failed,
      results,
    });
  } catch (err) {
    console.error("notify error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
