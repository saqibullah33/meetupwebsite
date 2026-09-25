"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { STORAGE_BUCKET } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";

type DeleteProjectDialogProps = {
  projectId: string;
  imageUrl?: string | null;
  ownerId: string;
};

export function DeleteProjectDialog({
  projectId,
  imageUrl,
  ownerId,
}: DeleteProjectDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function handleDelete() {
    setPending(true);
    setError("");

    try {
      const supabase = createClient();
      const { error: deleteError } = await supabase
        .from("projects")
        .delete()
        .eq("id", projectId);

      if (deleteError) {
        throw deleteError;
      }

      if (imageUrl) {
        const marker = `/${STORAGE_BUCKET}/`;
        const index = imageUrl.indexOf(marker);
        if (index !== -1) {
          const path = imageUrl.slice(index + marker.length);
          if (path.startsWith(`${ownerId}/`)) {
            await supabase.storage.from(STORAGE_BUCKET).remove([path]);
          }
        }
      }

      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-danger">
        Delete
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-project-title"
            className="card w-full max-w-md p-6 shadow-[0px_2px_2px_rgba(0,0,0,0.04),0px_8px_16px_-4px_rgba(0,0,0,0.08)]"
          >
            <h2 id="delete-project-title" className="heading-md">
              Delete project
            </h2>
            <p className="mt-3 text-sm leading-5 text-body">
              Are you sure you want to delete your project?
            </p>
            {error ? <p className="mt-3 text-sm text-error">{error}</p> : null}
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="btn-ghost"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={pending}
                className="btn-app"
              >
                {pending ? "Deleting…" : "Delete project"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
