"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ExerciseResult } from "@/types/exercise";
import StarCounter from "@/components/ui/StarCounter";
import { playComplete, playStar } from "@/lib/sound";

interface SessionSummaryProps {
  results: ExerciseResult[];
  starsEarned: number;
  topicName: string;
  onGoHome: () => void;
  onContinue: () => void;
}

// Confetti particle
function ConfettiParticle({ index }: { index: number }) {
  const colors = ["#3b82f6","#f59e0b","#22c55e","#ec4899","#a855f7","#f97316"];
  const color = colors[index % colors.length];
  const x = Math.random() * 360 - 180;
  const delay = Math.random() * 0.4;
  const size = 6 + Math.random() * 8;
  return (
    <motion.div
      className="absolute rounded-sm pointer-events-none"
      style={{ width: size, height: size, background: color, top: 0, left: "50%" }}
      initial={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
      animate={{ y: 260 + Math.random() * 100, x, opacity: 0, rotate: Math.random() * 360 }}
      transition={{ duration: 1.2 + Math.random() * 0.6, delay, ease: "easeOut" }}
    />
  );
}

// Grade-based config
function getGrade(accuracy: number, isPerfect: boolean): {
  emoji: string; title: string; subtitle: string; bg: string; titleColor: string;
} {
  if (isPerfect) return {
    emoji: "🏆",
    title: "XUẤT SẮC!",
    subtitle: "Bé trả lời đúng tất cả! Tuyệt vời! 🌟",
    bg: "from-yellow-400 to-yellow-600",
    titleColor: "text-white",
  };
  if (accuracy >= 80) return {
    emoji: "🎉",
    title: "Giỏi lắm!",
    subtitle: "Bé làm rất tốt rồi! Tiếp tục nhé!",
    bg: "from-primary-400 to-primary-600",
    titleColor: "text-white",
  };
  if (accuracy >= 50) return {
    emoji: "👍",
    title: "Cố lên!",
    subtitle: "Tốt rồi! Luyện thêm một chút nữa nhé.",
    bg: "from-green-400 to-green-600",
    titleColor: "text-white",
  };
  return {
    emoji: "💪",
    title: "Không sao!",
    subtitle: "Lần sau bé sẽ làm tốt hơn. Thử lại nhé!",
    bg: "from-blue-400 to-blue-600",
    titleColor: "text-white",
  };
}

export default function SessionSummary({
  results,
  starsEarned,
  topicName,
  onGoHome,
  onContinue,
}: SessionSummaryProps) {
  const totalQuestions = results.length;
  const correctCount = results.filter((r) => r.is_correct).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const isPerfect = correctCount === totalQuestions && totalQuestions > 0;

  // Best combo in this session
  let bestCombo = 0, currentCombo = 0;
  results.forEach((r) => {
    if (r.is_correct) { currentCombo++; bestCombo = Math.max(bestCombo, currentCombo); }
    else currentCombo = 0;
  });

  const grade = getGrade(accuracy, isPerfect);

  const audioFired = useRef(false);
  useEffect(() => {
    if (audioFired.current) return;
    audioFired.current = true;
    playComplete();
    if (starsEarned > 0) setTimeout(() => playStar(), 600);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="max-w-md mx-auto px-4 py-6 text-center">
      {/* ── Big celebration header ── */}
      <div className={`relative bg-gradient-to-b ${grade.bg} rounded-3xl px-6 pt-8 pb-6 mb-4 overflow-hidden shadow-xl`}>
        {/* Confetti burst on perfect */}
        {isPerfect && Array.from({ length: 24 }).map((_, i) => (
          <ConfettiParticle key={i} index={i} />
        ))}

        {/* Emoji */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", bounce: 0.6, delay: 0.15 }}
          className="text-7xl mb-3"
        >
          {grade.emoji}
        </motion.div>

        {/* Title */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`text-3xl font-extrabold ${grade.titleColor} mb-1`}
        >
          {grade.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45 }}
          className="text-white/90 text-sm font-medium"
        >
          {grade.subtitle}
        </motion.p>

        {/* Topic name */}
        <p className="text-white/70 text-xs mt-2 font-semibold">{topicName}</p>
      </div>

      {/* ── Stats row ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-3 gap-3 mb-4"
      >
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <div className="text-2xl font-extrabold text-primary-600">{correctCount}/{totalQuestions}</div>
          <div className="text-xs text-gray-500 mt-0.5">Câu đúng</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <div className="text-2xl font-extrabold text-green-500">{accuracy}%</div>
          <div className="text-xs text-gray-500 mt-0.5">Chính xác</div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-3">
          <StarCounter count={starsEarned} size="lg" />
          <div className="text-xs text-gray-500 mt-0.5">Sao</div>
        </div>
      </motion.div>

      {/* ── Combo highlight ── */}
      {bestCombo >= 3 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-2 bg-orange-50 border border-orange-200 rounded-2xl py-3 px-4 mb-4"
        >
          <span className="text-xl">🔥</span>
          <span className="font-extrabold text-orange-600">
            Chuỗi dài nhất: <span className="text-2xl">{bestCombo}</span> câu liên tiếp!
          </span>
          <span className="text-xl">🔥</span>
        </motion.div>
      )}

      {/* ── Question review ── */}
      {results.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5"
        >
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Chi tiết bài làm</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {results.map((r, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.7 + i * 0.05, type: "spring" }}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                  r.is_correct
                    ? "bg-green-100 border-green-400 text-green-700"
                    : "bg-red-100 border-red-400 text-red-700"
                }`}
              >
                {r.is_correct ? "✓" : "✗"}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* ── Actions ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.75 }}
        className="flex gap-3"
      >
        <button
          onClick={onGoHome}
          className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-2xl transition-colors touch-target"
        >
          🏠 Trang chủ
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-bold rounded-2xl shadow-md shadow-primary-200 transition-all touch-target"
        >
          Luyện tiếp 🚀
        </button>
      </motion.div>
    </div>
  );
}
