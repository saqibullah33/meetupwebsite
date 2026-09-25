import { isSupabaseConfigured } from "@/lib/supabase/env";

export function SetupBanner() {
  if (isSupabaseConfigured()) {
    return null;
  }

  return (
    <div className="border-b border-hairline bg-link-soft px-6 py-2 text-center text-sm text-ink">
      Supabase is not configured yet. Copy{" "}
      <code className="font-mono text-xs">.env.local.example</code> to{" "}
      <code className="font-mono text-xs">.env.local</code> and add your project
      keys.
    </div>
  );
}
