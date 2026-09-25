import { ProjectsBoard } from "@/components/ProjectsBoard";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getCurrentUser,
  getEventSettings,
  getMyVote,
  getProjectsWithMeta,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  if (!isSupabaseConfigured()) {
    return (
      <p className="text-body">
        Add your Supabase keys to load the public project list.
      </p>
    );
  }

  const [projects, settings, user] = await Promise.all([
    getProjectsWithMeta(),
    getEventSettings(),
    getCurrentUser(),
  ]);

  const myVote = user ? await getMyVote(user.id) : null;

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Public showcase</p>
        <h1 className="heading-lg mt-2">Projects</h1>
        <p className="mt-3 max-w-2xl text-sm text-body">
          Highest votes first. Ties stay stable by earliest submission. One vote
          per participant — not for your own project.
        </p>
      </div>
      <ProjectsBoard
        initialProjects={projects}
        currentUserId={user?.id ?? null}
        initialVotedProjectId={myVote?.project_id ?? null}
        votingStatus={settings.voting_status}
      />
    </div>
  );
}
