/**
 * Daily goal tracking via localStorage.
 * Tracks stars earned today. Resets automatically each calendar day.
 */

export const DAILY_GOAL_STARS = 10; // 10 stars = daily goal met

function todayKey(studentId: string): string {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  return `daily_${studentId}_${today}`;
}

export function getDailyStars(studentId: string): number {
  if (typeof window === "undefined") return 0;
  return parseInt(localStorage.getItem(todayKey(studentId)) || "0", 10);
}

export function addDailyStars(studentId: string, stars: number): number {
  if (typeof window === "undefined") return 0;
  const current = getDailyStars(studentId);
  const next = current + stars;
  localStorage.setItem(todayKey(studentId), String(next));
  return next;
}

export function isDailyGoalMet(studentId: string): boolean {
  return getDailyStars(studentId) >= DAILY_GOAL_STARS;
}
