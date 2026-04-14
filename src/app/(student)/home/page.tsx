"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStudentStore } from "@/stores/studentStore";
import { useSessionStore } from "@/stores/sessionStore";
import { CurriculumTopic, StudentTopicProgress } from "@/types/database";
import { motion } from "framer-motion";

// Skill type colors — solid fill for node backgrounds
const SKILL_NODE: Record<string, { bg: string; border: string; shadow: string; icon: string }> = {
  so_hoc:  { bg: "bg-blue-500",   border: "border-blue-600",  shadow: "shadow-blue-300",  icon: "🔢" },
  hinh_hoc:{ bg: "bg-green-500",  border: "border-green-600", shadow: "shadow-green-300", icon: "📐" },
  do_luong:{ bg: "bg-purple-500", border: "border-purple-600",shadow: "shadow-purple-300",icon: "📏" },
  toan_do: { bg: "bg-orange-500", border: "border-orange-600",shadow: "shadow-orange-300",icon: "📍" },
  bieu_thuc:{ bg: "bg-pink-500",  border: "border-pink-600",  shadow: "shadow-pink-300",  icon: "✏️" },
  thong_ke:{ bg: "bg-teal-500",   border: "border-teal-600",  shadow: "shadow-teal-300",  icon: "📊" },
};

// Chapter section colors
const CHAPTER_COLORS: string[] = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-teal-400 to-teal-600",
];

// Zigzag positions for nodes (left / center / right)
const POSITIONS = ["left", "center", "right", "center"] as const;

type NodePosition = "left" | "center" | "right";

function getNodePosition(index: number): NodePosition {
  return POSITIONS[index % POSITIONS.length];
}

function positionClass(pos: NodePosition) {
  if (pos === "left")   return "ml-4 mr-auto";
  if (pos === "right")  return "mr-4 ml-auto";
  return "mx-auto";
}

// Connector curve direction based on current and next position
function ConnectorLine({ from, to }: { from: NodePosition; to: NodePosition }) {
  const cls =
    from === "left" && to === "center" ? "rotate-[15deg] translate-x-4" :
    from === "center" && to === "right" ? "rotate-[15deg] translate-x-[-4px]" :
    from === "right" && to === "center" ? "rotate-[-15deg] translate-x-[-4px]" :
    from === "center" && to === "left" ? "rotate-[-15deg] translate-x-4" :
    "";
  return (
    <div className={`flex justify-center my-1 ${cls}`}>
      <div className="w-1 h-8 bg-gray-200 rounded-full" />
    </div>
  );
}

