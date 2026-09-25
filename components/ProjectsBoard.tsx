"use client";

import { useState } from "react";
import { ProjectCard } from "@/components/ProjectCard";
import { useVoteTallies } from "@/hooks/useVoteTallies";
import type { ProjectWithMeta, VotingStatus } from "@/lib/types";

type ProjectsBoardProps = {
  initialProjects: ProjectWithMeta[];
  currentUserId: string | null;
  initialVotedProjectId: string | null;
  votingStatus: VotingStatus;
};

export function ProjectsBoard({
  initialProjects,
  currentUserId,
  initialVotedProjectId,
  votingStatus,
}: ProjectsBoardProps) {
  const projects = useVoteTallies(initialProjects);
  const [votedProjectId, setVotedProjectId] = useState(initialVotedProjectId);

  if (projects.length === 0) {
    return (
      <p className="card px-6 py-16 text-center text-mute">
        No projects have been submitted yet.
      </p>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          currentUserId={currentUserId}
          votedProjectId={votedProjectId}
          votingStatus={votingStatus}
          onVoted={setVotedProjectId}
        />
      ))}
    </div>
  );
}
