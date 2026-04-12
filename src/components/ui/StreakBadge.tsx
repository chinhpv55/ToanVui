"use client";

interface StreakBadgeProps {
  days: number;
}

export default function StreakBadge({ days }: StreakBadgeProps) {
  if (days === 0) return null;

  return (
    <div className="flex items-center gap-1 bg-orange-100 text-orange-600 px-3 py-1 rounded-full font-bold text-sm">
      <span className="text-lg">&#128293;</span>
      <span>{days} ngày</span>
    </div>
  );
}