// Celebration burst shown when tapping a mastered node
function Burst({ x, y, show }: { x: number; y: number; show: boolean }) {
  if (!show) return null;
  const stars = ["⭐","✨","🌟","💫","⭐","✨"];
  return (
    <div className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {stars.map((s, i) => (
        <motion.span
          key={i}
          className="absolute text-lg"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
          animate={{
            opacity: 0,
            x: Math.cos((i / stars.length) * Math.PI * 2) * 60,
            y: Math.sin((i / stars.length) * Math.PI * 2) * 60,
            scale: 1.5,
          }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {s}
        </motion.span>
      ))}
    </div>
  );
}

export default function HomePage() {
  const router = useRouter();
  const { student } = useStudentStore();
  const { startSession } = useSessionStore();
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [progress, setProgress] = useState<Record<string, StudentTopicProgress>>({});
  const [burst, setBurst] = useState<{ x: number; y: number; show: boolean }>({ x: 0, y: 0, show: false });
  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: topicsData } = await supabase
        .from("curriculum_topics")
        .select("*")
        .eq("subject", "toan")
        .eq("grade", 3)
        .eq("series", "canh_dieu")
        .order("sort_order");
      if (topicsData) setTopics(topicsData);
      if (!student) return;
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

  async function startPractice(topic: CurriculumTopic, e: React.MouseEvent) {
    const topicProgress = progress[topic.id];
    const difficulty = topicProgress?.current_difficulty || "easy";
    // Celebration burst if mastered
    if (topicProgress?.mastery_level === "mastered") {
      setBurst({ x: e.clientX, y: e.clientY, show: true });
      setTimeout(() => setBurst((b) => ({ ...b, show: false })), 800);
    }
    startSession(topic.id, topic.topic_name, difficulty);
    router.push(`/practice/${crypto.randomUUID()}`);
  }

  async function startRandomPractice() {
    if (topics.length === 0) return;
    const startedTopics = topics.filter((t) => progress[t.id]);
    const pool = startedTopics.length > 0 ? startedTopics : topics;
    const random = pool[Math.floor(Math.random() * pool.length)];
    startPractice(random, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 } as React.MouseEvent);
  }

  // Group topics by chapter preserving order
  const chapterOrder: string[] = [];
  const chapters: Record<string, { name: string; semester: number; topics: CurriculumTopic[] }> = {};
  topics.forEach((t) => {
    if (!chapters[t.chapter_code]) {
      chapters[t.chapter_code] = { name: t.chapter_name, semester: t.semester, topics: [] };
      chapterOrder.push(t.chapter_code);
    }
    chapters[t.chapter_code].topics.push(t);
  });

  // Determine unlock state: a topic is unlocked if it or anything before it has been started,
  // or it's the very first topic in the path.
  // Build a flat ordered list to find "current" position
  const flatTopics = chapterOrder.flatMap((code) => chapters[code].topics);
  const firstUntouchedIndex = flatTopics.findIndex((t) => !progress[t.id] || progress[t.id].mastery_level === "not_started");
  // Topics with index <= firstUntouchedIndex are unlocked; rest are locked
  // But also unlock the one right after the last mastered
  function isUnlocked(globalIndex: number): boolean {
    if (globalIndex === 0) return true;
    if (firstUntouchedIndex === -1) return true; // all done
    return globalIndex <= firstUntouchedIndex;
  }

  // Weak topics (flagged)
  const weakTopics = flatTopics.filter((t) => progress[t.id]?.weak_flag).slice(0, 3);

  // Overall progress
  const masteredCount = flatTopics.filter((t) => progress[t.id]?.mastery_level === "mastered").length;
  const totalCount = flatTopics.length;
  const overallPct = totalCount > 0 ? Math.round((masteredCount / totalCount) * 100) : 0;

  let globalIndex = 0;

  return (
    <div className="px-4 py-6 pb-28">
      <Burst x={burst.x} y={burst.y} show={burst.show} />

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-5"
      >
        <h1 className="text-2xl font-extrabold text-gray-800">
          Chào {student?.name || "bé"}! 👋
        </h1>
        <p className="text-gray-500 text-sm">Tiếp tục hành trình học toán nào!</p>
      </motion.div>

      {/* Overall progress bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5"
      >
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-gray-700">Hành trình của bé</span>
          <span className="text-sm font-extrabold text-primary-600">{overallPct}%</span>
        </div>
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${overallPct}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
        <div className="flex justify-between mt-1.5 text-xs text-gray-400">
          <span>🌱 Bắt đầu</span>
          <span>{masteredCount}/{totalCount} bài</span>
          <span>🏆 Hoàn thành</span>
        </div>
      </motion.div>

      {/* Weak topic pills */}
      {weakTopics.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-5"
        >
          <p className="text-sm font-bold text-red-500 mb-2">🔴 Cần ôn thêm</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weakTopics.map((t) => (
              <button
                key={t.id}
                onClick={(e) => startPractice(t, e)}
                className="flex-shrink-0 px-3 py-2 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-600 touch-target"
              >
                {t.topic_name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Random practice */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        whileHover={{ scale: 1.01 }}
        onClick={startRandomPractice}
        className="w-full py-4 mb-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-primary-200 touch-target"
      >
        🎲 Luyện ngẫu nhiên
      </motion.button>

      {/* Learning path */}
      <div className="relative">
        {chapterOrder.map((code, chapterIdx) => {
          const chapter = chapters[code];
          const chapterGradient = CHAPTER_COLORS[chapterIdx % CHAPTER_COLORS.length];

          return (
            <div key={code} className="mb-2">
              {/* Chapter banner */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: chapterIdx * 0.05 }}
                className={`bg-gradient-to-r ${chapterGradient} rounded-2xl px-4 py-3 mb-6 text-white shadow-md`}
              >
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                  {chapter.semester === 1 ? "Học kỳ 1" : "Học kỳ 2"}
                </p>
                <p className="font-extrabold text-base">{chapter.name}</p>
              </motion.div>

              {/* Nodes for this chapter */}
              {chapter.topics.map((topic, topicIdx) => {
                const currentGlobalIndex = globalIndex++;
                const prog = progress[topic.id];
                const mastery = prog?.mastery_level || "not_started";
                const accuracy = prog ? Math.round(prog.accuracy_rate * 100) : 0;
                const unlocked = isUnlocked(currentGlobalIndex);
                const isCurrent = currentGlobalIndex === firstUntouchedIndex;
                const isMastered = mastery === "mastered";
                const isWeak = prog?.weak_flag;

                const nodeInfo = SKILL_NODE[topic.skill_type] || SKILL_NODE.so_hoc;
                const pos = getNodePosition(topicIdx);
                const nextPos = getNodePosition(topicIdx + 1);
                const isLast = topicIdx === chapter.topics.length - 1;

                return (
                  <div key={topic.id}>
                    {/* Node row */}
                    <motion.div
                      className={`flex ${positionClass(pos)}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: chapterIdx * 0.05 + topicIdx * 0.04, type: "spring", stiffness: 200 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        {/* The tappable node */}
                        <motion.button
                          whileTap={unlocked ? { scale: 0.88 } : {}}
                          onClick={(e) => unlocked && startPractice(topic, e)}
                          disabled={!unlocked}
                          className="relative flex flex-col items-center focus:outline-none"
                        >
                          {/* Current indicator — pulsing ring */}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-yellow-300 opacity-40"
                              animate={{ scale: [1, 1.5, 1] }}
                              transition={{ duration: 1.5, repeat: Infinity }}
                              style={{ margin: -6 }}
                            />
                          )}

                          {/* Node circle */}
                          <div
                            className={`
                              relative w-16 h-16 rounded-full border-4 flex items-center justify-center
                              text-2xl shadow-lg transition-all duration-200
                              ${unlocked
                                ? `${nodeInfo.bg} ${nodeInfo.border} ${nodeInfo.shadow} text-white`
                                : "bg-gray-100 border-gray-200 text-gray-300 shadow-none"
                              }
                              ${isCurrent ? "ring-4 ring-yellow-300 ring-offset-2" : ""}
                              ${isWeak && unlocked ? "ring-2 ring-red-400 ring-offset-1" : ""}
                            `}
                          >
                            {!unlocked ? (
                              <span className="text-xl">🔒</span>
                            ) : isMastered ? (
                              <span>⭐</span>
                            ) : mastery === "practicing" ? (
                              <span>{nodeInfo.icon}</span>
                            ) : mastery === "learning" ? (
                              <span>{nodeInfo.icon}</span>
                            ) : (
                              <span>{nodeInfo.icon}</span>
                            )}

                            {/* Mastered checkmark badge */}
                            {isMastered && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                              >
                                ✓
                              </motion.div>
                            )}

                            {/* Weak badge */}
                            {isWeak && unlocked && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          {/* Accuracy ring underlay (progress arc via clip) */}
                          {prog && !isMastered && unlocked && (
                            <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden opacity-30">
                              <div
                                className="absolute inset-0 rounded-full border-4 border-white"
                                style={{
                                  background: `conic-gradient(white ${accuracy * 3.6}deg, transparent ${accuracy * 3.6}deg)`,
                                }}
                              />
                            </div>
                          )}

                          {/* Label */}
                          <span
                            className={`mt-2 text-xs font-bold text-center max-w-[80px] leading-tight ${
                              unlocked ? "text-gray-700" : "text-gray-300"
                            }`}
                          >
                            {topic.topic_name}
                          </span>

                          {/* Stars earned label */}
                          {isMastered && (
                            <span className="text-xs text-yellow-500 font-bold">
                              ★★★
                            </span>
                          )}
                          {mastery === "practicing" && (
                            <span className="text-xs text-yellow-400 font-bold">
                              ★★☆
                            </span>
                          )}
                          {mastery === "learning" && (
                            <span className="text-xs text-yellow-300 font-bold">
                              ★☆☆
                            </span>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    {/* Connector line to next node */}
                    {!isLast && (
                      <ConnectorLine from={pos} to={nextPos} />
                    )}
                  </div>
                );
              })}

              {/* Chapter end checkpoint */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: chapterIdx * 0.05 + 0.3 }}
                className="flex justify-center my-6"
              >
                <div className="flex flex-col items-center gap-1">
                  <div className="w-px h-6 bg-gray-200" />
                  <div className="px-4 py-1.5 rounded-full bg-gray-100 border border-gray-200 text-xs font-bold text-gray-400">
                    ✦ Hết chương ✦
                  </div>
                  <div className="w-px h-6 bg-gray-200" />
                </div>
              </motion.div>
            </div>
          );
        })}

        {/* End of path */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-2 py-6"
          >
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 border-4 border-yellow-400 shadow-lg shadow-yellow-200 flex items-center justify-center text-3xl">
              🏆
            </div>
            <p className="font-extrabold text-yellow-600 text-base">Đích đến!</p>
            <p className="text-xs text-gray-400">Hoàn thành {masteredCount}/{totalCount} bài</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
