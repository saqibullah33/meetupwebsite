import Link from "next/link";
import { redirect } from "next/navigation";
import { CertificateDownload } from "@/components/CertificateDownload";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { SHOW_CERTIFICATE } from "@/lib/constants";
import { getCurrentUser, getMyProject, getMyVote } from "@/lib/queries";

export default async function DashboardPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-body">Supabase is not configured.</p>;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const [project, vote] = await Promise.all([
    getMyProject(user.id),
    getMyVote(user.id),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <p className="eyebrow">Participant</p>
        <h1 className="heading-lg mt-2">Dashboard</h1>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="card p-8">
          <h2 className="heading-md">My Project</h2>
          {project ? (
            <div className="mt-4 space-y-3">
              <p className="text-base font-medium text-ink">{project.title}</p>
              <p className="text-sm text-mute">Category: {project.category}</p>
              <p className="text-sm text-ink">Votes: {project.vote_count}</p>
              <div className="flex flex-wrap gap-2 pt-2">
                <Link href="/dashboard/my-project" className="btn-ghost">
                  View
                </Link>
                <Link href="/dashboard/my-project/edit" className="btn-ghost">
                  Edit
                </Link>
                <DeleteProjectDialog
                  projectId={project.id}
                  imageUrl={project.image_url}
                  ownerId={project.owner_id}
                />
              </div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-body">
                You have not submitted a project yet.
              </p>
              <Link href="/dashboard/my-project/new" className="btn-app">
                Create project
              </Link>
            </div>
          )}
        </section>

        <section className="card p-8">
          <h2 className="heading-md">Voting Status</h2>
          {vote ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-link">You have voted</p>
              <p className="text-sm text-mute">You voted for:</p>
              <p className="text-ink">{vote.project_title}</p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <p className="text-sm text-body">You haven&apos;t voted yet.</p>
              <Link href="/projects" className="text-sm text-link">
                Go to Projects → Vote
              </Link>
            </div>
          )}
        </section>
      </div>

      {SHOW_CERTIFICATE ? (
        <CertificateDownload
          defaultName={
            typeof user.user_metadata?.name === "string"
              ? user.user_metadata.name
              : ""
          }
        />
      ) : null}
    </div>
  );
}
