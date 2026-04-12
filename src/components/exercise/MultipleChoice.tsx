"use client";

import { useState, useEffect } from "react";
import { GeneratedExercise } from "@/types/exercise";
import { motion } from "framer-motion";

interface MultipleChoiceProps {
  exercise: GeneratedExercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

export default function MultipleChoice({
  exercise,
  onSubmit,
  disabled,
}: MultipleChoiceProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSelected(null);
    setShowHint(false);
  }, [exercise]);

  function handleSelect(choice: string) {
    if (disabled) return;
    setSelected(choice);
    onSubmit(choice);
  }

  const colors = [
    "bg-blue-50 border-blue-300 hover:bg-blue-100",
    "bg-green-50 border-green-300 hover:bg-green-100",
    "bg-orange-50 border-orange-300 hover:bg-orange-100",
    "bg-purple-50 border-purple-300 hover:bg-purple-100",
  ];

  return (
    <div className="flex flex-col items-center gap-6">
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

      <div className="grid grid-cols-2 gap-3 w-full max-w-md">
        {exercise.choices?.map((choice, i) => (
          <motion.button
            key={`${exercise.question}-${i}`}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(choice)}
            disabled={disabled}
            className={`p-4 text-xl font-bold rounded-2xl border-2 transition-colors touch-target
              ${
                selected === choice
                  ? "bg-primary-500 border-primary-500 text-white"
                  : colors[i]
              }
              ${disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {choice}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
