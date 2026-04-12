"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { CurriculumTopic, Student } from "@/types/database";

export default function AssignPage() {
  const supabase = createClient();
  const [student, setStudent] = useState<Student | null>(null);
  const [topics, setTopics] = useState<CurriculumTopic[]>([]);
  const [assignedId, setAssignedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: studentData } = await supabase
        .from("students")
        .select("*")
        .eq("parent_id", user.id)
        .single();

      if (studentData) {
        setStudent(studentData);
        setAssignedId(studentData.assigned_topic_id);
      }

      const { data: topicsData } = await supabase
        .from("curriculum_topics")
        .select("*")
        .eq("subject", "toan")
        .eq("grade", 3)
        .order("sort_order");

      if (topicsData) setTopics(topicsData);
    }
    load();
  }, [supabase]);

  async function assignTopic(topicId: string | null) {
    if (!student) return;
    await supabase
      .from("students")
      .update({ assigned_topic_id: topicId })
      .eq("id", student.id);
    setAssignedId(topicId);
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="font-bold text-gray-700 mb-2">Giao bài cho bé</h3>
        <p className="text-sm text-gray-500 mb-4">
          Chọn 1 chủ đề — bé sẽ chỉ làm chủ đề này khi mở app
        </p>

        {assignedId && (
          <div className="mb-4 p-3 bg-primary-50 rounded-xl flex items-center justify-between">
            <span className="font-semibold text-primary-700">
              Đang giao: {topics.find((t) => t.id === assignedId)?.topic_name}
            </span>
            <button
              onClick={() => assignTopic(null)}
              className="text-sm text-error-600 font-bold"
            >
              Bỏ giao
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-[60vh] overflow-y-auto">
          {topics.map((topic) => (
            <button
              key={topic.id}
              onClick={() => assignTopic(topic.id)}
              className={`w-full p-3 rounded-xl border text-left transition-colors ${
                assignedId === topic.id
                  ? "border-primary-500 bg-primary-50"
                  : "border-gray-100 hover:border-primary-300"
              }`}
            >
              <div className="font-semibold text-gray-800 text-sm">
                {topic.topic_name}
              </div>
              <div className="text-xs text-gray-400">
                {topic.chapter_name} · T{topic.week_suggestion}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
