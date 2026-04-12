"use client";

import { useState, useEffect } from "react";
import { GeneratedExercise } from "@/types/exercise";
import { motion } from "framer-motion";

interface DragDropProps {
  exercise: GeneratedExercise;
  onSubmit: (answer: string) => void;
  disabled?: boolean;
}

// Simplified drag-drop: tap to select, tap to place
export default function DragDrop({
  exercise,
  onSubmit,
  disabled,
}: DragDropProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const [placed, setPlaced] = useState<string | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setSelected(null);
    setPlaced(null);
    setShowHint(false);
  }, [exercise]);

  const choices = exercise.choices || [];

  function handleSelect(choice: string) {
    if (disabled) return;
    setSelected(choice);
  }

  function handlePlace() {
    if (disabled || !selected) return;
    setPlaced(selected);
    onSubmit(selected);
  }

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

      {/* Drop zone */}
      <motion.button
        onClick={handlePlace}
        className={`w-32 h-16 rounded-2xl border-3 border-dashed flex items-center justify-center text-2xl font-bold transition-colors
          ${
            placed
              ? "border-primary-500 bg-primary-50 text-primary-700"
              : selected
              ? "border-accent-400 bg-accent-50 text-accent-600 cursor-pointer"
              : "border-gray-300 bg-gray-50 text-gray-400"
          }
        `}
        disabled={disabled || !selected}
      >
        {placed || (selected ? "Đặt vào đây" : "?")}
      </motion.button>

      {/* Choice items */}
      <div className="flex flex-wrap gap-3 justify-center">
        {choices.map((choice, i) => (
          <motion.button
            key={`${exercise.question}-${i}`}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(choice)}
            disabled={disabled || placed !== null}
            className={`px-5 py-3 text-xl font-bold rounded-xl border-2 transition-all touch-target
              ${
                selected === choice && !placed
                  ? "bg-accent-400 border-accent-500 text-white scale-105"
                  : placed === choice
                  ? "opacity-30"
                  : "bg-white border-gray-200 hover:border-primary-300"
              }
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
            `}
          >
            {choice}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
