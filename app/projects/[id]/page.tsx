import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/ProjectDetail";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import {
  getCurrentUser,
  getEventSettings,
  getMyVote,
  getProjectById,
} from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!isSupabaseConfigured()) {
    return <p className="text-body">Supabase is not configured.</p>;
  }

  const { id } = await params;
  const [project, settings, user] = await Promise.all([
    getProjectById(id),
    getEventSettings(),
    getCurrentUser(),
  ]);

  if (!project) {
    notFound();
  }

  const myVote = user ? await getMyVote(user.id) : null;

  return (
    <div className="space-y-6">
      <Link href="/projects" className="text-sm text-link">
        ← All projects
      </Link>
      <ProjectDetail
        project={project}
        currentUserId={user?.id ?? null}
        initialVotedProjectId={myVote?.project_id ?? null}
        votingStatus={settings.voting_status}
      />
    </div>
  );
}
