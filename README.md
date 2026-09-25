# Supabase × Clerk × Devin Peshawar Meetup — Project Voting

A meetup project showcase where participants create an account, submit one project, and vote for another participant’s project. Rankings are decided entirely by participant votes — there is no admin or judge scoring.

The frontend is a Next.js app. **Supabase is the source of truth**: authentication, row-level security, atomic voting, and realtime tallies all live in the database.

## Features

- Sign up / log in / log out with Supabase Auth
- One project per participant (create, view, edit, delete)
- Optional project image upload
- Public project gallery and project detail pages
- One permanent vote per participant
- No self-voting (UI and database)
- Realtime vote counts and ranking
- Top 5 leaderboard
- Dashboard with project + voting status
- Voting `OPEN` / `CLOSED` enforced server-side

## Stack

- Next.js (App Router) + TypeScript + Tailwind CSS
- Supabase Auth, Postgres, RLS, Realtime, Storage

## 1. Create a Supabase project

1. Create a project at [supabase.com](https://supabase.com).
2. In **Authentication → Providers → Email**, keep email/password enabled.
3. Email confirmation is disabled for this meetup: a signup creates the Auth user and `profiles` row immediately, then the app signs them in. You do not need Confirm email turned on.

## 2. Run the database migration

In the Supabase SQL editor, paste and run:

[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql)

That script creates:

- `profiles`, `projects`, `votes`, `event_settings`, `vote_tallies`
- RLS policies
- `cast_vote(project_id)` RPC
- self-vote and voting-closed triggers
- the public `project-images` storage bucket
- Realtime on `vote_tallies` only (so voter identities are not broadcast)

## 3. Confirm Realtime

In **Database → Publications** (or **Realtime**), make sure `vote_tallies` is in the `supabase_realtime` publication.

## 4. Configure the app

```bash
cp .env.local.example .env.local
```

Set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Find these under **Project Settings → API**.

## 5. Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Deploy

Import this repo in [Vercel](https://vercel.com/new). Add the same two env vars as `.env.local.example`, then deploy. Do not commit real keys.

## Voting control

There is no organizer UI. Toggle voting in the SQL editor:

```sql
UPDATE event_settings SET voting_status = 'CLOSED' WHERE id = 1;
UPDATE event_settings SET voting_status = 'OPEN' WHERE id = 1;
```

When closed, existing counts stay visible, but new votes are rejected by the database.

## Security model

| Rule | Enforcement |
|---|---|
| One project per user | `UNIQUE(projects.owner_id)` + RLS |
| One vote per user | `UNIQUE(votes.voter_id)` |
| No self-vote | `cast_vote` RPC + insert trigger |
| Voting open/closed | `event_settings` + RPC + trigger |
| Own project only | RLS on update/delete |
| Vote counts | Trigger-maintained `vote_tallies`; users cannot write them |
| Race conditions | Atomic `INSERT` + unique voter constraint |

Do not treat hidden or disabled buttons as security. They are UX only.

## Routes

- `/` landing
- `/login`, `/signup`
- `/projects` public gallery
- `/projects/[id]` project detail
- `/leaderboard` top 5
- `/dashboard` my project + voting status
- `/dashboard/my-project` view / create / edit

## Categories

`AI`, `Web`, `Mobile`, `Data`, `DevTools`, `Other`
