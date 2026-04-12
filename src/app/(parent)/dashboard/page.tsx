"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Student, StudentTopicProgress, CurriculumTopic } from "@/types/database";

export default function DashboardPage() {
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [progress, setProgress] = useState<(StudentTopicProgress & { topic?: CurriculumTopic })[]>([]);
  const [weekStats, setWeekStats] = useState({
    totalQuestions: 0,
    correctRate: 0,
    daysActive: 0,
  });

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load student
      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .single();

      if (studentData) setStudent(studentData);
      if (!studentData) return;

      // Load progress with topic names
      const { data: progressData } = await supabase
        .from("student_topic_progress")
        .select("*, curriculum_topics(*)")
        .eq("student_id", studentData.id)
        .order("accuracy_rate", { ascending: true });

      if (progressData) {
        const mapped = progressData.map((p: Record<string, unknown>) => ({
          ...p,
          topic: p.curriculum_topics as CurriculumTopic | undefined,
        })) as (StudentTopicProgress & { topic?: CurriculumTopic })[];
        setProgress(mapped);
      }

      // Week stats from exercise_sessions
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);

      const { data: sessions } = await supabase
        .from("exercise_sessions")
        .select("is_correct, created_at")
        .eq("student_id", studentData.id)
        .gte("created_at", weekAgo.toISOString());

      if (sessions) {
        const correct = sessions.filter((s) => s.is_correct).length;
        const uniqueDays = new Set(
          sessions.map((s) => s.created_at.split("T")[0])
        ).size;

        setWeekStats({
          totalQuestions: sessions.length,
          correctRate: sessions.length > 0 ? Math.round((correct / sessions.length) * 100) : 0,
          daysActive: uniqueDays,
        });
      }
    }
    load();
  }, [supabase]);

  const weakTopics = progress.filter((p) => p.weak_flag);

  async function assignTopic(topicId: string) {
    if (!student) return;
    await supabase
      .from("students")
      .update({ assigned_topic_id: topicId })
      .eq("id", student.id);
    alert("Đã giao bài cho bé!");
  }

  return (
    <div className="space-y-6">
      {/* Student info */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-extrabold text-gray-800 mb-1">
          {student?.name || "Bé"}
        </h2>
        <p className="text-gray-500">
          Lớp {student?.grade} · Tuần {student?.current_week} · Streak:{" "}
          {student?.streak_days} ngày
        </p>
      </div>

      {/* Weekly summary */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">Tuần này</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-extrabold text-primary-600">
              {weekStats.totalQuestions}
            </div>
            <div className="text-xs text-gray-500">Câu hỏi</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-success-600">
              {weekStats.correctRate}%
            </div>
            <div className="text-xs text-gray-500">Chính xác</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-extrabold text-accent-600">
              {weekStats.daysActive}
            </div>
            <div className="text-xs text-gray-500">Ngày học</div>
          </div>
        </div>
      </div>

      {/* Topic accuracy */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-4">Tiến độ theo chủ đề</h3>
        <div className="space-y-3">
          {progress
            .filter((p) => p.attempts > 0)
            .map((p) => (
              <div key={p.topic_id}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-semibold text-gray-700 truncate mr-2">
                    {p.topic?.topic_name || p.topic_id}
                  </span>
                  <span className="text-gray-400">
                    {Math.round(p.accuracy_rate * 100)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full">
                  <div
                    className={`h-full rounded-full ${
                      p.accuracy_rate >= 0.8
                        ? "bg-success-500"
                        : p.accuracy_rate >= 0.6
                        ? "bg-accent-400"
                        : "bg-error-400"
                    }`}
                    style={{
                      width: `${Math.round(p.accuracy_rate * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          {progress.filter((p) => p.attempts > 0).length === 0 && (
            <p className="text-gray-400 text-center py-4">
              Bé chưa làm bài nào.
            </p>
          )}
        </div>
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="font-bold text-error-600 mb-4">
            Cần ôn thêm ({weakTopics.length})
          </h3>
          <div className="space-y-2">
            {weakTopics.map((p) => (
              <div
                key={p.topic_id}
                className="flex items-center justify-between p-3 bg-error-50 rounded-xl"
              >
                <div>
                  <div className="font-semibold text-gray-800">
                    {p.topic?.topic_name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {Math.round(p.accuracy_rate * 100)}% đúng · {p.attempts}{" "}
                    lần làm
                  </div>
                </div>
                <button
                  onClick={() => assignTopic(p.topic_id)}
                  className="px-3 py-1.5 bg-primary-500 text-white text-sm font-bold rounded-lg hover:bg-primary-600 transition-colors"
                >
                  Giao bài
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
