"use client";

import { useMemo, useState } from "react";

const DEFAULT_SUBJECT =
  "[Toán Vui] Tài khoản dùng thử đã được kích hoạt 🎉";

// HTML body — render rich trên Gmail/Outlook (inline styles cho tương thích).
const DEFAULT_BODY_HTML = `<div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:580px;margin:0 auto;padding:24px;color:#1e293b;background:#f8fafc">
  <div style="background:#fff;border-radius:16px;padding:32px 28px;box-shadow:0 2px 8px rgba(0,0,0,0.04)">

    <div style="text-align:center;margin-bottom:24px">
      <h1 style="margin:0;font-size:24px;color:#1e3a8a">📐 Toán Vui</h1>
      <p style="margin:4px 0 0;color:#64748b;font-size:14px">Luyện toán cho bé lớp 3-5</p>
    </div>

    <h2 style="margin:0 0 16px;font-size:20px;color:#1e293b">Tài khoản đã được kích hoạt 🎉</h2>

    <p style="line-height:1.6">Chào ba/mẹ,</p>
    <p style="line-height:1.6">Tài khoản học của bé tại Toán Vui đã được kích hoạt lại ở chế độ <strong>DÙNG THỬ</strong>.</p>

    <table style="width:100%;background:#fef3c7;border-radius:12px;margin:20px 0;border-collapse:separate">
      <tr><td style="padding:14px 16px">
        <strong style="color:#92400e">🎯 Quyền dùng thử:</strong>
        <ul style="margin:6px 0 0;padding-left:20px;color:#78350f;line-height:1.7">
          <li>20 bài tập miễn phí cho bé</li>
          <li>Trong vòng 14 ngày kể từ hôm nay</li>
        </ul>
      </td></tr>
    </table>

    <div style="text-align:center;margin:28px 0">
      <a href="https://vui-hoc-toan.vercel.app" style="display:inline-block;background:#22c55e;color:#fff;padding:14px 36px;border-radius:12px;text-decoration:none;font-weight:bold;font-size:16px">
        Vào học ngay →
      </a>
      <p style="margin:8px 0 0;font-size:12px;color:#64748b">Tip: bấm "Đăng nhập với Google" cho nhanh</p>
    </div>

    <h3 style="margin:24px 0 8px;font-size:16px;color:#1e3a8a">✨ Đợt cập nhật mới</h3>
    <ul style="padding-left:20px;line-height:1.7;margin:0">
      <li>📚 Kho hàng nghìn câu hỏi sẵn — vào là học, không phải chờ</li>
      <li>📘 Đầy đủ lớp 3-5 cho cả Cánh Diều và Kết Nối Tri Thức</li>
      <li>🏆 Bảng xếp hạng tuần theo các hành tinh Hệ Mặt Trời</li>
      <li>🔐 Đăng nhập nhanh bằng Google</li>
    </ul>

    <p style="background:#eff6ff;padding:12px 16px;border-radius:8px;font-size:14px;margin:20px 0">
      👀 <a href="https://vui-hoc-toan.vercel.app/preview.html" style="color:#1d4ed8;font-weight:bold;text-decoration:none">Xem trước giao diện app →</a>
    </p>

    <p style="color:#475569;font-size:14px;padding:12px 16px;background:#f1f5f9;border-radius:8px;line-height:1.6">
      📅 <strong>Sắp tới (sau lễ 1/5):</strong> module Toán tư duy logic — luyện đề kiểu Violympic, TIMO, ASMO.
    </p>

    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0">

    <p style="font-size:14px;color:#475569;line-height:1.7">
      📞 Khi hết dùng thử, ba/mẹ muốn bé học tiếp, vui lòng liên hệ:<br>
      Zalo: <strong>0949908210</strong> · Email: <strong>chinhpv@gmail.com</strong>
    </p>

    <p style="color:#94a3b8;font-size:13px;margin-top:20px">
      Cám ơn ba/mẹ đã đồng hành cùng Toán Vui.<br>
      — Team Toán Vui
    </p>
  </div>
</div>`;

interface SendResult {
  email: string;
  ok: boolean;
  error?: string;
}

interface NotifyResponse {
  total: number;
  sent: number;
  failed: number;
  results: SendResult[];
}

