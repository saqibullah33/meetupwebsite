"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { sortProjects } from "@/lib/voting";
import type { ProjectWithMeta } from "@/lib/types";

type TallyRow = {
  project_id: string;
  vote_count: number;
};

export function useVoteTallies(initialProjects: ProjectWithMeta[]) {
  const [projects, setProjects] = useState(initialProjects);
  const projectIds = initialProjects.map((project) => project.id).join("|");

  useEffect(() => {
    setProjects(initialProjects);
    // Only reset when the set of projects changes, not when the caller
    // passes a new array instance on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectIds]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("vote-tallies")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "vote_tallies" },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const removed = payload.old as Partial<TallyRow>;
            if (!removed.project_id) return;
            setProjects((current) =>
              current.filter((project) => project.id !== removed.project_id),
            );
            return;
          }

          const next = payload.new as TallyRow;
          if (!next.project_id) return;

          setProjects((current) =>
            current.map((project) =>
              project.id === next.project_id
                ? { ...project, vote_count: next.vote_count }
                : project,
            ),
          );
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  return useMemo(() => sortProjects(projects), [projects]);
}
