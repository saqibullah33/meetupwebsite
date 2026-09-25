export const CATEGORIES = [
  "AI",
  "Web",
  "Mobile",
  "Data",
  "DevTools",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type VotingStatus = "OPEN" | "CLOSED";

export type Profile = {
  id: string;
  name: string;
  email: string;
  created_at: string;
  updated_at: string;
};

export type Project = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  live_url: string;
  category: Category;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type VoteTally = {
  project_id: string;
  vote_count: number;
};

export type Vote = {
  id: string;
  voter_id: string;
  project_id: string;
  created_at: string;
};

export type ProjectWithMeta = Project & {
  owner_name: string;
  vote_count: number;
};

export type EventSettings = {
  id: number;
  voting_status: VotingStatus;
  updated_at: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          name: string;
          email: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: Project;
        Insert: {
          id?: string;
          owner_id: string;
          title: string;
          description: string;
          live_url: string;
          category: Category;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          title?: string;
          description?: string;
          live_url?: string;
          category?: Category;
          image_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: Vote;
        Insert: {
          id?: string;
          voter_id: string;
          project_id: string;
          created_at?: string;
        };
        Update: never;
        Relationships: [
          {
            foreignKeyName: "votes_voter_id_fkey";
            columns: ["voter_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      vote_tallies: {
        Row: VoteTally;
        Insert: never;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "vote_tallies_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: true;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      event_settings: {
        Row: EventSettings;
        Insert: never;
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      cast_vote: {
        Args: { p_project_id: string };
        Returns: undefined;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
