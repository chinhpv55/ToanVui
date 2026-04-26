"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface BankRow {
  topic_id: string;
  topic_code: string;
  topic_name: string;
  grade: number;
  series: string;
  easy_count: number;
  medium_count: number;
  hard_count: number;
  total_count: number;
}

interface SeedResult {
  topic_id: string;
  topic_name: string;
  grade: number;
  model: string;
  total_ai_calls: number;
  truncated: boolean;
  results: Array<{
    difficulty: "easy" | "medium" | "hard";
    before: number;
    parsed: number;
    added: number;
    after: number;
    ai_calls: number;
  }>;
}

const DEFAULT_TARGET = 30;

export default function AdminBankPage() {
  const supabase = useMemo(() => createClient(), []);
  const [rows, setRows] = useState<BankRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [seedingTopicId, setSeedingTopicId] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{
    current: number;
    total: number;
    log: string[];
  } | null>(null);
  const [target, setTarget] = useState(DEFAULT_TARGET);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.rpc("bank_stats");
    if (error) {
      console.error(error);
      setRows([]);
    } else {
      setRows((data as BankRow[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function seedOne(topicId: string): Promise<SeedResult> {
    const res = await fetch("/api/admin/seed-bank", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic_id: topicId, target_per_difficulty: target }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`seed-bank failed (${res.status}): ${text}`);
    }
    return (await res.json()) as SeedResult;
  }

  async function handleSeedSingle(topicId: string) {
    setSeedingTopicId(topicId);
    try {
      const result = await seedOne(topicId);
      console.log("Seed result:", result);
    } catch (e) {
      alert(`Lỗi: ${(e as Error).message}`);
    }
    setSeedingTopicId(null);
    await load();
  }

  async function handleSeedAll() {
    const incomplete = rows.filter((r) => r.total_count < target * 3);
    if (incomplete.length === 0) {
      alert("Tất cả topic đã đủ rồi anh ơi 🎉");
      return;
    }
    if (
      !confirm(
        `Sẽ pre-seed ${incomplete.length} topic chưa đủ (${target} câu/độ khó). Quá trình có thể mất 5-15 phút và tốn API. Tiếp tục?`
      )
    )
      return;

    setBulkProgress({ current: 0, total: incomplete.length, log: [] });
    for (let i = 0; i < incomplete.length; i++) {
      const t = incomplete[i];
      try {
        const result = await seedOne(t.topic_id);
        const added = result.results.reduce((s, r) => s + r.added, 0);
        const parsed = result.results.reduce((s, r) => s + r.parsed, 0);
        const note =
          parsed > 0 && added === 0
            ? ` ⚠ parser=${parsed} nhưng insert=0 (kiểm tra RLS)`
            : parsed > added
            ? ` (parser=${parsed}, dedup ${parsed - added})`
            : "";
        setBulkProgress((prev) =>
          prev
            ? {
                ...prev,
                current: i + 1,
                log: [
                  ...prev.log,
                  `✓ ${t.topic_name}: +${added} câu (${result.total_ai_calls} AI calls)${note}`,
                ],
              }
            : null
        );
      } catch (e) {
        setBulkProgress((prev) =>
          prev
            ? {
                ...prev,
                current: i + 1,
                log: [
                  ...prev.log,
                  `✗ ${t.topic_name}: ${(e as Error).message}`,
                ],
              }
            : null
        );
      }
      await load(); // refresh stats between topics
    }
    setBulkProgress((prev) =>
      prev ? { ...prev, log: [...prev.log, "─── Hoàn tất ───"] } : null
    );
  }

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.topics++;
        acc.exercises += r.total_count;
        if (r.total_count >= target * 3) acc.complete++;
        return acc;
      },
      { topics: 0, exercises: 0, complete: 0 }
    );
  }, [rows, target]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📚 Kho bài tập</h1>
          <p className="text-sm text-gray-500 mt-1">
            Sinh sẵn câu hỏi cho mỗi (chủ đề × độ khó). Khi user yêu cầu, app
            sẽ lấy từ kho trước, hết mới gọi Claude.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Tổng số chủ đề" value={totals.topics} color="bg-gray-100" />
        <Stat
          label="Đã đủ kho"
          value={`${totals.complete} / ${totals.topics}`}
          color="bg-success-400/10"
        />
        <Stat
          label="Tổng câu trong kho"
          value={totals.exercises}
          color="bg-primary-100"
        />
        <Stat
          label="Mục tiêu / độ khó"
          value={target}
          color="bg-accent-100"
        />
      </div>

      {/* Controls */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-gray-700">
          Số câu / độ khó:
          <input
            type="number"
            min={5}
            max={100}
            value={target}
            onChange={(e) => setTarget(Number(e.target.value))}
            className="ml-2 w-20 px-2 py-1 border border-gray-200 rounded"
          />
        </label>
        <button
          onClick={handleSeedAll}
          disabled={!!seedingTopicId || !!bulkProgress}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium disabled:opacity-50"
        >
          🚀 Seed tất cả topic chưa đủ
        </button>
        <button
          onClick={load}
          className="px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-sm"
        >
          ↻ Tải lại
        </button>
      </div>

      {/* Bulk progress */}
      {bulkProgress && (
        <div className="bg-white rounded-2xl p-4 shadow-sm space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>
              Tiến độ: {bulkProgress.current} / {bulkProgress.total}
            </span>
            <span className="text-gray-500">
              {Math.round((bulkProgress.current / bulkProgress.total) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-500 transition-all"
              style={{
                width: `${(bulkProgress.current / bulkProgress.total) * 100}%`,
              }}
            />
          </div>
          <div className="max-h-40 overflow-y-auto text-xs font-mono space-y-1 mt-2">
            {bulkProgress.log.map((line, i) => (
              <div
                key={i}
                className={
                  line.startsWith("✗") ? "text-error-600" : "text-gray-600"
                }
              >
                {line}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-3 py-3">Mã</th>
                <th className="px-3 py-3">Chủ đề</th>
                <th className="px-3 py-3 text-center">Lớp</th>
                <th className="px-3 py-3 text-right">Easy</th>
                <th className="px-3 py-3 text-right">Medium</th>
                <th className="px-3 py-3 text-right">Hard</th>
                <th className="px-3 py-3 text-right">Tổng</th>
                <th className="px-3 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-3 py-8 text-center text-gray-400">
                    Chưa có topic nào
                  </td>
                </tr>
              )}
              {rows.map((r) => {
                const isComplete = r.total_count >= target * 3;
                return (
                  <tr key={r.topic_id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 font-mono text-xs text-gray-500">
                      {r.topic_code}
                    </td>
                    <td className="px-3 py-2">
                      <div className="font-medium text-gray-900">
                        {r.topic_name}
                      </div>
                      <div className="text-xs text-gray-500">{r.series}</div>
                    </td>
                    <td className="px-3 py-2 text-center">{r.grade}</td>
                    <Cell n={r.easy_count} target={target} />
                    <Cell n={r.medium_count} target={target} />
                    <Cell n={r.hard_count} target={target} />
                    <td
                      className={`px-3 py-2 text-right font-bold ${
                        isComplete ? "text-success-600" : "text-gray-700"
                      }`}
                    >
                      {r.total_count} {isComplete && "✓"}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        disabled={
                          seedingTopicId !== null || bulkProgress !== null
                        }
                        onClick={() => handleSeedSingle(r.topic_id)}
                        className="px-3 py-1 rounded-md bg-primary-100 hover:bg-primary-200 text-primary-800 text-xs font-medium disabled:opacity-50"
                      >
                        {seedingTopicId === r.topic_id ? "..." : "Seed"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  color,
}: {
  label: string;
  value: number | string;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="text-xs text-gray-600 font-medium">{label}</div>
      <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function Cell({ n, target }: { n: number; target: number }) {
  const ok = n >= target;
  return (
    <td
      className={`px-3 py-2 text-right ${
        ok ? "text-success-700 font-semibold" : "text-gray-700"
      }`}
    >
      {n}
    </td>
  );
}
