export function calculateStars(
  isCorrect: boolean,
  consecutiveCorrect: number
): { stars: number; newConsecutive: number; bonusStars: number } {
  if (!isCorrect) {
    return { stars: 0, newConsecutive: 0, bonusStars: 0 };
  }

  const newConsecutive = consecutiveCorrect + 1;
  const stars = 1;
  let bonusStars = 0;

  // Bonus: 5 consecutive correct = +3 bonus stars
  if (newConsecutive % 5 === 0) {
    bonusStars = 3;
  }

  return { stars, newConsecutive, bonusStars };
}

export function shouldUpdateStreak(lastPracticeDate: string | null): {
  streakContinues: boolean;
  streakResets: boolean;
} {
  if (!lastPracticeDate) {
    return { streakContinues: true, streakResets: false };
  }

  const last = new Date(lastPracticeDate);
  const today = new Date();

  // Reset time to start of day
  last.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);

  const diffDays = Math.floor(
    (today.getTime() - last.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (diffDays === 0) {
    // Same day — streak already counted
    return { streakContinues: false, streakResets: false };
  } else if (diffDays === 1) {
    // Consecutive day
    return { streakContinues: true, streakResets: false };
  } else {
    // Missed a day
    return { streakContinues: true, streakResets: true };
  }
}
