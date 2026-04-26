// Bảng xếp hạng kiểu Brilliant — đặt tên theo các vì sao trong giải ngân hà.
// Tier xác định bằng tổng sao đời (lifetime_stars) — càng nhiều sao càng "lớn".

export interface GalaxyTier {
  name: string;
  emoji: string;
  minStars: number;
  color: string; // tailwind background class
  textColor: string;
}

// Sắp xếp từ thấp lên cao; lookup sẽ chọn tier có minStars cao nhất ≤ stars
export const GALAXY_TIERS: GalaxyTier[] = [
  { name: "Procyon",     emoji: "✨", minStars: 0,    color: "bg-gray-200",      textColor: "text-gray-700" },
  { name: "Aldebaran",   emoji: "🌟", minStars: 50,   color: "bg-orange-200",    textColor: "text-orange-800" },
  { name: "Capella",     emoji: "💫", minStars: 150,  color: "bg-yellow-200",    textColor: "text-yellow-800" },
  { name: "Betelgeuse",  emoji: "🔆", minStars: 350,  color: "bg-red-200",       textColor: "text-red-800" },
  { name: "Rigel",       emoji: "⭐", minStars: 700,  color: "bg-blue-200",      textColor: "text-blue-800" },
  { name: "Polaris",     emoji: "🌠", minStars: 1200, color: "bg-indigo-200",    textColor: "text-indigo-800" },
  { name: "Vega",        emoji: "🌌", minStars: 2000, color: "bg-purple-200",    textColor: "text-purple-800" },
  { name: "Sirius",      emoji: "🪐", minStars: 3500, color: "bg-pink-200",      textColor: "text-pink-800" },
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
