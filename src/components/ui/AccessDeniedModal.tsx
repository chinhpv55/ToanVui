"use client";

interface AccessDeniedModalProps {
  open: boolean;
  title: string;
  message: string;
  contactZalo: string;
  contactEmail: string;
  onClose?: () => void;
}

export default function AccessDeniedModal({
  open,
  title,
  message,
  contactZalo,
  contactEmail,
  onClose,
}: AccessDeniedModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-accent-100 flex items-center justify-center text-2xl">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        </div>

        <p className="text-gray-700 leading-relaxed">{message}</p>

        <div className="bg-primary-50 border border-primary-200 rounded-xl p-4 space-y-2">
          <div className="text-sm font-semibold text-primary-800">
            Liên hệ admin để kích hoạt
          </div>
          <a
            href={`https://zalo.me/${contactZalo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium"
          >
            <span>💬</span>
            <span>Zalo: {contactZalo}</span>
          </a>
          <a
            href={`mailto:${contactEmail}`}
            className="flex items-center gap-2 text-primary-700 hover:text-primary-900 font-medium"
          >
            <span>✉️</span>
            <span>{contactEmail}</span>
          </a>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          {onClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition"
            >
              Đóng
            </button>
          )}
          <a
            href="/home"
            className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium transition"
          >
            Về trang chủ
          </a>
        </div>
      </div>
    </div>
  );
}
