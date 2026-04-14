"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useStudentStore } from "@/stores/studentStore";
import { useSessionStore } from "@/stores/sessionStore";
import { CurriculumTopic, StudentTopicProgress } from "@/types/database";
import { motion } from "framer-motion";
import { getDailyStars, DAILY_GOAL_STARS } from "@/lib/dailyGoal";

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const SKILL_NODE: Record<string, { bg: string; border: string; shadow: string; icon: string }> = {
  so_hoc:   { bg: "bg-blue-500",   border: "border-blue-600",   shadow: "shadow-blue-300",   icon: "🔢" },
  hinh_hoc: { bg: "bg-green-500",  border: "border-green-600",  shadow: "shadow-green-300",  icon: "📐" },
  do_luong: { bg: "bg-purple-500", border: "border-purple-600", shadow: "shadow-purple-300", icon: "📏" },
  toan_do:  { bg: "bg-orange-500", border: "border-orange-600", shadow: "shadow-orange-300", icon: "📍" },
  bieu_thuc:{ bg: "bg-pink-500",   border: "border-pink-600",   shadow: "shadow-pink-300",   icon: "✏️" },
  thong_ke: { bg: "bg-teal-500",   border: "border-teal-600",   shadow: "shadow-teal-300",   icon: "📊" },
};

const CHAPTER_COLORS: string[] = [
  "from-blue-400 to-blue-600",
  "from-green-400 to-green-600",
  "from-purple-400 to-purple-600",
  "from-orange-400 to-orange-600",
  "from-pink-400 to-pink-600",
  "from-teal-400 to-teal-600",
];

const POSITIONS = ["left", "center", "right", "center"] as const;
type NodePosition = "left" | "center" | "right";

