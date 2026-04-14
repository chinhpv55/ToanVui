"use client";

import { useEffect, useRef } from "react";
import { useSessionStore } from "@/stores/sessionStore";
import ExerciseShell from "@/components/exercise/ExerciseShell";

export default function PracticeSessionPage() {
  const { topicId, isLoading, questions, setQuestions, setLoading } =
    useSessionStore();
  const fetchedRef = useRef(false);

  useEffect(() => {
    if (!topicId || fetchedRef.current || questions.length > 0) return;
    fetchedRef.current = true;

    async function fetchQuestions() {
      setLoading(true);
      const questionTypes = ["fill_blank", "multiple_choice"] as const;

      // Fetch first 5 questions to show immediately
      try {
        const res = await fetch("/api/generate-exercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic_id: topicId,
            difficulty: useSessionStore.getState().difficulty,
            question_type:
              questionTypes[Math.floor(Math.random() * questionTypes.length)],
            count: 5,
          }),
        });

        if (!res.ok) throw new Error("API error");

        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions);
        } else {
          setLoading(false);
        }
      } catch {
        setLoading(false);
      }

      // Prefetch 5 more in background → 10 total
      try {
        const res2 = await fetch("/api/generate-exercise", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            topic_id: topicId,
            difficulty: useSessionStore.getState().difficulty,
            question_type:
              questionTypes[Math.floor(Math.random() * questionTypes.length)],
            count: 5,
          }),
        });
        const data2 = await res2.json();
        if (data2.questions) {
          const store = useSessionStore.getState();
          data2.questions.forEach((q: Parameters<typeof store.addQuestion>[0]) =>
            store.addQuestion(q)
          );
        }
      } catch {
        // Non-critical
      }
    }

    fetchQuestions();
  }, [topicId, questions.length, setQuestions, setLoading]);

  // No session started — redirect
  if (!topicId && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="text-gray-500">Chưa chọn bài. Quay lại trang chủ.</p>
        <a href="/home" className="text-primary-600 font-bold">
          Trang chủ
        </a>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <ExerciseShell />
    </div>
  );
}
