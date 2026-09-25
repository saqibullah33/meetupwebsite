"use client";

import Link from "next/link";
import { useVoteTallies } from "@/hooks/useVoteTallies";
import { LEADERBOARD_SIZE } from "@/lib/constants";
import type { ProjectWithMeta } from "@/lib/types";

type LeaderboardListProps = {
  initialProjects: ProjectWithMeta[];
};

export function LeaderboardList({ initialProjects }: LeaderboardListProps) {
  const ranked = useVoteTallies(initialProjects).slice(0, LEADERBOARD_SIZE);

  if (ranked.length === 0) {
    return (
      <p className="card px-6 py-16 text-center text-mute">
        The leaderboard will appear once projects are submitted.
      </p>
    );
  }

  return (
    <ol className="space-y-3">
      {ranked.map((project, index) => (
        <li key={project.id}>
          <Link
            href={`/projects/${project.id}`}
            className="card flex items-center gap-4 px-4 py-4"
          >
            <span
              className={`w-10 text-[32px] font-semibold tracking-tight ${
                index === 0 ? "text-ink" : "text-mute"
              }`}
            >
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-base font-semibold tracking-tight text-ink">
                {project.title}
              </p>
              <p className="truncate text-sm text-mute">
                {project.owner_name} · {project.category}
              </p>
            </div>
            <p className="shrink-0 text-sm text-ink">
              {project.vote_count} {project.vote_count === 1 ? "vote" : "votes"}
            </p>
          </Link>
        </li>
      ))}
    </ol>
  );
}
