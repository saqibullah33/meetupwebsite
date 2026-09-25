import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser, getMyProject } from "@/lib/queries";

export default async function EditProjectPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-body">Supabase is not configured.</p>;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/my-project/edit");
  }

  const project = await getMyProject(user.id);
  if (!project) {
    redirect("/dashboard/my-project/new");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <Link href="/dashboard/my-project" className="text-sm text-link">
          ← My project
        </Link>
        <p className="eyebrow mt-6">My project</p>
        <h1 className="heading-lg mt-2">Edit project</h1>
        <p className="mt-2 text-sm text-body">
          You can change the public details, not the owner or vote count.
        </p>
      </div>
      <ProjectForm mode="edit" userId={user.id} project={project} />
    </div>
  );
}
