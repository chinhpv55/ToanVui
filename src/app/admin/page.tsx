"use client";

import { useEffect, useState, useMemo } from "react";
import { createClient } from "@/lib/supabase/client";

type Plan = "trial" | "active" | "suspended";

interface AdminUser {
  user_id: string;
  email: string;
  plan: Plan;
  is_admin: boolean;
  exercise_count: number;
  trial_started_at: string;
  activated_at: string | null;
  suspended_at: string | null;
  notes: string | null;
  student_name: string | null;
  student_grade: number | null;
  student_username: string | null;
  created_at: string;
}

const PLAN_LABEL: Record<Plan, string> = {
  trial: "🟡 Dùng thử",
  active: "🟢 Đã kích hoạt",
  suspended: "🔴 Tạm khoá",
};

export default function AdminUsersPage() {
  const supabase = useMemo(() => createClient(), []);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filter, setFilter] = useState<"all" | Plan>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase.rpc("admin_list_users");
    if (error) {
      console.error(error);
      setUsers([]);
    } else {
      setUsers((data as AdminUser[]) || []);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function setPlan(userId: string, newPlan: Plan, note?: string) {
    setUpdatingId(userId);
    const patch: Record<string, unknown> = { plan: newPlan };
    if (newPlan === "active") {
      patch.activated_at = new Date().toISOString();
      patch.suspended_at = null;
      if (note) patch.notes = note;
    } else if (newPlan === "suspended") {
      patch.suspended_at = new Date().toISOString();
      if (note) patch.notes = note;
    } else if (newPlan === "trial") {
      patch.trial_started_at = new Date().toISOString();
      patch.exercise_count = 0;
      patch.suspended_at = null;
      patch.activated_at = null;
      if (note) patch.notes = note;
    }

    const { error } = await supabase
      .from("user_accounts")
      .update(patch)
      .eq("user_id", userId);

    if (error) {
      alert("Lỗi cập nhật: " + error.message);
    } else {
      await load();
    }
    setUpdatingId(null);
  }

  const counts = useMemo(() => {
    return users.reduce(
      (acc, u) => {
        acc[u.plan]++;
        acc.total++;
        return acc;
      },
      { trial: 0, active: 0, suspended: 0, total: 0 }
    );
  }, [users]);

  const visible = useMemo(() => {
    return users.filter((u) => {
      if (filter !== "all" && u.plan !== filter) return false;
      if (search) {
        const q = search.toLowerCase();
        const hay =
          (u.email || "") +
          " " +
          (u.student_name || "") +
          " " +
          (u.student_username || "");
        if (!hay.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [users, filter, search]);

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Tổng số user" value={counts.total} color="bg-gray-100" />
        <StatCard label="🟢 Đã kích hoạt" value={counts.active} color="bg-success-400/10" />
        <StatCard label="🟡 Dùng thử" value={counts.trial} color="bg-accent-100" />
        <StatCard label="🔴 Tạm khoá" value={counts.suspended} color="bg-error-400/10" />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        <input
          type="text"
          placeholder="Tìm theo email, tên bé, biệt danh..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 min-w-[200px] px-4 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary-500"
        />
        <div className="flex gap-2">
          {(["all", "trial", "active", "suspended"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-lg text-sm font-medium ${
                filter === f
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {f === "all" ? "Tất cả" : PLAN_LABEL[f]}
            </button>
          ))}
        </div>
        <button
          onClick={load}
          className="px-3 py-2 rounded-lg text-sm bg-gray-100 hover:bg-gray-200"
        >
          ↻ Tải lại
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Bé / Lớp</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3 text-right">Lượt</th>
                <th className="px-4 py-3">Ngày tạo</th>
                <th className="px-4 py-3 text-right">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Đang tải...
                  </td>
                </tr>
              )}
              {!loading && visible.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Không có user nào khớp
                  </td>
                </tr>
              )}
              {visible.map((u) => (
                <tr key={u.user_id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{u.email}</div>
                    {u.is_admin && (
                      <span className="text-xs text-primary-600 font-semibold">
                        ⭐ Admin
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {u.student_name ? (
                      <>
                        <div className="text-gray-900">{u.student_name}</div>
                        <div className="text-xs text-gray-500">
                          Lớp {u.student_grade ?? "—"}
                          {u.student_username
                            ? ` · ${u.student_username}`
                            : ""}
                        </div>
                      </>
                    ) : (
                      <span className="text-gray-400 italic">Chưa có hồ sơ</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium">{PLAN_LABEL[u.plan]}</span>
                    {u.notes && (
                      <div className="text-xs text-gray-400 mt-1 max-w-xs truncate">
                        {u.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">
                    {u.exercise_count}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {formatDate(u.created_at)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ActionButtons
                      user={u}
                      busy={updatingId === u.user_id}
                      onSetPlan={setPlan}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <div className="text-xs text-gray-600 font-medium">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mt-1">{value}</div>
    </div>
  );
}

function ActionButtons({
  user,
  busy,
  onSetPlan,
}: {
  user: AdminUser;
  busy: boolean;
  onSetPlan: (id: string, plan: Plan, note?: string) => void;
}) {
  if (user.is_admin) {
    return <span className="text-xs text-gray-400 italic">—</span>;
  }
  return (
    <div className="flex justify-end gap-2">
      {user.plan !== "active" && (
        <button
          disabled={busy}
          onClick={() => {
            const note = prompt("Ghi chú (vd: gia đình anh Nam):", user.notes || "");
            if (note === null) return;
            onSetPlan(user.user_id, "active", note);
          }}
          className="px-3 py-1 rounded-md bg-success-500 hover:bg-success-600 text-white text-xs font-medium disabled:opacity-50"
        >
          Kích hoạt
        </button>
      )}
      {user.plan !== "suspended" && (
        <button
          disabled={busy}
          onClick={() => {
            if (!confirm(`Khoá user ${user.email}?`)) return;
            onSetPlan(user.user_id, "suspended", "Suspended by admin");
          }}
          className="px-3 py-1 rounded-md bg-error-500 hover:bg-error-600 text-white text-xs font-medium disabled:opacity-50"
        >
          Khoá
        </button>
      )}
      {user.plan !== "trial" && (
        <button
          disabled={busy}
          onClick={() => {
            if (!confirm(`Reset về trial cho ${user.email}?`)) return;
            onSetPlan(user.user_id, "trial", "Reset to trial by admin");
          }}
          className="px-3 py-1 rounded-md bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-medium disabled:opacity-50"
        >
          Reset trial
        </button>
      )}
    </div>
  );
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
