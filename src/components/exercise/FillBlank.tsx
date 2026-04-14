"use client";

import { useState, useRef, useEffect } from "react";
import { GeneratedExercise } from "@/types/exercise";

// Returns true if the expected answer is purely numeric (digits, spaces, commas, dots, +/-).
// Text answers like "hình vuông", "chữ nhật" will return false → show full keyboard.
function isNumericAnswer(answer: string): boolean {
  return /^[\d\s.,+\-×÷=]+$/.test(answer.trim());
}

interface FillBlankProps {
  exercise: GeneratedExercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function FillBlank({
  exercise,
  onSubmit,
  disabled,
}: FillBlankProps) {
  const [answer, setAnswer] = useState("");
  const [showHint, setShowHint] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAnswer("");
    setShowHint(false);
    inputRef.current?.focus();
  }, [exercise]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (answer.trim()) {
      onSubmit(answer.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col items-center gap-6">
      <div className="text-question-lg font-bold text-center text-gray-800 leading-relaxed px-4">
        {exercise.question}
      </div>

      {exercise.hint && !showHint && (
        <button
          type="button"
          onClick={() => setShowHint(true)}
          className="text-sm text-primary-400 hover:text-primary-600 font-medium transition-colors"
        >
          💡 Xem gợi ý
        </button>
      )}
      {exercise.hint && showHint && (
        <p className="text-sm text-primary-500 italic bg-primary-50 px-4 py-2 rounded-xl">
          💡 {exercise.hint}
        </p>
      )}

      <input
        ref={inputRef}
        type="text"
        inputMode={isNumericAnswer(exercise.answer) ? "numeric" : "text"}
        value={answer}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={disabled}
        className="w-48 h-16 text-2xl font-bold text-center border-3 border-primary-300 rounded-2xl focus:border-primary-500 focus:ring-4 focus:ring-primary-200 outline-none bg-white disabled:bg-gray-100"
        placeholder="?"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />

      <button
        type="submit"
        disabled={disabled || !answer.trim()}
        className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold text-lg rounded-xl transition-colors touch-target disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Trả lời
      </button>
    </form>
  );
}
