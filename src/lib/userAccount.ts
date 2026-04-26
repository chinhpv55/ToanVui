import type { SupabaseClient } from "@supabase/supabase-js";

// Trial limits — adjust here if anh muốn nới/thắt:
//   - 10 lần luyện-tập (= 10 phiên; mỗi phiên 10 câu hỏi). Backend chỉ tăng
//     bộ đếm khi request có is_session_start=true; prefetch không tính.
//   - HOẶC 7 ngày kể từ trial_started_at — cái nào đến trước.
export const TRIAL_MAX_EXERCISES = 10;
export const TRIAL_MAX_DAYS = 7;

export const ADMIN_CONTACT = {
  zalo: "0949908210",
  email: "chinhpv@gmail.com",
};

export type AccessGranted =
  | { allowed: true; plan: "active" | "admin" }
  | { allowed: true; plan: "trial"; remaining: number; daysLeft: number };

export type AccessDenied = {
  allowed: false;
  reason: "suspended" | "trial_expired_uses" | "trial_expired_days" | "no_account";
};

export type AccessDecision = AccessGranted | AccessDenied;

interface UserAccountRow {
  plan: "trial" | "active" | "suspended";
  trial_started_at: string;
  exercise_count: number;
  is_admin: boolean;
}

export async function checkUserAccess(
  supabase: SupabaseClient,
  userId: string
): Promise<AccessDecision> {
  const { data, error } = await supabase
    .from("user_accounts")
    .select("plan, trial_started_at, exercise_count, is_admin")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("checkUserAccess query error:", error);
    return { allowed: false, reason: "no_account" };
  }

  // Lazy-bootstrap: create row if missing (e.g. user signed up before the
  // trigger existed). Default to trial.
  if (!data) {
    const { error: insertErr } = await supabase
      .from("user_accounts")
      .insert({ user_id: userId, plan: "trial" });
    if (insertErr) {
      console.error("user_accounts lazy-create failed:", insertErr);
      return { allowed: false, reason: "no_account" };
    }
    return { allowed: true, plan: "trial", remaining: TRIAL_MAX_EXERCISES, daysLeft: TRIAL_MAX_DAYS };
  }

  const account = data as UserAccountRow;

  if (account.is_admin) return { allowed: true, plan: "admin" };
  if (account.plan === "active") return { allowed: true, plan: "active" };
  if (account.plan === "suspended") return { allowed: false, reason: "suspended" };

  // plan === "trial"
  const startedMs = new Date(account.trial_started_at).getTime();
  const daysSince = (Date.now() - startedMs) / (1000 * 60 * 60 * 24);
  if (daysSince > TRIAL_MAX_DAYS) {
    return { allowed: false, reason: "trial_expired_days" };
  }
  if (account.exercise_count >= TRIAL_MAX_EXERCISES) {
    return { allowed: false, reason: "trial_expired_uses" };
  }

  return {
    allowed: true,
    plan: "trial",
    remaining: TRIAL_MAX_EXERCISES - account.exercise_count,
    daysLeft: Math.max(0, Math.ceil(TRIAL_MAX_DAYS - daysSince)),
  };
}

export async function incrementExerciseCount(
  supabase: SupabaseClient,
  userId: string,
  delta = 1
): Promise<void> {
  const { error } = await supabase.rpc("increment_exercise_count", {
    uid: userId,
    delta,
  });
  if (error) {
    console.error("increment_exercise_count failed:", error);
  }
}

export function buildAccessDeniedPayload(reason: AccessDenied["reason"]) {
  const titles: Record<AccessDenied["reason"], string> = {
    suspended: "Tài khoản đang tạm khoá",
    trial_expired_uses: "Đã hết lượt dùng thử",
    trial_expired_days: "Đã hết thời gian dùng thử",
    no_account: "Không xác định được tài khoản",
  };
  return {
    error: "access_denied",
    reason,
    title: titles[reason],
    message: `Bạn đã hết thời gian dùng thử. Vui lòng liên hệ admin để được kích hoạt: Zalo ${ADMIN_CONTACT.zalo} hoặc email ${ADMIN_CONTACT.email}.`,
    contact: ADMIN_CONTACT,
  };
}
