import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: account } = await supabase
    .from("user_accounts")
    .select("is_admin")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!account?.is_admin) {
    redirect("/home");
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="font-extrabold text-xl text-primary-700">
              🛠️ Admin
            </Link>
            <nav className="flex gap-4 text-sm">
              <Link href="/admin" className="text-gray-700 hover:text-primary-600 font-medium">
                Người dùng
              </Link>
              <Link href="/admin/bank" className="text-gray-700 hover:text-primary-600 font-medium">
                Kho bài tập
              </Link>
              <Link href="/admin/notify" className="text-gray-700 hover:text-primary-600 font-medium">
                Gửi mail
              </Link>
              <Link href="/home" className="text-gray-500 hover:text-gray-700">
                ← Về app
              </Link>
            </nav>
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-6">{children}</main>
    </div>
  );
}
