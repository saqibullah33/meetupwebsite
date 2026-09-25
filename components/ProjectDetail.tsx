"use client";

import { useMemo, useState } from "react";
import { VoteButton } from "@/components/VoteButton";
import { useVoteTallies } from "@/hooks/useVoteTallies";
import type { ProjectWithMeta, VotingStatus } from "@/lib/types";

type ProjectDetailProps = {
  project: ProjectWithMeta;
  currentUserId: string | null;
  initialVotedProjectId: string | null;
  votingStatus: VotingStatus;
};

export function ProjectDetail({
  project,
  currentUserId,
  initialVotedProjectId,
  votingStatus,
}: ProjectDetailProps) {
  const initialProjects = useMemo(() => [project], [project]);
  const live = useVoteTallies(initialProjects)[0] ?? project;
  const [votedProjectId, setVotedProjectId] = useState(initialVotedProjectId);

  return (
    <article className="card overflow-hidden">
      {live.image_url ? (
        <div className="h-64 bg-hairline-soft sm:h-80">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={live.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}
      <div className="space-y-5 p-6 sm:p-8">
        <p className="eyebrow">{live.category}</p>
        <h1 className="heading-lg">{live.title}</h1>
        <p className="text-sm text-mute">by {live.owner_name}</p>
        <p className="max-w-2xl text-base leading-6 text-body">
          {live.description}
        </p>
        <p className="text-sm text-ink">
          {live.vote_count} {live.vote_count === 1 ? "vote" : "votes"}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href={live.live_url}
            target="_blank"
            rel="noreferrer"
            className="btn-pill"
          >
            Open live demo
          </a>
          <VoteButton
            projectId={live.id}
            isOwnProject={currentUserId === live.owner_id}
            hasVoted={Boolean(votedProjectId)}
            votedForThis={votedProjectId === live.id}
            isLoggedIn={Boolean(currentUserId)}
            votingStatus={votingStatus}
            onVoted={setVotedProjectId}
          />
        </div>
      </div>
    </article>
  );
}
