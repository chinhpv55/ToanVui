"use client";

import { useRef, useState } from "react";
import { useStudentStore } from "@/stores/studentStore";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import StarCounter from "@/components/ui/StarCounter";
import StreakBadge from "@/components/ui/StreakBadge";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { GenderType, SeriesType } from "@/types/database";

// ─── Emoji avatar options ────────────────────────────────────────────────────
const AVATARS = [
  { id: "cat",     emoji: "🐱", name: "Mèo" },
  { id: "dog",     emoji: "🐶", name: "Chó" },
  { id: "bear",    emoji: "🐻", name: "Gấu" },
  { id: "rabbit",  emoji: "🐰", name: "Thỏ" },
  { id: "panda",   emoji: "🐼", name: "Gấu trúc" },
  { id: "fox",     emoji: "🦊", name: "Cáo" },
  { id: "lion",    emoji: "🦁", name: "Sư tử" },
  { id: "unicorn", emoji: "🦄", name: "Kỳ lân" },
  { id: "owl",     emoji: "🦉", name: "Cú mèo" },
  { id: "penguin", emoji: "🐧", name: "Chim cánh cụt" },
  { id: "dino",    emoji: "🦕", name: "Khủng long" },
  { id: "dragon",  emoji: "🐲", name: "Rồng" },
];

const GENDER_OPTIONS: { value: GenderType; label: string; icon: string }[] = [
  { value: "male",   label: "Nam",   icon: "👦" },
  { value: "female", label: "Nữ",    icon: "👧" },
  { value: "other",  label: "Khác",  icon: "🧒" },
];

const SERIES_OPTIONS: { value: SeriesType; label: string }[] = [
  { value: "canh_dieu", label: "Cánh Diều" },
  { value: "kntt",      label: "Kết nối tri thức" },
];

