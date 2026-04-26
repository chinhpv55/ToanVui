"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Profile-completion form for users who signed up via Google OAuth.
// Email/password registration collects the child's profile inline,
// but OAuth skips that step, so we collect it here on first login.
export default function CompleteProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const [childName, setChildName] = useState("");
  const [nickname, setNickname] = useState("");
  const [grade, setGrade] = useState<number>(3);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);

  // Bounce out if user already has a student row, or isn't logged in.
  useEffect(() => {
    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      const { data: existing } = await supabase
        .from("students")
        .select("id")
        .eq("parent_id", user.id)
        .maybeSingle();
      if (existing) {
        router.replace("/home");
        return;
      }
      setChecking(false);
    })();
  }, [supabase, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.replace("/login");
      return;
    }

    const { error: insertErr } = await supabase.from("students").insert({
      id: user.id,
      parent_id: user.id,
      name: childName,
      grade,
      username: nickname || null,
      series: "canh_dieu",
    });

    if (insertErr) {
      setError(insertErr.message);
      setLoading(false);
      return;
    }

    router.push("/home");
    router.refresh();
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-100 to-primary-50">
        <p className="text-gray-500">Đang kiểm tra...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary-100 to-primary-50 p-4">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-primary-600">Toán Vui</h1>
          <p className="text-gray-500 mt-2">Hoàn tất hồ sơ cho bé</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tên bé
            </label>
            <input
              type="text"
              value={childName}
              onChange={(e) => setChildName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-lg"
              placeholder="Ví dụ: Minh Anh"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Biệt danh trong bảng xếp hạng
            </label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-lg"
              placeholder="Ví dụ: Sao Bắc Cực"
              maxLength={30}
            />
            <p className="text-xs text-gray-400 mt-1">
              Tên hiển thị trên bảng xếp hạng tuần. Để bảo vệ trẻ em, không hiện
              tên thật.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Bé đang học lớp
            </label>
            <select
              value={grade}
              onChange={(e) => setGrade(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-lg bg-white"
              required
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((g) => (
                <option key={g} value={g}>
                  Lớp {g}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-error-500 text-sm text-center">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-colors touch-target disabled:opacity-50"
          >
            {loading ? "Đang lưu..." : "Bắt đầu học"}
          </button>
        </form>
      </div>
    </div>
  );
}
