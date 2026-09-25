alter function public.set_updated_at() set search_path = public;
alter function public.protect_project_immutable_fields() set search_path = public;

revoke all on function public.init_vote_tally() from public, anon, authenticated;
revoke all on function public.increment_vote_tally() from public, anon, authenticated;
revoke all on function public.decrement_vote_tally() from public, anon, authenticated;
revoke all on function public.validate_vote() from public, anon, authenticated;
revoke all on function public.handle_new_user() from public, anon, authenticated;

revoke all on public.votes from public, anon;
grant select, insert on public.votes to authenticated;
