import Link from "next/link";
import { LogoutButton } from "@/components/LogoutButton";
import { MEETUP_SHORT } from "@/lib/brand";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export async function Navbar() {
  let user = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;
    } catch {
      user = null;
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3 px-6 py-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-ink">
          {MEETUP_SHORT}
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm">
          <Link href="/projects" className="rounded-full px-3 py-1.5 text-body">
            Projects
          </Link>
          <Link
            href="/leaderboard"
            className="rounded-full px-3 py-1.5 text-body"
          >
            Leaderboard
          </Link>
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="rounded-full px-3 py-1.5 text-body"
              >
                Dashboard
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                Log In
              </Link>
              <Link href="/signup" className="btn-app">
                Sign Up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
