"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStudentStore } from "@/stores/studentStore";
import StarCounter from "@/components/ui/StarCounter";
import StreakBadge from "@/components/ui/StreakBadge";
import VersionFooter from "@/components/ui/VersionFooter";
import Link from "next/link";
import { preloadSounds, setMuted } from "@/lib/sound";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { student, setStudent, isParentMode, toggleParentMode } =
    useStudentStore();
  const supabase = createClient();
  const [soundOff, setSoundOff] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  function handleToggleSound() {
    const newMuted = !soundOff;
    setSoundOff(newMuted);
    setMuted(newMuted);
  }

  useEffect(() => {
    async function loadStudent() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: studentRow }, { data: account }] = await Promise.all([
        supabase.from("students").select("*").eq("parent_id", user.id).single(),
        supabase
          .from("user_accounts")
          .select("is_admin")
          .eq("user_id", user.id)
          .maybeSingle(),
      ]);

      if (studentRow) setStudent(studentRow);
      if (account?.is_admin) setIsAdmin(true);
    }
    loadStudent();
  }, [supabase, setStudent]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-50 to-white">
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-primary-100">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/home" className="flex items-center gap-2">
            <span className="text-2xl">📐</span>
            <span className="font-extrabold text-primary-600 text-lg">
              Toán Vui
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {student && (
              <>
                <StreakBadge days={student.streak_days} />
                <StarCounter count={student.total_stars} />
              </>
            )}
            <button
              onClick={handleToggleSound}
              className="text-lg px-1 py-1 hover:scale-110 transition-transform"
              title={soundOff ? "Bật âm thanh" : "Tắt âm thanh"}
            >
              {soundOff ? "🔇" : "🔊"}
            </button>
            <button
              onClick={toggleParentMode}
              className="text-xs text-gray-400 hover:text-gray-600 px-2 py-1"
            >
              {isParentMode ? "Bé" : "Ba/Mẹ"}
            </button>
            {isAdmin && (
              <Link
                href="/admin"
                className="text-xs text-primary-600 hover:text-primary-800 px-2 py-1 font-semibold"
                title="Trang quản trị"
              >
                🛠️
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-lg mx-auto">
        {children}
        <VersionFooter />
      </main>

      {/* Bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
        <div className="max-w-lg mx-auto flex justify-around py-2">
          <Link
            href="/home"
            className="flex flex-col items-center py-1 px-3 text-primary-600 touch-target"
          >
            <span className="text-xl">🏠</span>
            <span className="text-xs font-semibold">Trang chủ</span>
          </Link>
          <Link
            href="/topics"
            className="flex flex-col items-center py-1 px-3 text-gray-500 hover:text-primary-600 touch-target"
          >
            <span className="text-xl">📚</span>
            <span className="text-xs font-semibold">Bài học</span>
          </Link>
          <Link
            href="/leaderboard"
            className="flex flex-col items-center py-1 px-3 text-gray-500 hover:text-primary-600 touch-target"
          >
            <span className="text-xl">🌌</span>
            <span className="text-xs font-semibold">Xếp hạng</span>
          </Link>
          <Link
            href="/profile"
            className="flex flex-col items-center py-1 px-3 text-gray-500 hover:text-primary-600 touch-target"
          >
            <span className="text-xl">👤</span>
            <span className="text-xs font-semibold">Cá nhân</span>
          </Link>
          {isParentMode && (
            <Link
              href="/dashboard"
              className="flex flex-col items-center py-1 px-3 text-gray-500 hover:text-primary-600 touch-target"
            >
              <span className="text-xl">📊</span>
              <span className="text-xs font-semibold">Báo cáo</span>
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
