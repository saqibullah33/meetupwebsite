import type { ProjectWithMeta } from "@/lib/types";

export function sortProjects(projects: ProjectWithMeta[]): ProjectWithMeta[] {
  return [...projects].sort((a, b) => {
    if (b.vote_count !== a.vote_count) {
      return b.vote_count - a.vote_count;
    }
    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
  });
}

export function mapVoteError(message: string) {
  const lower = message.toLowerCase();

  if (lower.includes("not authenticated")) {
    return "Please log in to vote.";
  }
  if (lower.includes("voting is closed")) {
    return "Voting is closed.";
  }
  if (lower.includes("own project")) {
    return "You cannot vote for your own project.";
  }
  if (lower.includes("project not found")) {
    return "That project is no longer available.";
  }
  if (
    lower.includes("duplicate") ||
    lower.includes("unique") ||
    lower.includes("votes_voter_id")
  ) {
    return "You have already voted.";
  }

  return message || "Unable to submit your vote.";
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
