-- Meetup project voting platform
-- Organizer voting toggle (run in the SQL editor):
--   UPDATE event_settings SET voting_status = 'CLOSED' WHERE id = 1;
--   UPDATE event_settings SET voting_status = 'OPEN' WHERE id = 1;

-- ---------------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 80),
  email text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references public.profiles (id) on delete cascade,
  title text not null check (char_length(trim(title)) between 1 and 100),
  description text not null check (char_length(trim(description)) between 1 and 500),
  live_url text not null check (live_url ~* '^https?://'),
  category text not null check (category in ('AI', 'Web', 'Mobile', 'Data', 'DevTools', 'Other')),
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.votes (
  id uuid primary key default gen_random_uuid(),
  voter_id uuid not null unique references public.profiles (id) on delete cascade,
  project_id uuid not null references public.projects (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.event_settings (
  id integer primary key default 1 check (id = 1),
  voting_status text not null default 'OPEN' check (voting_status in ('OPEN', 'CLOSED')),
  updated_at timestamptz not null default now()
);

create table public.vote_tallies (
  project_id uuid primary key references public.projects (id) on delete cascade,
  vote_count integer not null default 0 check (vote_count >= 0)
);

insert into public.event_settings (id, voting_status) values (1, 'OPEN');

create index votes_project_id_idx on public.votes (project_id);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger event_settings_set_updated_at
  before update on public.event_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Auth → profile
-- ---------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'name'), ''), split_part(new.email, '@', 1)),
    coalesce(new.email, '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Project protections
-- ---------------------------------------------------------------------------

create or replace function public.protect_project_immutable_fields()
returns trigger
language plpgsql
as $$
begin
  if new.owner_id is distinct from old.owner_id then
    raise exception 'Cannot change project owner';
  end if;
  if new.created_at is distinct from old.created_at then
    raise exception 'Cannot change created_at';
  end if;
  new.updated_at = now();
  return new;
end;
$$;

create trigger protect_project_immutable_fields
  before update on public.projects
  for each row execute function public.protect_project_immutable_fields();

-- ---------------------------------------------------------------------------
-- Vote tallies (trigger-maintained; users cannot write these)
-- ---------------------------------------------------------------------------

create or replace function public.init_vote_tally()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.vote_tallies (project_id, vote_count)
  values (new.id, 0);
  return new;
end;
$$;

create trigger on_project_created_tally
  after insert on public.projects
  for each row execute function public.init_vote_tally();

create or replace function public.increment_vote_tally()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.vote_tallies
  set vote_count = vote_count + 1
  where project_id = new.project_id;
  return new;
end;
$$;

create trigger on_vote_inserted_tally
  after insert on public.votes
  for each row execute function public.increment_vote_tally();

create or replace function public.decrement_vote_tally()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.vote_tallies
  set vote_count = greatest(vote_count - 1, 0)
  where project_id = old.project_id;
  return old;
end;
$$;

create trigger on_vote_deleted_tally
  after delete on public.votes
  for each row execute function public.decrement_vote_tally();

-- ---------------------------------------------------------------------------
-- Vote validation (backup even if RPC is bypassed)
-- ---------------------------------------------------------------------------

create or replace function public.validate_vote()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  if new.voter_id is distinct from auth.uid() then
    raise exception 'Cannot create a vote for another user';
  end if;

  select voting_status into v_status from public.event_settings where id = 1;
  if v_status is distinct from 'OPEN' then
    raise exception 'Voting is closed';
  end if;

  select owner_id into v_owner from public.projects where id = new.project_id;
  if v_owner is null then
    raise exception 'Project not found';
  end if;

  if v_owner = new.voter_id then
    raise exception 'Cannot vote for your own project';
  end if;

  return new;
end;
$$;

create trigger validate_vote_before_insert
  before insert on public.votes
  for each row execute function public.validate_vote();

-- ---------------------------------------------------------------------------
-- Atomic voting RPC
-- ---------------------------------------------------------------------------

create or replace function public.cast_vote(p_project_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_status text;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  select voting_status into v_status from public.event_settings where id = 1;
  if v_status is distinct from 'OPEN' then
    raise exception 'Voting is closed';
  end if;

  select owner_id into v_owner from public.projects where id = p_project_id;
  if v_owner is null then
    raise exception 'Project not found';
  end if;

  if v_owner = auth.uid() then
    raise exception 'Cannot vote for your own project';
  end if;

  insert into public.votes (voter_id, project_id)
  values (auth.uid(), p_project_id);
end;
$$;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.votes enable row level security;
alter table public.vote_tallies enable row level security;
alter table public.event_settings enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Projects are viewable by everyone"
  on public.projects for select
  using (true);

create policy "Users can create their own project"
  on public.projects for insert
  to authenticated
  with check (auth.uid() = owner_id);

create policy "Users can update their own project"
  on public.projects for update
  to authenticated
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "Users can delete their own project"
  on public.projects for delete
  to authenticated
  using (auth.uid() = owner_id);

create policy "Users can read their own vote"
  on public.votes for select
  to authenticated
  using (auth.uid() = voter_id);

create policy "Users can insert their own vote"
  on public.votes for insert
  to authenticated
  with check (auth.uid() = voter_id);

create policy "Vote tallies are viewable by everyone"
  on public.vote_tallies for select
  using (true);

create policy "Event settings are viewable by everyone"
  on public.event_settings for select
  using (true);

-- ---------------------------------------------------------------------------
-- Grants (users cannot write tallies, settings, or vote counts)
-- ---------------------------------------------------------------------------

revoke all on public.profiles from anon, authenticated;
revoke all on public.projects from anon, authenticated;
revoke all on public.votes from anon, authenticated;
revoke all on public.vote_tallies from anon, authenticated;
revoke all on public.event_settings from anon, authenticated;

grant select on public.profiles to anon, authenticated;
grant update (name) on public.profiles to authenticated;

grant select on public.projects to anon, authenticated;
grant insert on public.projects to authenticated;
grant update (title, description, live_url, category, image_url) on public.projects to authenticated;
grant delete on public.projects to authenticated;

grant select, insert on public.votes to authenticated;

grant select on public.vote_tallies to anon, authenticated;
grant select on public.event_settings to anon, authenticated;

grant execute on function public.cast_vote(uuid) to authenticated;
revoke execute on function public.cast_vote(uuid) from anon, public;

-- ---------------------------------------------------------------------------
-- Realtime (counts only — never broadcast raw votes / voter_id)
-- ---------------------------------------------------------------------------

alter table public.vote_tallies replica identity full;
alter publication supabase_realtime add table public.vote_tallies;

-- ---------------------------------------------------------------------------
-- Storage: optional project images
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'project-images',
  'project-images',
  true,
  2097152,
  array['image/png', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "Public can read project images"
  on storage.objects for select
  using (bucket_id = 'project-images');

create policy "Users can upload their project images"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update their project images"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  )
  with check (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete their project images"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'project-images'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