const GRADES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// ─── Avatar display helper ───────────────────────────────────────────────────
function AvatarDisplay({
  avatarUrl,
  avatarId,
  size = 96,
}: {
  avatarUrl: string | null;
  avatarId: string;
  size?: number;
}) {
  const emoji = AVATARS.find((a) => a.id === avatarId)?.emoji || "👤";
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt="Ảnh đại diện"
        width={size}
        height={size}
        className="rounded-full object-cover border-4 border-white shadow-md"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <div
      className="rounded-full bg-primary-100 border-4 border-white shadow-md flex items-center justify-center"
      style={{ width: size, height: size, fontSize: size * 0.5 }}
    >
      {emoji}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { student, setStudent } = useStudentStore();
  const supabase = createClient();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Edit form state
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saveMsg, setSaveMsg] = useState<"" | "ok" | "err">("");

  // Avatar picker tab
  const [avatarTab, setAvatarTab] = useState<"emoji" | "photo">("emoji");

  // Form fields (initialised from store)
  const [name, setName] = useState(student?.name || "");
  const [username, setUsername] = useState(student?.username || "");
  const [gender, setGender] = useState<GenderType | "">(student?.gender || "");
  const [school, setSchool] = useState(student?.school || "");
  const [avatarId, setAvatarId] = useState(student?.avatar_id || "cat");
  const [avatarUrl, setAvatarUrl] = useState(student?.avatar_url || "");
  const [grade, setGrade] = useState<number>(student?.grade || 3);
  const [series, setSeries] = useState<SeriesType>(student?.series || "canh_dieu");

  // Open edit mode — snapshot current values
  function openEdit() {
    setName(student?.name || "");
    setUsername(student?.username || "");
    setGender(student?.gender || "");
    setSchool(student?.school || "");
    setAvatarId(student?.avatar_id || "cat");
    setAvatarUrl(student?.avatar_url || "");
    setGrade(student?.grade || 3);
    setSeries(student?.series || "canh_dieu");
    setSaveMsg("");
    setEditing(true);
  }

  // Upload real photo to Supabase Storage
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !student) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${student.id}/avatar.${ext}`;
      const { error } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      // Bust cache with timestamp
      setAvatarUrl(`${data.publicUrl}?t=${Date.now()}`);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  // Save all changes
  async function handleSave() {
    if (!student) return;
    setSaving(true);
    setSaveMsg("");
    const updates = {
      name: name.trim() || student.name,
      username: username.trim() || null,
      gender: gender || null,
      school: school.trim() || null,
      avatar_id: avatarId,
      avatar_url: avatarUrl || null,
      grade,
      series,
    };
    const { error } = await supabase
      .from("students")
      .update(updates)
      .eq("id", student.id);
    setSaving(false);
    if (error) {
      setSaveMsg("err");
    } else {
      setStudent({ ...student, ...updates });
      setSaveMsg("ok");
      setTimeout(() => {
        setSaveMsg("");
        setEditing(false);
      }, 900);
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const displayAvatarUrl = editing ? avatarUrl : (student?.avatar_url || "");

  return (
    <div className="px-4 py-6 pb-28">
      {/* ── Profile header ──────────────────────────────────── */}
      <div className="text-center mb-6">
        <div className="relative inline-block mb-3">
          <AvatarDisplay
            avatarUrl={displayAvatarUrl}
            avatarId={student?.avatar_id || "cat"}
            size={96}
          />
          {!editing && (
            <button
              onClick={openEdit}
              className="absolute -bottom-1 -right-1 w-8 h-8 bg-primary-500 rounded-full border-2 border-white flex items-center justify-center text-white text-sm shadow"
            >
              ✏️
            </button>
          )}
        </div>

        <h1 className="text-2xl font-extrabold text-gray-800">
          {student?.name || "Bé"}
        </h1>
        {student?.username && (
          <p className="text-sm text-gray-400 font-medium">@{student.username}</p>
        )}
        {student?.school && (
          <p className="text-sm text-gray-500 mt-0.5">🏫 {student.school}</p>
        )}
        <p className="text-gray-400 text-sm">
          Lớp {student?.grade || 3}
          {student?.series && (
            <> · {SERIES_OPTIONS.find((s) => s.value === student.series)?.label || student.series}</>
          )}
        </p>

        <div className="flex justify-center gap-4 mt-4">
          <StarCounter count={student?.total_stars || 0} size="lg" />
          <StreakBadge days={student?.streak_days || 0} />
        </div>
      </div>

      {/* ── Edit form ────────────────────────────────────────── */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 mb-5 space-y-5"
          >
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-extrabold text-gray-800">✏️ Sửa hồ sơ</h2>
              <button
                onClick={() => setEditing(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Hủy
              </button>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Tên bé
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={50}
                placeholder="Nhập tên bé..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-primary-400 focus:bg-white transition"
              />
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Biệt danh <span className="text-gray-300 font-normal">(tùy chọn)</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</span>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/\s/g, ""))}
                  maxLength={30}
                  placeholder="ten_be"
                  className="w-full pl-8 pr-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-primary-400 focus:bg-white transition"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Giới tính
              </label>
              <div className="flex gap-2">
                {GENDER_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setGender(opt.value)}
                    className={`flex-1 py-2.5 rounded-2xl border-2 text-sm font-bold transition-all ${
                      gender === opt.value
                        ? "border-primary-500 bg-primary-50 text-primary-700"
                        : "border-gray-200 bg-white text-gray-500 hover:border-primary-300"
                    }`}
                  >
                    {opt.icon} {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* School */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Trường học <span className="text-gray-300 font-normal">(tùy chọn)</span>
              </label>
              <input
                value={school}
                onChange={(e) => setSchool(e.target.value)}
                maxLength={100}
                placeholder="Tên trường của bé..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-primary-400 focus:bg-white transition"
              />
            </div>

            {/* Grade */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Lớp đang học
              </label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-primary-400 focus:bg-white transition"
              >
                {GRADES.map((g) => (
                  <option key={g} value={g}>Lớp {g}</option>
                ))}
              </select>
            </div>

            {/* Series (book set) */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5">
                Bộ sách
              </label>
              <select
                value={series}
                onChange={(e) => setSeries(e.target.value as SeriesType)}
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray-800 font-semibold focus:outline-none focus:border-primary-400 focus:bg-white transition"
              >
                {SERIES_OPTIONS.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Hiện hỗ trợ: Cánh Diều, Kết nối tri thức.
              </p>
            </div>

            {/* Avatar picker */}
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Ảnh đại diện
              </label>

              {/* Tab switcher */}
              <div className="flex gap-1 bg-gray-100 p-1 rounded-xl mb-3">
                <button
                  type="button"
                  onClick={() => setAvatarTab("emoji")}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    avatarTab === "emoji" ? "bg-white shadow text-primary-600" : "text-gray-500"
                  }`}
                >
                  🎭 Nhân vật
                </button>
                <button
                  type="button"
                  onClick={() => setAvatarTab("photo")}
                  className={`flex-1 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    avatarTab === "photo" ? "bg-white shadow text-primary-600" : "text-gray-500"
                  }`}
                >
                  📷 Ảnh thật
                </button>
              </div>

              {avatarTab === "emoji" && (
                <div className="grid grid-cols-4 gap-2">
                  {AVATARS.map((av) => (
                    <button
                      key={av.id}
                      type="button"
                      onClick={() => { setAvatarId(av.id); setAvatarUrl(""); }}
                      className={`flex flex-col items-center p-2.5 rounded-2xl border-2 transition-all touch-target ${
                        avatarId === av.id && !avatarUrl
                          ? "border-primary-500 bg-primary-50 scale-105"
                          : "border-gray-200 bg-white hover:border-primary-300"
                      }`}
                    >
                      <span className="text-2xl">{av.emoji}</span>
                      <span className="text-xs mt-0.5 text-gray-600">{av.name}</span>
                    </button>
                  ))}
                </div>
              )}

              {avatarTab === "photo" && (
                <div className="flex flex-col items-center gap-3">
                  {/* Preview */}
                  <div className="relative">
                    <AvatarDisplay avatarUrl={avatarUrl} avatarId={avatarId} size={80} />
                    {uploading && (
                      <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="px-5 py-2.5 bg-primary-50 border border-primary-200 rounded-2xl text-primary-700 font-bold text-sm touch-target disabled:opacity-50"
                  >
                    {uploading ? "Đang tải lên..." : "📷 Chọn ảnh từ máy"}
                  </button>
                  <p className="text-xs text-gray-400 text-center">
                    Ảnh JPG, PNG tối đa 2MB
                  </p>
                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={() => setAvatarUrl("")}
                      className="text-xs text-red-400 underline"
                    >
                      Xoá ảnh, dùng nhân vật
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Save button */}
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving || uploading}
              className={`w-full py-4 rounded-2xl font-extrabold text-base transition-all touch-target ${
                saveMsg === "ok"
                  ? "bg-green-500 text-white"
                  : saveMsg === "err"
                  ? "bg-red-500 text-white"
                  : "bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg shadow-primary-200"
              } disabled:opacity-60`}
            >
              {saving ? "Đang lưu..." :
               saveMsg === "ok" ? "✅ Đã lưu!" :
               saveMsg === "err" ? "❌ Lỗi, thử lại" :
               "💾 Lưu hồ sơ"}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Edit profile button (when not editing) ─────────── */}
      {!editing && (
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={openEdit}
          className="w-full py-3.5 mb-4 bg-white border-2 border-primary-200 text-primary-600 font-extrabold rounded-2xl touch-target flex items-center justify-center gap-2 shadow-sm"
        >
          ✏️ Sửa hồ sơ
        </motion.button>
      )}

      {/* ── Stats card ──────────────────────────────────────── */}
      {!editing && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-4 mb-5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Thành tích</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-yellow-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-extrabold text-yellow-600">{student?.total_stars || 0}</div>
              <div className="text-xs text-gray-500">⭐ Tổng sao</div>
            </div>
            <div className="bg-orange-50 rounded-2xl p-3 text-center">
              <div className="text-2xl font-extrabold text-orange-500">{student?.streak_days || 0}</div>
              <div className="text-xs text-gray-500">🔥 Ngày liên tiếp</div>
            </div>
          </div>
        </div>
      )}

      {/* ── Logout ──────────────────────────────────────────── */}
      {!editing && (
        <button
          onClick={handleLogout}
          className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-500 font-bold rounded-2xl transition-colors touch-target"
        >
          Đăng xuất
        </button>
      )}
    </div>
  );
}
