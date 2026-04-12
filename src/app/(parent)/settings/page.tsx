"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Student } from "@/types/database";

export default function SettingsPage() {
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [currentWeek, setCurrentWeek] = useState(1);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .single();

      if (data) {
        setStudent(data);
        setCurrentWeek(data.current_week);
      }
    }
    load();
  }, [supabase]);

  async function handleSave() {
    if (!student) return;
    await supabase
      .from("students")
      .update({ current_week: currentWeek, updated_at: new Date().toISOString() })
      .eq("id", student.id);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">Cài đặt</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Tuần học hiện tại (1-35)
            </label>
            <input
              type="number"
              min={1}
              max={35}
              value={currentWeek}
              onChange={(e) => setCurrentWeek(Number(e.target.value))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none text-lg"
            />
            <p className="text-xs text-gray-400 mt-1">
              App sẽ gợi ý bài tập theo tuần học này
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-600 mb-2">
              Bộ sách
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl text-gray-700 font-semibold">
              Cánh Diều
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Sẽ hỗ trợ thêm bộ sách khác trong tương lai
            </p>
          </div>

          <button
            onClick={handleSave}
            className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
          >
            {saved ? "Đã lưu!" : "Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}
