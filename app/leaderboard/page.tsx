import { LeaderboardList } from "@/components/LeaderboardList";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getProjectsWithMeta } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-body">Add your Supabase keys to load rankings.</p>;
  }

  const projects = await getProjectsWithMeta();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <p className="eyebrow">Live ranking</p>
        <h1 className="heading-lg mt-2">Project leaderboard</h1>
        <p className="mt-3 text-sm text-body">
          Top 5 projects by participant votes. Updates in real time.
        </p>
      </div>
      <LeaderboardList initialProjects={projects} />
    </div>
  );
}
