"use client";

import Link from "next/link";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📊</span>
            <span className="font-extrabold text-primary-600 text-lg">
              Báo cáo phụ huynh
            </span>
          </div>
          <Link
            href="/home"
            className="text-sm text-primary-600 font-semibold hover:underline"
          >
            Quay lại app bé
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
