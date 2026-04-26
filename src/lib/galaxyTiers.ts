// Bảng xếp hạng — đặt tên theo các hành tinh trong Hệ Mặt Trời.
// Tier xác định bằng tổng sao đời (lifetime_stars) — càng nhiều sao càng "xa".

export interface GalaxyTier {
  name: string;
  emoji: string;
  minStars: number;
  color: string; // tailwind background class
  textColor: string;
}

// Sắp xếp theo khoảng cách từ Mặt Trời (gần → xa) tương ứng cấp dễ → khó.
export const GALAXY_TIERS: GalaxyTier[] = [
  { name: "Sao Thủy",         emoji: "🌑", minStars: 0,    color: "bg-gray-200",   textColor: "text-gray-700" },
  { name: "Sao Kim",          emoji: "🌟", minStars: 50,   color: "bg-yellow-200", textColor: "text-yellow-800" },
  { name: "Trái Đất",         emoji: "🌍", minStars: 150,  color: "bg-blue-200",   textColor: "text-blue-800" },
  { name: "Sao Hỏa",          emoji: "🔴", minStars: 350,  color: "bg-red-200",    textColor: "text-red-800" },
  { name: "Sao Mộc",          emoji: "🟠", minStars: 700,  color: "bg-orange-200", textColor: "text-orange-800" },
  { name: "Sao Thổ",          emoji: "🪐", minStars: 1200, color: "bg-amber-200",  textColor: "text-amber-800" },
  { name: "Sao Thiên Vương",  emoji: "🌀", minStars: 2000, color: "bg-indigo-200", textColor: "text-indigo-800" },
  { name: "Sao Hải Vương",    emoji: "💎", minStars: 3500, color: "bg-purple-200", textColor: "text-purple-800" },
];

export function getTier(lifetimeStars: number): GalaxyTier {
  let tier = GALAXY_TIERS[0];
  for (const t of GALAXY_TIERS) {
    if (lifetimeStars >= t.minStars) tier = t;
  }
  return tier;
}

export function nextTier(lifetimeStars: number): GalaxyTier | null {
  for (const t of GALAXY_TIERS) {
    if (lifetimeStars < t.minStars) return t;
  }
  return null;
}
