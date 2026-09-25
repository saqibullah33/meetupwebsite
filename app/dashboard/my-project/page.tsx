import Link from "next/link";
import { redirect } from "next/navigation";
import { DeleteProjectDialog } from "@/components/DeleteProjectDialog";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser, getMyProject } from "@/lib/queries";

export default async function MyProjectPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-body">Supabase is not configured.</p>;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/my-project");
  }

  const project = await getMyProject(user.id);
  if (!project) {
    redirect("/dashboard/my-project/new");
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-link">
        ← Dashboard
      </Link>
      <article className="card overflow-hidden">
        {project.image_url ? (
          <div className="h-56 bg-hairline-soft">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={project.image_url}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="space-y-4 p-6 sm:p-8">
          <p className="eyebrow">{project.category}</p>
          <h1 className="heading-lg">{project.title}</h1>
          <p className="max-w-2xl text-base leading-6 text-body">
            {project.description}
          </p>
          <p className="text-sm text-ink">Votes: {project.vote_count}</p>
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex text-sm text-link"
          >
            {project.live_url}
          </a>
          <div className="flex flex-wrap gap-2 pt-2">
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
      </article>
    </div>
  );
}
