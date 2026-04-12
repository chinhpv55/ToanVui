import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Toán Vui 3 - Luyện Toán Lớp 3",
  description:
    "Web app luyện Toán lớp 3 thông minh theo SGK Cánh Diều. Sinh bài tập AI, tự điều chỉnh độ khó, giải thích lỗi sai cho bé.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
