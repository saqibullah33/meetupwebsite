import { createClient } from "@/lib/supabase/server";
import { sortProjects } from "@/lib/voting";
import type {
  Category,
  EventSettings,
  Project,
  ProjectWithMeta,
  VotingStatus,
} from "@/lib/types";

type ProjectJoinRow = Project & {
  profiles: { name: string } | { name: string }[] | null;
  vote_tallies: { vote_count: number } | { vote_count: number }[] | null;
};

function firstRel<T>(value: T | T[] | null | undefined): T | null {
  if (!value) return null;
  return Array.isArray(value) ? (value[0] ?? null) : value;
}

function toProjectWithMeta(row: ProjectJoinRow): ProjectWithMeta {
  const { profiles, vote_tallies, ...project } = row;
  return {
    ...project,
    category: project.category as Category,
    owner_name: firstRel(profiles)?.name ?? "Participant",
    vote_count: firstRel(vote_tallies)?.vote_count ?? 0,
  };
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function getEventSettings(): Promise<EventSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_settings")
    .select("*")
    .eq("id", 1)
    .single();

  if (error || !data) {
    return {
      id: 1,
      voting_status: "OPEN" as VotingStatus,
      updated_at: new Date().toISOString(),
    };
  }

  return data;
}

export async function getProjectsWithMeta(): Promise<ProjectWithMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles!projects_owner_id_fkey(name), vote_tallies(vote_count)");

  if (error || !data) {
    return [];
  }

  return sortProjects((data as ProjectJoinRow[]).map(toProjectWithMeta));
}

export async function getProjectById(
  id: string,
): Promise<ProjectWithMeta | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, profiles!projects_owner_id_fkey(name), vote_tallies(vote_count)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return toProjectWithMeta(data as ProjectJoinRow);
}

export async function getMyProject(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, vote_tallies(vote_count)")
    .eq("owner_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const row = data as Project & {
    vote_tallies: { vote_count: number } | { vote_count: number }[] | null;
  };
  const { vote_tallies, ...project } = row;

  return {
    ...project,
    vote_count: firstRel(vote_tallies)?.vote_count ?? 0,
  };
}

export async function getMyVote(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("votes")
    .select("project_id, projects(title)")
    .eq("voter_id", userId)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const projectRel = firstRel(
    data.projects as { title: string } | { title: string }[] | null,
  );

  return {
    project_id: data.project_id,
    project_title: projectRel?.title ?? "a project",
  };
}
