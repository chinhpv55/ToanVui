"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { playTap } from "@/lib/sound";

interface ResultFeedbackProps {
  isCorrect: boolean;
  correctAnswer: string;
  onNext: () => void;
  onExplain?: () => Promise<string>;
}

export default function ResultFeedback({
  isCorrect,
  correctAnswer,
  onNext,
  onExplain,
}: ResultFeedbackProps) {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  async function handleExplain() {
    if (!onExplain || explanation) return;
    setLoadingExplanation(true);
    const result = await onExplain();
    setExplanation(result);
    setLoadingExplanation(false);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`w-full max-w-md mx-auto rounded-2xl p-6 text-center ${
          isCorrect
            ? "bg-success-400/10 border-2 border-success-400"
            : "bg-error-400/10 border-2 border-error-400"
        }`}
      >
        {/* Icon + message */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
          className="text-5xl mb-3"
        >
          {isCorrect ? "🌟" : "💪"}
        </motion.div>

        <h3
          className={`text-xl font-extrabold mb-2 ${
            isCorrect ? "text-success-600" : "text-error-600"
          }`}
        >
          {isCorrect ? "Tuyệt vời!" : "Chưa đúng rồi!"}
        </h3>

        {!isCorrect && (
          <p className="text-gray-600 mb-3">
            Đáp án đúng là:{" "}
            <span className="font-bold text-primary-600">{correctAnswer}</span>
          </p>
        )}

        {isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="text-accent-500 font-bold text-lg mb-3"
          >
            +1 &#9733;
          </motion.div>
        )}

        {/* Explanation section */}
        {!isCorrect && onExplain && (
          <div className="mb-4">
            {!explanation && (
              <button
                onClick={handleExplain}
                disabled={loadingExplanation}
                className="px-4 py-2 bg-primary-100 text-primary-700 rounded-xl font-semibold hover:bg-primary-200 transition-colors text-sm"
              >
                {loadingExplanation
                  ? "Đang giải thích..."
                  : "Xem giải thích"}
              </button>
            )}

            {explanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-3 p-4 bg-white rounded-xl text-left text-gray-700 text-base leading-relaxed"
              >
                {explanation}
              </motion.div>
            )}
          </div>
        )}

        {/* Next button */}
        <button
          onClick={() => {
            playTap();
            onNext();
          }}
          className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-colors touch-target"
        >
          Tiếp tục
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
