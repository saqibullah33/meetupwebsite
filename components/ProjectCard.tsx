import Link from "next/link";
import { VoteButton } from "@/components/VoteButton";
import type { ProjectWithMeta, VotingStatus } from "@/lib/types";

type ProjectCardProps = {
  project: ProjectWithMeta;
  currentUserId: string | null;
  votedProjectId: string | null;
  votingStatus: VotingStatus;
  onVoted?: (projectId: string) => void;
};

export function ProjectCard({
  project,
  currentUserId,
  votedProjectId,
  votingStatus,
  onVoted,
}: ProjectCardProps) {
  const isOwnProject = currentUserId === project.owner_id;
  const hasVoted = Boolean(votedProjectId);

  return (
    <article className="card flex h-full flex-col overflow-hidden">
      {project.image_url ? (
        <div className="h-40 overflow-hidden bg-hairline-soft">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-40 items-center justify-center bg-hairline-soft text-4xl font-semibold tracking-tight text-faint">
          {project.title.slice(0, 1).toUpperCase()}
        </div>
      )}
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h2 className="heading-md">{project.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-5 text-body">
            {project.description}
          </p>
        </div>
        <p className="eyebrow">{project.category}</p>
        <p className="text-sm text-mute">by {project.owner_name}</p>
        <p className="text-sm text-ink">
          {project.vote_count} {project.vote_count === 1 ? "vote" : "votes"}
        </p>
        <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
          <Link href={`/projects/${project.id}`} className="btn-ghost">
            View Project
          </Link>
          <a
            href={project.live_url}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost"
          >
            Live demo
          </a>
          <VoteButton
            projectId={project.id}
            isOwnProject={isOwnProject}
            hasVoted={hasVoted}
            votedForThis={votedProjectId === project.id}
            isLoggedIn={Boolean(currentUserId)}
            votingStatus={votingStatus}
            onVoted={onVoted}
          />
        </div>
      </div>
    </article>
  );
}
