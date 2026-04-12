"use client";

import { useStudentStore } from "@/stores/studentStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import StarCounter from "@/components/ui/StarCounter";
import StreakBadge from "@/components/ui/StreakBadge";

const AVATARS = [
  { id: "cat", emoji: "🐱", name: "Mèo" },
  { id: "dog", emoji: "🐶", name: "Chó" },
  { id: "bear", emoji: "🐻", name: "Gấu" },
  { id: "rabbit", emoji: "🐰", name: "Thỏ" },
  { id: "panda", emoji: "🐼", name: "Gấu trúc" },
  { id: "fox", emoji: "🦊", name: "Cáo" },
  { id: "lion", emoji: "🦁", name: "Sư tử" },
  { id: "unicorn", emoji: "🦄", name: "Kỳ lân" },
];

export default function ProfilePage() {
  const { student, setStudent } = useStudentStore();
  const supabase = createClient();
  const router = useRouter();

  async function selectAvatar(avatarId: string) {
    if (!student) return;
    await supabase
      .from("students")
      .update({ avatar_id: avatarId })
      .eq("id", student.id);
    setStudent({ ...student, avatar_id: avatarId });
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const currentAvatar = AVATARS.find((a) => a.id === student?.avatar_id);

  return (
    <div className="px-4 py-6 pb-24">
      {/* Profile header */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-3">
          {currentAvatar?.emoji || "👤"}
        </div>
        <h1 className="text-2xl font-extrabold text-gray-800">
          {student?.name || "Bé"}
        </h1>
        <p className="text-gray-500">Lớp {student?.grade || 3}</p>

        <div className="flex justify-center gap-4 mt-4">
          <StarCounter count={student?.total_stars || 0} size="lg" />
          <StreakBadge days={student?.streak_days || 0} />
        </div>
      </div>

      {/* Avatar selection */}
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-700 mb-3">
          Chọn nhân vật
        </h2>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              onClick={() => selectAvatar(avatar.id)}
              className={`flex flex-col items-center p-3 rounded-2xl border-2 transition-all touch-target ${
                student?.avatar_id === avatar.id
                  ? "border-primary-500 bg-primary-50 scale-105"
                  : "border-gray-200 bg-white hover:border-primary-300"
              }`}
            >
              <span className="text-3xl">{avatar.emoji}</span>
              <span className="text-xs mt-1 text-gray-600">{avatar.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-xl transition-colors touch-target"
      >
        Đăng xuất
      </button>
    </div>
  );
}
