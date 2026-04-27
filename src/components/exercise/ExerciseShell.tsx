"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/stores/sessionStore";
import { useStudentStore } from "@/stores/studentStore";
import { GeneratedExercise } from "@/types/exercise";
import ProgressBar from "@/components/ui/ProgressBar";
import { motion, AnimatePresence } from "framer-motion";
import FillBlank from "./FillBlank";
import MultipleChoice from "./MultipleChoice";
import DragDrop from "./DragDrop";
import ResultFeedback from "./ResultFeedback";
import SessionSummary from "./SessionSummary";
import { preloadSounds, playCorrect, playIncorrect, playStreak } from "@/lib/sound";
import { addDailyStars } from "@/lib/dailyGoal";
import { isAnswerCorrect } from "@/lib/answerCheck";
import { submitProgress } from "@/lib/progressQueue";

export default function ExerciseShell() {
  const router = useRouter();
  const {
    questions,
    currentIndex,
    results,
    isFinished,
    starsEarned,
    topicName,
    topicId,
    isLoading,
    consecutiveCorrect,
    submitAnswer,
    nextQuestion,
    resetSession,
    startSession,
    difficulty,
  } = useSessionStore();

  const { student, updateStars } = useStudentStore();
  const [showResult, setShowResult] = useState(false);
  const [lastCorrect, setLastCorrect] = useState(false);
  const [lastAnswer, setLastAnswer] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const starsSyncedRef = useRef(false);

  const currentQuestion: GeneratedExercise | undefined =
    questions[currentIndex];

  // Preload sounds on mount
  useEffect(() => {
    preloadSounds();
  }, []);

  // Sync stars to studentStore + daily goal when session finishes
  useEffect(() => {
    if (isFinished && starsEarned > 0 && !starsSyncedRef.current) {
      starsSyncedRef.current = true;
      updateStars(starsEarned);
      // Track daily goal progress
      if (student?.id) addDailyStars(student.id, starsEarned);
    }
  }, [isFinished, starsEarned, updateStars, student]);

  const handleSubmit = useCallback(
    async (answer: string) => {
      if (!currentQuestion || submitting) return;
      setSubmitting(true);
      setLastAnswer(answer);

      const isCorrect = isAnswerCorrect(answer, currentQuestion.answer);
      setLastCorrect(isCorrect);

      // Play sound feedback
      if (isCorrect) {
        const { consecutiveCorrect } = useSessionStore.getState();
        const newStreak = consecutiveCorrect + 1;
        if (newStreak > 0 && newStreak % 5 === 0) {
          // Streak bonus! Play special sound
          setTimeout(() => playStreak(), 300);
        }
        playCorrect();
      } else {
        playIncorrect();
      }

      // Submit to store
      submitAnswer({
        question: currentQuestion,
        student_answer: answer,
        correct_answer: currentQuestion.answer,
        is_correct: isCorrect,
      });

      // Persist to DB with retry + offline queue. Don't await — UI moves on
      // immediately; submitProgress handles all error/queue logic internally.
      if (student?.id && topicId) {
        submitProgress({
          student_id: student.id,
          topic_id: topicId,
          is_correct: isCorrect,
        });
      }

      setShowResult(true);
      setSubmitting(false);
    },
    [currentQuestion, submitting, submitAnswer, topicId, student]
  );

  const handleNext = useCallback(() => {
    setShowResult(false);
    nextQuestion();
  }, [nextQuestion]);

  const handleExplain = useCallback(async (): Promise<string> => {
    if (!currentQuestion) return "";
    try {
      const res = await fetch("/api/explain-error", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: currentQuestion.question,
          student_answer: lastAnswer,
          correct_answer: currentQuestion.answer,
          topic_name: topicName,
        }),
      });
      const data = await res.json();
      return data.explanation || "Không thể giải thích lúc này.";
    } catch {
      return "Không thể giải thích lúc này. Thử lại sau nhé!";
    }
  }, [currentQuestion, lastAnswer, topicName]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-gray-500 font-semibold">Đang tạo bài tập...</p>
      </div>
    );
  }

  // Session finished
  if (isFinished) {
    return (
      <SessionSummary
        results={results}
        starsEarned={starsEarned}
        topicName={topicName}
        onGoHome={() => {
          resetSession();
          router.push("/home");
        }}
        onContinue={() => {
          const tid = topicId;
          const tname = topicName;
          const diff = difficulty;
          resetSession();
          if (tid && tname) {
            startSession(tid, tname, diff);
          }
          router.push(tid ? `/home?scrollTo=${tid}` : "/home");
        }}
      />
    );
  }

  // No questions
  if (!currentQuestion) {
    return (
      <div className="text-center py-20 text-gray-500">
        Không có câu hỏi. Vui lòng thử lại.
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 py-6">
      {/* Header: Progress + Stop */}
      <div className="flex items-center gap-4 mb-8">
        <div className="flex-1">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>
        <button
          onClick={() => {
            resetSession();
            router.push("/home");
          }}
          className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 font-semibold"
        >
          Dừng
        </button>
      </div>

      {/* Combo fire counter */}
      <AnimatePresence>
        {consecutiveCorrect >= 3 && !showResult && (
          <motion.div
            key={consecutiveCorrect}
            initial={{ opacity: 0, scale: 0.6, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            className="flex items-center justify-center gap-2 mb-4"
          >
            <motion.span
              animate={{ rotate: [-8, 8, -8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              🔥
            </motion.span>
            <span className="text-lg font-extrabold text-orange-500">
              {consecutiveCorrect >= 10 ? "SIÊU SAO! " : consecutiveCorrect >= 5 ? "TUYỆT VỜI! " : ""}
              {consecutiveCorrect} đúng liên tiếp!
            </span>
            <motion.span
              animate={{ rotate: [8, -8, 8] }}
              transition={{ duration: 0.5, repeat: Infinity }}
              className="text-2xl"
            >
              🔥
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Question */}
      {!showResult && (
        <>
          {currentQuestion.question_type === "fill_blank" && (
            <FillBlank
              exercise={currentQuestion}
              onSubmit={handleSubmit}
              disabled={submitting}
            />
          )}
          {currentQuestion.question_type === "multiple_choice" && (
            <MultipleChoice
              exercise={currentQuestion}
              onSubmit={handleSubmit}
              disabled={submitting}
            />
          )}
          {currentQuestion.question_type === "drag_drop" && (
            <DragDrop
              exercise={currentQuestion}
              onSubmit={handleSubmit}
              disabled={submitting}
            />
          )}
        </>
      )}

      {/* Result */}
      {showResult && (
        <ResultFeedback
          isCorrect={lastCorrect}
          correctAnswer={currentQuestion.answer}
          onNext={handleNext}
          onExplain={!lastCorrect ? handleExplain : undefined}
        />
      )}
    </div>
  );
}
