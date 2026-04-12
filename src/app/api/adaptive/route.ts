import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { calculateAdaptive } from "@/lib/adaptive";
import { calculateStars, shouldUpdateStreak } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const { student_id, topic_id, is_correct } = await request.json();

    const supabase = createServerSupabaseClient();

    // Get current progress
    const { data: progress } = await supabase
      .from("student_topic_progress")
      .select("*")
      .eq("student_id", student_id)
      .eq("topic_id", topic_id)
      .single();

    // Upsert progress
    const currentAttempts = progress?.attempts || 0;
    const currentCorrect = progress?.correct || 0;
    const currentConsecutiveCorrect = progress?.consecutive_correct || 0;
    const currentConsecutiveWrong = progress?.consecutive_wrong || 0;

    const newAttempts = currentAttempts + 1;
    const newCorrect = currentCorrect + (is_correct ? 1 : 0);
    const newConsecutiveCorrect = is_correct ? currentConsecutiveCorrect + 1 : 0;
    const newConsecutiveWrong = is_correct ? 0 : currentConsecutiveWrong + 1;

    const adaptive = calculateAdaptive({
      attempts: newAttempts,
      correct: newCorrect,
      consecutive_correct: newConsecutiveCorrect,
      consecutive_wrong: newConsecutiveWrong,
      current_difficulty: progress?.current_difficulty || "easy",
      mastery_level: progress?.mastery_level || "not_started",
    });

    await supabase.from("student_topic_progress").upsert({
      student_id,
      topic_id,
      attempts: newAttempts,
      correct: newCorrect,
      accuracy_rate: newAttempts > 0 ? newCorrect / newAttempts : 0,
      mastery_level: adaptive.new_mastery,
      current_difficulty: adaptive.new_difficulty,
      consecutive_correct: newConsecutiveCorrect,
      consecutive_wrong: newConsecutiveWrong,
      weak_flag: adaptive.weak_flag,
      last_practiced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Calculate stars
    const starsResult = calculateStars(is_correct, currentConsecutiveCorrect);

    // Update student stars + streak
    const { data: student } = await supabase
      .from("students")
      .select("total_stars, streak_days, last_practice_date")
      .eq("id", student_id)
      .single();

    if (student) {
      const totalNewStars = starsResult.stars + starsResult.bonusStars;
      const streak = shouldUpdateStreak(student.last_practice_date);

      let newStreak = student.streak_days;
      if (streak.streakResets) newStreak = 1;
      else if (streak.streakContinues) newStreak = student.streak_days + 1;

      await supabase
        .from("students")
        .update({
          total_stars: student.total_stars + totalNewStars,
          streak_days: newStreak,
          last_practice_date: new Date().toISOString().split("T")[0],
          updated_at: new Date().toISOString(),
        })
        .eq("id", student_id);
    }

    return NextResponse.json({
      new_difficulty: adaptive.new_difficulty,
      mastery_level: adaptive.new_mastery,
      stars_earned: starsResult.stars + starsResult.bonusStars,
      streak_updated: true,
    });
  } catch (err) {
    console.error("Adaptive error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
