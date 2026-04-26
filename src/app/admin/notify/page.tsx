"use client";

import { useMemo, useState } from "react";

const DEFAULT_SUBJECT =
  "[Toán Vui] Bạn đã được kích hoạt lại — vào học tiếp thôi! 🎉";

const DEFAULT_BODY = `Chào ba/mẹ,

Tài khoản học của bé tại Toán Vui đã được kích hoạt lại ở chế độ DÙNG THỬ.

🎯 Quyền dùng thử:
- 20 bài tập miễn phí cho bé
- Trong vòng 14 ngày kể từ hôm nay
(Hết một trong hai điều kiện trên là hết hạn dùng thử)

🔗 Đăng nhập tại: https://vui-hoc-toan.vercel.app
   Tip: bấm "Đăng nhập với Google" cho nhanh, không cần nhớ mật khẩu.

✨ Đợt cập nhật mới:
- Đăng nhập nhanh bằng Google (1 chạm)
- Kho hàng nghìn câu hỏi sẵn (Cánh Diều + Kết Nối Tri Thức, lớp 3-5)
- Đề luyện chuẩn SGK theo bộ sách bé đang học

📞 Khi hết dùng thử, nếu ba/mẹ muốn bé học tiếp, vui lòng liên hệ:
- Zalo: 0949908210
- Email: chinhpv@gmail.com

Cám ơn ba/mẹ đã đồng hành cùng Toán Vui.
— Team Toán Vui`;

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
  const [body, setBody] = useState(DEFAULT_BODY);
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
          is_html: false,
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
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Nội dung (plain text — xuống dòng giữ nguyên)
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={14}
            className="w-full px-3 py-2 rounded-lg border border-gray-200 outline-none focus:border-primary-500 text-sm"
          />
        </div>

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