export default function AdminNotifyPage() {
  const [recipientsRaw, setRecipientsRaw] = useState("");
  const [subject, setSubject] = useState(DEFAULT_SUBJECT);
  const [body, setBody] = useState(DEFAULT_BODY_HTML);
  const [isHtml, setIsHtml] = useState(true);
  const [showPreview, setShowPreview] = useState(true);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<NotifyResponse | null>(null);
  const [error, setError] = useState("");

  const parsedRecipients = useMemo(() => {
    return Array.from(
      new Set(
        recipientsRaw
          .split(/[\s,;]+/)
          .map((s) => s.trim().toLowerCase())
          .filter((s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s))
      )
    );
  }, [recipientsRaw]);

  async function handleSend() {
    setError("");
    setResult(null);

    if (parsedRecipients.length === 0) {
      setError("Chưa có email hợp lệ");
      return;
    }
    if (!subject.trim() || !body.trim()) {
      setError("Tiêu đề và nội dung không được trống");
      return;
    }
    if (
      !confirm(
        `Sẽ gửi mail tới ${parsedRecipients.length} người. Tiếp tục?`
      )
    )
      return;

    setSending(true);
    try {
      const res = await fetch("/api/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: parsedRecipients,
          subject,
          body,
          is_html: isHtml,
        }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }
      const data = (await res.json()) as NotifyResponse;
      setResult(data);
    } catch (e) {
      setError((e as Error).message);
    }
    setSending(false);
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">📧 Gửi mail thông báo</h1>
        <p className="text-sm text-gray-500 mt-1">
          Gửi qua Gmail SMTP từ {process.env.NEXT_PUBLIC_APP_VERSION ? "" : ""}
          {/* show GMAIL_FROM via API check would require fetch; keep static */}
          tài khoản admin. Giới hạn 500 mail / ngày, 200 / lần gọi.
        </p>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Danh sách email (mỗi dòng 1 email, hoặc cách bằng dấu phẩy)
          </label>
          <textarea
            value={recipientsRaw}
            onChange={(e) => setRecipientsRaw(e.target.value)}
            rows={6}
            placeholder={"phuhuynh1@gmail.com\nphuhuynh2@yahoo.com\n..."}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary-500 font-mono text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">
            Đã parse: <strong>{parsedRecipients.length}</strong> email hợp lệ
            (đã bỏ trùng).
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Tiêu đề
          </label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary-500"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-gray-700">
              Nội dung
            </label>
            <div className="flex items-center gap-3 text-sm">
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isHtml}
                  onChange={(e) => setIsHtml(e.target.checked)}
                />
                <span>Gửi dạng HTML</span>
              </label>
              {isHtml && (
                <button
                  type="button"
                  onClick={() => setShowPreview((v) => !v)}
                  className="text-primary-600 hover:underline"
                >
                  {showPreview ? "Ẩn xem trước" : "Xem trước"}
                </button>
              )}
            </div>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary-500 text-sm font-mono"
          />
          <p className="text-xs text-gray-500 mt-1">
            {isHtml
              ? "HTML — render rich trên Gmail/Outlook. Dùng inline styles để tương thích."
              : "Plain text — xuống dòng giữ nguyên."}
          </p>
        </div>

        {isHtml && showPreview && (
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Xem trước (rendered)
            </p>
            <div
              className="border border-gray-200 rounded-xl overflow-hidden"
              style={{ background: "#f8fafc" }}
              dangerouslySetInnerHTML={{ __html: body }}
            />
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={sending || parsedRecipients.length === 0}
          className="px-5 py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50"
        >
          {sending
            ? "Đang gửi..."
            : `Gửi tới ${parsedRecipients.length} người`}
        </button>

        {error && (
          <p className="text-error-600 text-sm">⚠ {error}</p>
        )}

        {result && (
          <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-2">
            <div className="text-sm">
              <strong>Kết quả:</strong>{" "}
              <span className="text-success-600 font-semibold">
                ✓ {result.sent} thành công
              </span>
              {result.failed > 0 && (
                <span className="text-error-600 font-semibold ml-3">
                  ✗ {result.failed} thất bại
                </span>
              )}
            </div>
            {result.failed > 0 && (
              <details className="text-xs">
                <summary className="cursor-pointer text-gray-700">
                  Xem chi tiết lỗi
                </summary>
                <ul className="mt-2 space-y-1 font-mono">
                  {result.results
                    .filter((r) => !r.ok)
                    .map((r) => (
                      <li key={r.email} className="text-error-600">
                        {r.email}: {r.error}
                      </li>
                    ))}
                </ul>
              </details>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
