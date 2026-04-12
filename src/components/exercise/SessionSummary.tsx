"use client";

import { useEffect } from "react";
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

  // Play completion sound
  useEffect(() => {
    playComplete();
    // Play star sound after a short delay for effect
    if (starsEarned > 0) {
      const timer = setTimeout(() => playStar(), 600);
      return () => clearTimeout(timer);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-md mx-auto bg-white rounded-3xl shadow-lg p-8 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.2 }}
        className="text-6xl mb-4"
      >
        {accuracy >= 80 ? "🏆" : accuracy >= 50 ? "👍" : "💪"}
      </motion.div>

      <h2 className="text-2xl font-extrabold text-gray-800 mb-1">
        Hoàn thành!
      </h2>
      <p className="text-gray-500 mb-6">{topicName}</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-primary-50 rounded-2xl p-3">
          <div className="text-2xl font-extrabold text-primary-600">
            {correctCount}/{totalQuestions}
          </div>
          <div className="text-xs text-gray-500">Đúng</div>
        </div>

        <div className="bg-accent-50 rounded-2xl p-3">
          <div className="text-2xl font-extrabold text-accent-600">
            {accuracy}%
          </div>
          <div className="text-xs text-gray-500">Chính xác</div>
        </div>

        <div className="bg-yellow-50 rounded-2xl p-3">
          <StarCounter count={starsEarned} size="lg" />
          <div className="text-xs text-gray-500">Sao</div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onGoHome}
          className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors touch-target"
        >
          Về trang chủ
        </button>
        <button
          onClick={onContinue}
          className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors touch-target"
        >
          Luyện tiếp
        </button>
      </div>
    </motion.div>
  );
}
