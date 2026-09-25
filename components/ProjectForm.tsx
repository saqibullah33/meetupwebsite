"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DESCRIPTION_MAX,
  IMAGE_MAX_BYTES,
  IMAGE_TYPES,
  STORAGE_BUCKET,
  TITLE_MAX,
} from "@/lib/constants";
import { CATEGORIES, type Category, type Project } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import { isValidHttpUrl } from "@/lib/voting";

type ProjectFormProps = {
  mode: "create" | "edit";
  userId: string;
  project?: Project;
};

export function ProjectForm({ mode, userId, project }: ProjectFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(project?.title ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [liveUrl, setLiveUrl] = useState(project?.live_url ?? "");
  const [category, setCategory] = useState<Category | "">(project?.category ?? "");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function uploadImage(file: File) {
    if (!IMAGE_TYPES.includes(file.type as (typeof IMAGE_TYPES)[number])) {
      throw new Error("Image must be a PNG, JPG, or WebP file.");
    }
    if (file.size > IMAGE_MAX_BYTES) {
      throw new Error("Image must be 2MB or smaller.");
    }

    const supabase = createClient();
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const path = `${userId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(path, file, { upsert: false });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();
    const trimmedUrl = liveUrl.trim();

    if (!trimmedTitle) {
      setError("Title is required.");
      return;
    }
    if (!trimmedDescription) {
      setError("Description is required.");
      return;
    }
    if (!category) {
      setError("Category is required.");
      return;
    }
    if (!isValidHttpUrl(trimmedUrl)) {
      setError("Live URL must be a valid http or https link.");
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      let imageUrl = project?.image_url ?? null;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }

      if (mode === "create") {
        const { error: insertError } = await supabase.from("projects").insert({
          owner_id: userId,
          title: trimmedTitle,
          description: trimmedDescription,
          live_url: trimmedUrl,
          category,
          image_url: imageUrl,
        });

        if (insertError) {
          if (insertError.message.toLowerCase().includes("unique")) {
            throw new Error("You already have a project on this account.");
          }
          throw insertError;
        }
      } else if (project) {
        const { error: updateError } = await supabase
          .from("projects")
          .update({
            title: trimmedTitle,
            description: trimmedDescription,
            live_url: trimmedUrl,
            category,
            image_url: imageUrl,
          })
          .eq("id", project.id);

        if (updateError) {
          throw updateError;
        }
      }

      router.push("/dashboard/my-project");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save project.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card mx-auto w-full max-w-2xl overflow-hidden"
    >
      <div className="space-y-6 p-6 sm:p-8">
        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Project title</span>
          <input
            required
            maxLength={TITLE_MAX}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            className="field font-normal"
          />
          <span className="block text-xs font-normal text-mute">
            {title.length}/{TITLE_MAX}
          </span>
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Brief description</span>
          <textarea
            required
            maxLength={DESCRIPTION_MAX}
            rows={5}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="field min-h-32 resize-y font-normal"
          />
          <span className="block text-xs font-normal text-mute">
            {description.length}/{DESCRIPTION_MAX}
          </span>
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Live project URL</span>
          <input
            required
            type="url"
            placeholder="https://"
            value={liveUrl}
            onChange={(event) => setLiveUrl(event.target.value)}
            className="field font-normal"
          />
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Category</span>
          <select
            required
            value={category}
            onChange={(event) => setCategory(event.target.value as Category)}
            className="field font-normal"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-2 text-sm font-medium text-ink">
          <span>Project image (optional)</span>
          <span className="file-field font-normal">
            <input
              type="file"
              accept={IMAGE_TYPES.join(",")}
              onChange={(event) => setImageFile(event.target.files?.[0] ?? null)}
              className="text-sm text-body file:mr-3 file:rounded-md file:border file:border-solid file:border-[#c9c9c9] file:bg-white file:px-3 file:py-1.5 file:text-ink"
            />
          </span>
          <span className="block text-xs font-normal text-mute">
            {imageFile
              ? imageFile.name
              : project?.image_url
                ? "Current image stays unless you choose a new file. PNG, JPG, or WebP. Max 2MB."
                : "PNG, JPG, or WebP. Max 2MB."}
          </span>
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}
      </div>

      <div className="flex items-center justify-end border-t border-[#d6d6d6] bg-[#fafafa] px-6 py-4 sm:px-8">
        <button type="submit" disabled={pending} className="btn-app min-w-32">
          {pending
            ? "Saving…"
            : mode === "create"
              ? "Submit Project"
              : "Save changes"}
        </button>
      </div>
    </form>
  );
}
