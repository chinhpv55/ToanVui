"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStudentStore } from "@/stores/studentStore";
import { useSessionStore } from "@/stores/sessionStore";
import { CurriculumTopic, StudentTopicProgress } from "@/types/database";
import { motion } from "framer-motion";

const SKILL_COLORS: Record<string, string> = {
  so_hoc: "bg-blue-100 border-blue-300 text-blue-700",
  hinh_hoc: "bg-green-100 border-green-300 text-green-700",
  do_luong: "bg-purple-100 border-purple-300 text-purple-700",
  toan_do: "bg-orange-100 border-orange-300 text-orange-700",
  bieu_thuc: "bg-pink-100 border-pink-300 text-pink-700",
  thong_ke: "bg-teal-100 border-teal-300 text-teal-700",
};

const MASTERY_BADGES: Record<string, string> = {
  not_started: "",
  learning: "📖",
  practicing: "🔄",
  mastered: "⭐",
};

export default function HomePage() {
  const router = useRouter();
  const { student } = useStudentStore();
  const { startSession } = useSessionStore();
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [progress, setProgress] = useState<Record<string, StudentTopicProgress>>({});
  const [weakTopics, setWeakTopics] = useState<CurriculumTopic[]>([]);
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      // Load topics
      const { data: topicsData } = await supabase
        .from("curriculum_topics")
        .select("*")
        .eq("subject", "toan")
        .eq("grade", 3)
        .eq("series", "canh_dieu")
        .order("sort_order");

      if (topicsData) setTopics(topicsData);

      if (!student) return;

      // Load progress
      const { data: progressData } = await supabase
        .from("student_topic_progress")
        .select("*")
        .eq("student_id", student.id);

      if (progressData) {
        const map: Record<string, StudentTopicProgress> = {};
        progressData.forEach((p) => (map[p.topic_id] = p));
        setProgress(map);

        // Weak topics
        const weak = progressData
          .filter((p) => p.weak_flag)
          .sort((a, b) => a.accuracy_rate - b.accuracy_rate)
          .slice(0, 3);
        const weakTopicIds = weak.map((w) => w.topic_id);
        if (topicsData) {
          setWeakTopics(
            topicsData.filter((t) => weakTopicIds.includes(t.id))
          );
        }
      }
    }
    load();
  }, [supabase, student]);

  async function startPractice(topic: CurriculumTopic) {
    const topicProgress = progress[topic.id];
    const difficulty = topicProgress?.current_difficulty || "easy";

    startSession(topic.id, topic.topic_name, difficulty);
    router.push(`/practice/${crypto.randomUUID()}`);
  }

  async function startRandomPractice() {
    if (topics.length === 0) return;
    // Pick random topics that have been started, or any if none started
    const startedTopics = topics.filter((t) => progress[t.id]);
    const pool = startedTopics.length > 0 ? startedTopics : topics;
    const random = pool[Math.floor(Math.random() * pool.length)];
    startPractice(random);
  }

  // Group topics by chapter
  const chapters = topics.reduce(
    (acc, topic) => {
      if (!acc[topic.chapter_code]) {
        acc[topic.chapter_code] = {
          name: topic.chapter_name,
          topics: [],
          semester: topic.semester,
        };
      }
      acc[topic.chapter_code].topics.push(topic);
      return acc;
    },
    {} as Record<string, { name: string; topics: CurriculumTopic[]; semester: number }>
  );

  return (
    <div className="px-4 py-6 pb-24">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Chào {student?.name || "bé"}! 👋
        </h1>
        <p className="text-gray-500">Hôm nay mình học gì nào?</p>
      </div>

      {/* Random practice button */}
      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={startRandomPractice}
        className="w-full py-5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-extrabold text-xl rounded-2xl shadow-lg shadow-primary-200 mb-6 touch-target"
      >
        🎲 Luyện ngẫu nhiên
      </motion.button>

      {/* Weak point section */}
      {weakTopics.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold text-error-600 mb-3 flex items-center gap-2">
            <span className="text-xl">🔴</span> Cần ôn thêm
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {weakTopics.map((topic) => (
              <button
                key={topic.id}
                onClick={() => startPractice(topic)}
                className="flex-shrink-0 px-4 py-3 bg-error-400/10 border border-error-300 rounded-xl text-sm font-semibold text-error-700 touch-target"
              >
                {topic.topic_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topics by chapter */}
      {Object.entries(chapters).map(([code, chapter]) => (
        <div key={code} className="mb-6">
          <h2 className="text-base font-bold text-gray-700 mb-3">
            {chapter.semester === 1 ? "HK1" : "HK2"} - {chapter.name}
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {chapter.topics.map((topic) => {
              const prog = progress[topic.id];
              const colorClass =
                SKILL_COLORS[topic.skill_type] || SKILL_COLORS.so_hoc;
              const badge = MASTERY_BADGES[prog?.mastery_level || "not_started"];

              return (
                <motion.button
                  key={topic.id}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => startPractice(topic)}
                  className={`p-3 rounded-xl border text-left touch-target ${colorClass} ${
                    prog?.weak_flag ? "ring-2 ring-error-400" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold leading-tight">
                      {topic.topic_name}
                    </span>
                    {badge && <span className="text-sm">{badge}</span>}
                  </div>
                  {prog && (
                    <div className="mt-2 w-full h-1.5 bg-white/50 rounded-full">
                      <div
                        className="h-full bg-current rounded-full opacity-50"
                        style={{
                          width: `${Math.round(prog.accuracy_rate * 100)}%`,
                        }}
                      />
                    </div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
