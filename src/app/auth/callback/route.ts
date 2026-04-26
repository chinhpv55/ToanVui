import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

// Supabase redirects here after OAuth provider (Google) completes.
// We exchange the one-time `code` for a session cookie, then route the
// user based on whether they have a student profile yet.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error_description");

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/login?oauth_error=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?oauth_error=missing_code`);
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(
      `${origin}/login?oauth_error=${encodeURIComponent(error.message)}`
    );
  }

  // First-time Google users have no students row; send them to complete profile.
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?oauth_error=no_session`);
  }

  const { data: student } = await supabase
    .from("students")
    .select("id")
    .eq("parent_id", user.id)
    .maybeSingle();

  return NextResponse.redirect(
    student ? `${origin}/home` : `${origin}/register/complete`
  );
}
