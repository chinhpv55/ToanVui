"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStudentStore } from "@/stores/studentStore";
import { useSessionStore } from "@/stores/sessionStore";
import { CurriculumTopic, StudentTopicProgress } from "@/types/database";

type FlowTab = "week" | "browse" | "weak" | "random";

export default function TopicsPage() {
  const router = useRouter();
  const { student } = useStudentStore();
  const { startSession } = useSessionStore();
  const [activeTab, setActiveTab] = useState<FlowTab>("week");
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [progress, setProgress] = useState<Record<string, StudentTopicProgress>>({});
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      if (!student) return;
      const { data: topicsData } = await supabase
        .from("curriculum_topics")
        .select("*")
        .eq("subject", "toan")
        .eq("grade", student.grade)
        .eq("series", student.series)
        .order("sort_order");

      if (topicsData) setTopics(topicsData);
      const { data: progressData } = await supabase
        .from("student_topic_progress")
        .select("*")
        .eq("student_id", student.id);

      if (progressData) {
        const map: Record<string, StudentTopicProgress> = {};
        progressData.forEach((p) => (map[p.topic_id] = p));
        setProgress(map);
      }
    }
    load();
  }, [supabase, student]);

  async function selectTopic(topic: CurriculumTopic) {
    const diff = progress[topic.id]?.current_difficulty || "easy";
    startSession(topic.id, topic.topic_name, diff);
    router.push(`/practice/${crypto.randomUUID()}`);
  }

  // Filter topics based on active tab
  const filteredTopics = (() => {
    switch (activeTab) {
      case "week":
        return topics.filter(
          (t) => t.week_suggestion === (student?.current_week || 1)
        );
      case "weak":
        return topics.filter((t) => progress[t.id]?.weak_flag);
      case "random":
        return [...topics].sort(() => Math.random() - 0.5).slice(0, 5);
      default:
        return topics;
    }
  })();

  const tabs: { key: FlowTab; label: string; icon: string }[] = [
    { key: "week", label: "Theo tuần", icon: "📅" },
    { key: "browse", label: "Tất cả", icon: "📚" },
    { key: "weak", label: "Ôn yếu", icon: "🔴" },
    { key: "random", label: "Ngẫu nhiên", icon: "🎲" },
  ];

  return (
    <div className="px-4 py-6 pb-24">
      <h1 className="text-xl font-extrabold text-gray-800 mb-4">
        Chọn bài luyện tập
      </h1>

      {/* Tab bar */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-bold transition-colors touch-target ${
              activeTab === tab.key
                ? "bg-primary-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Current week info */}
      {activeTab === "week" && (
        <p className="text-sm text-gray-500 mb-4">
          Tuần {student?.current_week || 1} — {filteredTopics.length} bài
        </p>
      )}

      {/* Topic list */}
      <div className="space-y-2">
        {filteredTopics.map((topic) => {
          const prog = progress[topic.id];
          return (
            <button
              key={topic.id}
              onClick={() => selectTopic(topic)}
              className="w-full p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow text-left touch-target flex items-center justify-between"
            >
              <div>
                <div className="font-bold text-gray-800">
                  {topic.topic_name}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  {topic.chapter_name} · T{topic.week_suggestion}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {prog?.weak_flag && (
                  <span className="text-xs bg-error-100 text-error-600 px-2 py-0.5 rounded-full">
                    Yếu
                  </span>
                )}
                {prog && (
                  <span className="text-xs text-gray-400">
                    {Math.round(prog.accuracy_rate * 100)}%
                  </span>
                )}
              </div>
            </button>
          );
        })}

        {filteredTopics.length === 0 && (
          <p className="text-center text-gray-400 py-10">
            {activeTab === "weak"
              ? "Tuyệt vời! Không có điểm yếu nào."
              : "Không có bài nào cho tuần này."}
          </p>
        )}
      </div>
    </div>
  );
}