function getNodePosition(index: number): NodePosition {
  return POSITIONS[index % POSITIONS.length];
}
function positionClass(pos: NodePosition) {
  if (pos === "left")  return "ml-4 mr-auto";
  if (pos === "right") return "mr-4 ml-auto";
  return "mx-auto";
}
function ConnectorLine({ from, to }: { from: NodePosition; to: NodePosition }) {
  const cls =
    from === "left"   && to === "center" ? "rotate-[15deg] translate-x-4"    :
    from === "center" && to === "right"  ? "rotate-[15deg] translate-x-[-4px]" :
    from === "right"  && to === "center" ? "rotate-[-15deg] translate-x-[-4px]":
    from === "center" && to === "left"   ? "rotate-[-15deg] translate-x-4"    : "";
  return (
    <div className={`flex justify-center my-1 ${cls}`}>
      <div className="w-1 h-8 bg-gray-200 rounded-full" />
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Celebration burst
// ─────────────────────────────────────────────────────────
function Burst({ x, y, show }: { x: number; y: number; show: boolean }) {
  if (!show) return null;
  const items = ["⭐","✨","🌟","💫","⭐","✨"];
  return (
    <div className="pointer-events-none fixed z-50" style={{ left: x, top: y }}>
      {items.map((s, i) => (
        <motion.span key={i} className="absolute text-lg"
          initial={{ opacity: 1, x: 0, y: 0, scale: 0.5 }}
          animate={{ opacity: 0, x: Math.cos((i/items.length)*Math.PI*2)*70, y: Math.sin((i/items.length)*Math.PI*2)*70, scale: 1.6 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >{s}</motion.span>
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Mascot card
// ─────────────────────────────────────────────────────────
interface MascotInfo {
  emoji: string;
  message: string;
  bg: string;
}

function getMascot(streakDays: number, practicedToday: boolean, goalMet: boolean): MascotInfo {
  if (goalMet) return {
    emoji: "🦉",
    message: "Bé đã đạt mục tiêu hôm nay rồi! Giỏi lắm! 🎉",
    bg: "from-yellow-50 to-yellow-100 border-yellow-200",
  };
  if (streakDays >= 7) return {
    emoji: "🦉",
    message: `Wow! ${streakDays} ngày liên tiếp rồi! Bé thật tuyệt vời! 🔥`,
    bg: "from-orange-50 to-orange-100 border-orange-200",
  };
  if (practicedToday) return {
    emoji: "🦉",
    message: "Hôm nay bé đã học rồi đó! Cố lên nhé! 💪",
    bg: "from-green-50 to-green-100 border-green-200",
  };
  if (streakDays >= 3) return {
    emoji: "🦉",
    message: `Streak ${streakDays} ngày đang chờ bé! Học một chút nhé! 🌟`,
    bg: "from-blue-50 to-blue-100 border-blue-200",
  };
  return {
    emoji: "🦉",
    message: "Chào bé! Hôm nay mình học toán vui nhé! 🎯",
    bg: "from-primary-50 to-primary-100 border-primary-200",
  };
}

function MascotCard({ streakDays, practicedToday, dailyStars }: {
  streakDays: number;
  practicedToday: boolean;
  dailyStars: number;
}) {
  const goalMet = dailyStars >= DAILY_GOAL_STARS;
  const mascot = getMascot(streakDays, practicedToday, goalMet);
  const pct = Math.min(100, Math.round((dailyStars / DAILY_GOAL_STARS) * 100));
  const circumference = 2 * Math.PI * 20; // r=20

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex items-center gap-4 p-4 rounded-2xl border bg-gradient-to-r ${mascot.bg} mb-5`}
    >
      {/* Mascot emoji with bounce */}
      <motion.div
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-4xl select-none flex-shrink-0"
      >
        {mascot.emoji}
      </motion.div>

      {/* Message */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-700 leading-snug">{mascot.message}</p>

        {/* Daily goal mini bar */}
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>Mục tiêu hôm nay</span>
            <span className={goalMet ? "text-yellow-500 font-bold" : ""}>
              {dailyStars}/{DAILY_GOAL_STARS} ⭐
            </span>
          </div>
          <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${goalMet ? "bg-yellow-400" : "bg-primary-400"}`}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          </div>
        </div>
      </div>

      {/* Daily goal ring */}
      <div className="flex-shrink-0 relative w-12 h-12">
        <svg width="48" height="48" className="-rotate-90">
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="4" />
          <motion.circle
            cx="24" cy="24" r="20" fill="none"
            stroke={goalMet ? "#f59e0b" : "#3b82f6"} strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - pct / 100) }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-xs font-extrabold text-gray-700">{pct}%</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────────────────
export default function HomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { student } = useStudentStore();
  const { startSession } = useSessionStore();
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [progress, setProgress] = useState<Record<string, StudentTopicProgress>>({});
  const [burst, setBurst] = useState({ x: 0, y: 0, show: false });
  const [dailyStars, setDailyStars] = useState(0);
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

      // Load progress
      const { data: progressData } = await supabase
        .from("student_topic_progress")
        .select("*")
        .eq("student_id", student.id);
      if (progressData) {
        const map: Record<string, StudentTopicProgress> = {};
        progressData.forEach((p) => (map[p.topic_id] = p));
        setProgress(map);
      }

      // Daily stars from localStorage
      setDailyStars(getDailyStars(student.id));
    }
    load();
  }, [supabase, student]);

  // Scroll to topic node after navigating back from "Luyện tiếp"
  useEffect(() => {
    const scrollToId = searchParams.get("scrollTo");
    if (!scrollToId || topics.length === 0) return;
    const el = document.getElementById(`topic-${scrollToId}`);
    if (el) {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
    }
  }, [searchParams, topics]);

  async function startPractice(topic: CurriculumTopic, e?: React.MouseEvent | { clientX: number; clientY: number }) {
    const topicProgress = progress[topic.id];
    const difficulty = topicProgress?.current_difficulty || "easy";
    if (topicProgress?.mastery_level === "mastered" && e) {
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
    startPractice(random, { clientX: window.innerWidth / 2, clientY: window.innerHeight / 3 });
  }

  // Group topics by chapter
  const chapterOrder: string[] = [];
  const chapters: Record<string, { name: string; semester: number; topics: CurriculumTopic[] }> = {};
  topics.forEach((t) => {
    if (!chapters[t.chapter_code]) {
      chapters[t.chapter_code] = { name: t.chapter_name, semester: t.semester, topics: [] };
      chapterOrder.push(t.chapter_code);
    }
    chapters[t.chapter_code].topics.push(t);
  });

  const flatTopics = chapterOrder.flatMap((code) => chapters[code].topics);
  const firstUntouchedIndex = flatTopics.findIndex(
    (t) => !progress[t.id] || progress[t.id].mastery_level === "not_started"
  );
  function isUnlocked(globalIdx: number): boolean {
    if (globalIdx === 0) return true;
    if (firstUntouchedIndex === -1) return true;
    return globalIdx <= firstUntouchedIndex;
  }

  const masteredCount = flatTopics.filter((t) => progress[t.id]?.mastery_level === "mastered").length;
  const startedCount = flatTopics.filter((t) => progress[t.id] && progress[t.id].mastery_level !== "not_started").length;
  const totalCount = flatTopics.length;
  // Weighted: mastered=1, practicing=0.67, learning=0.33
  const overallPct = totalCount > 0 ? Math.round(
    flatTopics.reduce((sum, t) => {
      const lvl = progress[t.id]?.mastery_level;
      if (lvl === "mastered") return sum + 1;
      if (lvl === "practicing") return sum + 0.67;
      if (lvl === "learning") return sum + 0.33;
      return sum;
    }, 0) / totalCount * 100
  ) : 0;

  const weakTopics = flatTopics.filter((t) => progress[t.id]?.weak_flag).slice(0, 3);

  // Mascot data
  const practicedToday = student?.last_practice_date
    ? student.last_practice_date.startsWith(new Date().toISOString().split("T")[0])
    : false;

  let globalIndex = 0;

  return (
    <div className="px-4 py-6 pb-28">
      <Burst x={burst.x} y={burst.y} show={burst.show} />

      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} className="mb-4">
        <h1 className="text-2xl font-extrabold text-gray-800">
          Chào {student?.name || "bé"}! 👋
        </h1>
        <p className="text-gray-500 text-sm">Tiếp tục hành trình học toán nào!</p>
      </motion.div>

      {/* Mascot + daily goal */}
      {student && (
        <MascotCard
          streakDays={student.streak_days}
          practicedToday={practicedToday}
          dailyStars={dailyStars}
        />
      )}

      {/* Overall progress bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
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
          <span>{startedCount}/{totalCount} bài</span>
          <span>🏆 Hoàn thành</span>
        </div>
      </motion.div>

      {/* Weak topic pills */}
      {weakTopics.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-5">
          <p className="text-sm font-bold text-red-500 mb-2">🔴 Cần ôn thêm</p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {weakTopics.map((t) => (
              <button key={t.id} onClick={(e) => startPractice(t, e)}
                className="flex-shrink-0 px-3 py-2 bg-red-50 border border-red-200 rounded-full text-xs font-semibold text-red-600 touch-target">
                {t.topic_name}
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Random practice */}
      <motion.button
        whileTap={{ scale: 0.96 }} whileHover={{ scale: 1.01 }}
        onClick={startRandomPractice}
        className="w-full py-4 mb-8 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-extrabold text-lg rounded-2xl shadow-lg shadow-primary-200 touch-target"
      >
        🎲 Luyện ngẫu nhiên
      </motion.button>

      {/* ─── Learning path ─── */}
      <div className="relative">
        {chapterOrder.map((code, chapterIdx) => {
          const chapter = chapters[code];
          const chapterGradient = CHAPTER_COLORS[chapterIdx % CHAPTER_COLORS.length];

          return (
            <div key={code} className="mb-2">
              {/* Chapter banner */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: chapterIdx * 0.05 }}
                className={`bg-gradient-to-r ${chapterGradient} rounded-2xl px-4 py-3 mb-6 text-white shadow-md`}
              >
                <p className="text-xs font-bold opacity-80 uppercase tracking-widest">
                  {chapter.semester === 1 ? "Học kỳ 1" : "Học kỳ 2"}
                </p>
                <p className="font-extrabold text-base">{chapter.name}</p>
              </motion.div>

              {/* Nodes */}
              {chapter.topics.map((topic, topicIdx) => {
                const curGlobalIdx = globalIndex++;
                const prog = progress[topic.id];
                const mastery = prog?.mastery_level || "not_started";
                const unlocked = isUnlocked(curGlobalIdx);
                const isCurrent = curGlobalIdx === firstUntouchedIndex;
                const isMastered = mastery === "mastered";
                const isWeak = prog?.weak_flag;
                const nodeInfo = SKILL_NODE[topic.skill_type] || SKILL_NODE.so_hoc;
                const pos = getNodePosition(topicIdx);
                const nextPos = getNodePosition(topicIdx + 1);
                const isLast = topicIdx === chapter.topics.length - 1;

                // Star row
                const starRow =
                  isMastered ? "★★★" :
                  mastery === "practicing" ? "★★☆" :
                  mastery === "learning" ? "★☆☆" : "";
                const starColor =
                  isMastered ? "text-yellow-500" :
                  mastery === "practicing" ? "text-yellow-400" :
                  "text-yellow-300";

                return (
                  <div key={topic.id} id={`topic-${topic.id}`}>
                    <motion.div
                      className={`flex ${positionClass(pos)}`}
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: chapterIdx * 0.05 + topicIdx * 0.04, type: "spring", stiffness: 200 }}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <motion.button
                          whileTap={unlocked ? { scale: 0.88 } : {}}
                          onClick={(e) => unlocked && startPractice(topic, e)}
                          disabled={!unlocked}
                          className="relative flex flex-col items-center focus:outline-none"
                        >
                          {/* Pulsing ring for current node */}
                          {isCurrent && (
                            <motion.div
                              className="absolute inset-0 rounded-full bg-yellow-300 opacity-40"
                              animate={{ scale: [1, 1.55, 1] }}
                              transition={{ duration: 1.6, repeat: Infinity }}
                              style={{ margin: -6 }}
                            />
                          )}

                          {/* Node circle */}
                          <div className={`
                            relative w-16 h-16 rounded-full border-4 flex items-center justify-center text-2xl shadow-lg transition-all duration-200
                            ${unlocked
                              ? `${nodeInfo.bg} ${nodeInfo.border} ${nodeInfo.shadow} text-white`
                              : "bg-gray-100 border-gray-200 text-gray-300 shadow-none opacity-60"
                            }
                            ${isCurrent ? "ring-4 ring-yellow-300 ring-offset-2" : ""}
                            ${isWeak && unlocked ? "ring-2 ring-red-400 ring-offset-1" : ""}
                          `}>
                            {!unlocked ? "🔒" : isMastered ? "⭐" : nodeInfo.icon}

                            {/* Mastered ✓ badge */}
                            {isMastered && (
                              <motion.div
                                initial={{ scale: 0 }} animate={{ scale: 1 }}
                                className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold"
                              >✓</motion.div>
                            )}

                            {/* Weak dot */}
                            {isWeak && unlocked && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white" />
                            )}
                          </div>

                          {/* Topic label */}
                          <span className={`mt-2 text-xs font-bold text-center max-w-[80px] leading-tight ${unlocked ? "text-gray-700" : "text-gray-300"}`}>
                            {topic.topic_name}
                          </span>

                          {/* Star row */}
                          {starRow && (
                            <span className={`text-xs font-bold ${starColor}`}>{starRow}</span>
                          )}
                        </motion.button>
                      </div>
                    </motion.div>

                    {!isLast && <ConnectorLine from={pos} to={nextPos} />}
                  </div>
                );
              })}

              {/* Chapter end */}
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
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

        {/* Trophy end */}
        {totalCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }}
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
