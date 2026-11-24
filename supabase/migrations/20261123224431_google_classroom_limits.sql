create table public.google_usage(month date primary key,requests integer not null default 0 check(requests between 0 and 500));
alter table public.google_usage enable row level security;
revoke all on public.google_usage from anon,authenticated;
grant select,insert,update on public.google_usage to service_role;
create function public.consume_google_quota(amount integer default 1) returns boolean
language plpgsql security invoker set search_path=public as $$
declare used integer;
begin
 if amount < 1 or amount > 20 then return false; end if;
 insert into public.google_usage(month,requests) values(date_trunc('month',now() at time zone 'UTC')::date,amount)
 on conflict(month) do update set requests=google_usage.requests+excluded.requests where google_usage.requests+excluded.requests<=500
 returning requests into used;
 return used is not null;
end $$;
revoke execute on function public.consume_google_quota(integer) from public,anon,authenticated;
grant execute on function public.consume_google_quota(integer) to service_role;

-- Required by projects which disable automatic Data API table grants.
grant usage on schema public to authenticated, service_role;
grant select on public.places to authenticated;
grant select,insert,update,delete on public.profiles,public.cravings,public.saves,public.logs,public.rec_events to authenticated;
grant usage,select on sequence public.rec_events_id_seq to authenticated;
grant all on public.places,public.profiles,public.cravings,public.saves,public.logs,public.rec_events,public.api_usage to service_role;
grant usage,select on sequence public.rec_events_id_seq to service_role;
create index if not exists saves_place_id_idx on public.saves(place_id);
create index if not exists logs_place_id_idx on public.logs(place_id);
create index if not exists rec_events_user_id_idx on public.rec_events(user_id);
create index if not exists rec_events_place_id_idx on public.rec_events(place_id);
