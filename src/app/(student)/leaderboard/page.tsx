"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudentStore } from "@/stores/studentStore";
import { getTier, nextTier } from "@/lib/galaxyTiers";

interface LeaderboardRow {
  student_id: string;
  display_name: string;
  avatar_url: string | null;
  avatar_id: string;
  grade: number;
  lifetime_stars: number;
  weekly_correct: number;
  rank_position: number;
}

export default function LeaderboardPage() {
  const supabase = useMemo(() => createClient(), []);
  const { student } = useStudentStore();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<"my_grade" | "all">("my_grade");

  useEffect(() => {
    async function load() {
      setLoading(true);
      const grade = scope === "my_grade" && student ? student.grade : 0;
      const { data, error } = await supabase.rpc("get_weekly_leaderboard", {
        p_grade: grade,
      });
      if (error) {
        console.error(error);
        setRows([]);
      } else {
        setRows((data as LeaderboardRow[]) || []);
      }
      setLoading(false);
    }
    load();
  }, [supabase, scope, student]);

  const myRow = rows.find((r) => student && r.student_id === student.id);

  return (
    <div className="px-4 py-6 pb-24 space-y-5">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 flex items-center gap-2">
          🌌 Bảng xếp hạng tuần
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Top 50 bé luyện toán tuần này. Reset mỗi thứ Hai.
        </p>
      </div>

      {/* Scope tabs */}
      <div className="flex gap-2">
        <ScopeButton
          active={scope === "my_grade"}
          onClick={() => setScope("my_grade")}
        >
          Cùng lớp {student?.grade ?? ""}
        </ScopeButton>
        <ScopeButton active={scope === "all"} onClick={() => setScope("all")}>
          Toàn hệ mặt trời
        </ScopeButton>
      </div>

      {/* My tier card */}
      {student && (
        <MyTierCard
          lifetimeStars={student.total_stars}
          weeklyRank={myRow?.rank_position ?? null}
          weeklyCorrect={myRow?.weekly_correct ?? 0}
        />
      )}

      {/* Leaderboard list */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        {loading && (
          <div className="px-4 py-12 text-center text-gray-400">
            Đang tải bảng xếp hạng...
          </div>
        )}
        {!loading && rows.length === 0 && (
          <div className="px-4 py-12 text-center text-gray-400">
            Chưa có ai luyện tập tuần này. Hãy là người đầu tiên! 🚀
          </div>
        )}
        {!loading &&
          rows.map((r) => (
            <LeaderboardRowCard
              key={r.student_id}
              row={r}
              isMe={student?.id === r.student_id}
            />
          ))}
      </div>
    </div>
  );
}

function ScopeButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
        active
          ? "bg-primary-600 text-white shadow"
          : "bg-white text-gray-700 hover:bg-gray-50"
      }`}
    >
      {children}
    </button>
  );
}

function MyTierCard({
  lifetimeStars,
  weeklyRank,
  weeklyCorrect,
}: {
  lifetimeStars: number;
  weeklyRank: number | null;
  weeklyCorrect: number;
}) {
  const tier = getTier(lifetimeStars);
  const next = nextTier(lifetimeStars);
  const progress = next
    ? Math.min(
        100,
        ((lifetimeStars - tier.minStars) / (next.minStars - tier.minStars)) * 100
      )
    : 100;

  return (
    <div className={`rounded-2xl p-5 shadow-sm ${tier.color}`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold opacity-70">Hạng sao của bé</div>
          <div className={`text-2xl font-extrabold ${tier.textColor} mt-1`}>
            {tier.emoji} {tier.name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-xs opacity-70">Tuần này</div>
          <div className="text-3xl font-extrabold">
            {weeklyRank ? `#${weeklyRank}` : "—"}
          </div>
          <div className="text-xs opacity-70">{weeklyCorrect} câu đúng</div>
        </div>
      </div>

      {next && (
        <div className="mt-4">
          <div className="flex justify-between text-xs font-medium opacity-70 mb-1">
            <span>{lifetimeStars} ⭐</span>
            <span>
              {next.emoji} {next.name} ({next.minStars} ⭐)
            </span>
          </div>
          <div className="h-2 bg-white/40 rounded-full overflow-hidden">
            <div
              className="h-full bg-white/80 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function LeaderboardRowCard({
  row,
  isMe,
}: {
  row: LeaderboardRow;
  isMe: boolean;
}) {
  const tier = getTier(row.lifetime_stars);
  const rankBadge =
    row.rank_position === 1
      ? "🥇"
      : row.rank_position === 2
      ? "🥈"
      : row.rank_position === 3
      ? "🥉"
      : `#${row.rank_position}`;

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 last:border-b-0 ${
        isMe ? "bg-primary-50" : ""
      }`}
    >
      <div className="w-10 text-center font-bold text-gray-700">
        {rankBadge}
      </div>
      <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-xl">
        {row.avatar_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={row.avatar_url}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          "👶"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-gray-900 truncate">
          {row.display_name}
          {isMe && (
            <span className="ml-2 text-xs text-primary-600">(bé)</span>
          )}
        </div>
        <div className={`text-xs font-medium ${tier.textColor}`}>
          {tier.emoji} {tier.name} · Lớp {row.grade}
        </div>
      </div>
      <div className="text-right">
        <div className="font-bold text-gray-900">
          {row.weekly_correct} ⭐
        </div>
        <div className="text-xs text-gray-500">tuần này</div>
      </div>
    </div>
  );
}
