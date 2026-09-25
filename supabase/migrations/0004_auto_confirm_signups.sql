create or replace function public.auto_confirm_user()
returns trigger
language plpgsql
security definer
set search_path = auth, public
as $$
begin
  new.email_confirmed_at := coalesce(new.email_confirmed_at, now());
  return new;
end;
$$;

drop trigger if exists auto_confirm_user on auth.users;
create trigger auto_confirm_user
  before insert on auth.users
  for each row execute function public.auto_confirm_user();

update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email_confirmed_at is null;

revoke all on function public.auto_confirm_user() from public, anon, authenticated;

insert into public.profiles (id, email, full_name, name)
select
  u.id,
  coalesce(u.email, ''),
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', ''),
  coalesce(
    nullif(trim(u.raw_user_meta_data ->> 'name'), ''),
    nullif(trim(u.raw_user_meta_data ->> 'full_name'), ''),
    split_part(coalesce(u.email, ''), '@', 1),
    'Participant'
  )
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null;
