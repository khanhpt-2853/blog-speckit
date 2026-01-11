import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <Link href="/" className="text-xl font-bold">
              Microblog CMS
            </Link>

            <div className="flex items-center gap-4">
              <Link href="/" className="text-gray-600 hover:text-gray-900">
                Home
              </Link>

              {user ? (
                <>
                  <Link href="/posts/drafts" className="text-gray-600 hover:text-gray-900">
                    My Drafts
                  </Link>
                  <Link
                    href="/posts/new"
                    className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  >
                    Write
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button type="submit" className="text-gray-600 hover:text-gray-900">
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <Link
                  href="/login"
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>{children}</main>

      <footer className="mt-12 border-t bg-white">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <p className="text-center text-sm text-gray-600">
            © 2024 Microblog CMS. Built with Next.js and Supabase.
          </p>
        </div>
      </footer>
    </div>
  );
}
