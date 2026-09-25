import Link from "next/link";
import { redirect } from "next/navigation";
import { ProjectForm } from "@/components/ProjectForm";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getCurrentUser, getMyProject } from "@/lib/queries";

export default async function NewProjectPage() {
  if (!isSupabaseConfigured()) {
    return <p className="text-body">Supabase is not configured.</p>;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard/my-project/new");
  }

  const existing = await getMyProject(user.id);
  if (existing) {
    redirect("/dashboard/my-project");
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard" className="text-sm text-link">
        ← Dashboard
      </Link>
      <div>
        <h1 className="heading-lg">Submit your project</h1>
        <p className="mt-2 text-sm text-body">
          One project per account. You can edit it later.
        </p>
      </div>
      <ProjectForm mode="create" userId={user.id} />
    </div>
  );
}
