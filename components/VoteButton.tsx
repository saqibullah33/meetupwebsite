"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { mapVoteError } from "@/lib/voting";
import type { VotingStatus } from "@/lib/types";

type VoteButtonProps = {
  projectId: string;
  isOwnProject: boolean;
  hasVoted: boolean;
  votedForThis: boolean;
  isLoggedIn: boolean;
  votingStatus: VotingStatus;
  onVoted?: (projectId: string) => void;
};

export function VoteButton({
  projectId,
  isOwnProject,
  hasVoted,
  votedForThis,
  isLoggedIn,
  votingStatus,
  onVoted,
}: VoteButtonProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (votingStatus === "CLOSED") {
    return <StatusChip>Voting Closed</StatusChip>;
  }

  if (isOwnProject) {
    return <StatusChip>Your Project</StatusChip>;
  }

  if (!isLoggedIn) {
    return (
      <div className="flex flex-col items-start gap-1">
        <Link href="/login?next=/projects&reason=vote" className="btn-app">
          Vote
        </Link>
        <p className="text-xs text-mute">Please log in to vote.</p>
      </div>
    );
  }

  if (hasVoted) {
    return (
      <StatusChip tone={votedForThis ? "success" : "muted"}>
        {votedForThis ? "Vote submitted" : "Already voted"}
      </StatusChip>
    );
  }

  async function handleVote() {
    setPending(true);
    setError(null);
    try {
      const supabase = createClient();
      const { error: voteError } = await supabase.rpc("cast_vote", {
        p_project_id: projectId,
      });
      if (voteError) {
        throw new Error(mapVoteError(voteError.message));
      }
      onVoted?.(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to vote.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={handleVote}
        disabled={pending}
        className="btn-app"
      >
        {pending ? "Voting…" : "Vote"}
      </button>
      {error ? <p className="text-xs text-error">{error}</p> : null}
    </div>
  );
}

function StatusChip({
  children,
  tone = "muted",
}: {
  children: React.ReactNode;
  tone?: "muted" | "success";
}) {
  return (
    <span
      className={`chip ${tone === "success" ? "text-link" : "text-mute"}`}
    >
      {children}
    </span>
  );
}
