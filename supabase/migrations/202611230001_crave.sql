-- Crave: user data is private, Google content is transient; only place IDs persist.
create extension if not exists postgis with schema extensions;
create table public.places (
 id text primary key,
 google_place_id text unique,
 source text not null default 'curated' check (source in ('curated','google')),
 name text, geo extensions.geography(Point,4326), price_level int,
 rating numeric, rating_count int, tags text[] default '{}', hours jsonb,
 fetched_at timestamptz default now(),
 check (source <> 'google' or (name is null and geo is null and hours is null))
);
create index places_geo on public.places using gist(geo);
create table public.profiles(user_id uuid primary key references auth.users on delete cascade,created_at timestamptz default now());
create table public.cravings(user_id uuid references auth.users on delete cascade,tag text not null,weight numeric not null default 1,primary key(user_id,tag));
create table public.saves(user_id uuid references auth.users on delete cascade,place_id text references public.places,created_at timestamptz default now(),primary key(user_id,place_id));
create table public.logs(user_id uuid references auth.users on delete cascade,place_id text references public.places,reaction text not null check(reaction in ('loved','fine','nope')),dish_tags text[] default '{}',context_tags text[] default '{}',visited_at timestamptz default now(),primary key(user_id,place_id));
create table public.rec_events(id bigint generated always as identity primary key,user_id uuid default auth.uid() references auth.users on delete cascade,place_id text references public.places,shown_at timestamptz default now(),action text check(action in ('shown','save','detail','skip')));
create index logs_user_reaction on public.logs(user_id,reaction);
alter table public.places enable row level security;
create policy places_read on public.places for select to authenticated using(true);
do $$ declare t text; begin
 foreach t in array array['profiles','cravings','saves','logs','rec_events'] loop
  execute format('alter table public.%I enable row level security',t);
  execute format('create policy own_records on public.%I for all to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()))',t);
 end loop;
end $$;
-- Candidate JSON is used only within this request and never written to a table.
-- The Edge Function validates it; scoring remains inspectable in SQL.
create or replace function public.rank_candidates(candidates jsonb, selected_tags text[], context_hour int default 18)
returns table(place jsonb,score numeric)
language sql stable security invoker set search_path = public,extensions as $$
 with entries as (
  select value as p, array(select jsonb_array_elements_text(value->'tags')) as tags
  from jsonb_array_elements(candidates)
  where (value->>'open')::boolean and (value->>'meters')::numeric <= 1000
 ), nopes as (
  select unnest(context_tags) tag,count(*) n from logs where user_id=auth.uid() and reaction='nope' group by tag
 ), components as (
  select p,
   case when cardinality(selected_tags)>0 then
    (select coalesce(sum(case when t=any(tags) then greatest(.1,coalesce(w.weight,1)) else 0 end),0)/greatest(.1,sum(greatest(.1,coalesce(w.weight,1)))) from unnest(selected_tags) t left join cravings w on w.user_id=auth.uid() and w.tag=t)
    else case when (case when context_hour>=21 then 'late' when context_hour<14 then 'brunch' else 'comfort' end)=any(tags) then 1 else .3 end end c,
   exp(-(p->>'meters')::numeric/800) d,
   (((p->>'rating')::numeric*(p->>'count')::numeric+4.2*50)/((p->>'count')::numeric+50))/5 q,
   coalesce((select max((select count(*)::numeric from unnest(l.context_tags) t where t=any(tags))/greatest(cardinality(l.context_tags),1)) from logs l where l.user_id=auth.uid() and l.reaction='loved'),0) a,
   case when exists(select 1 from logs where user_id=auth.uid() and place_id=p->>'id') then 0 else 1 end n
  from entries where not exists(select 1 from logs where user_id=auth.uid() and place_id=p->>'id' and reaction='nope')
   and not exists(select 1 from nopes where n>=3 and tag in ('noodles','sushi','pizza','burgers') and tag=any(tags))
 ) select p,(.35*c+.25*d+.20*q+.15*a+.05*n)::numeric from components order by 2 desc limit 5;
$$;
revoke execute on function public.rank_candidates(jsonb,text[],int) from public,anon;
grant execute on function public.rank_candidates(jsonb,text[],int) to authenticated;
-- Log feedback updates the user's chosen craving weights atomically.
create or replace function public.update_taste_weights() returns trigger
language plpgsql security invoker set search_path=public as $$
declare t text; delta numeric; previous_delta numeric;
begin
 if TG_OP='UPDATE' then
  previous_delta:=case old.reaction when 'loved' then .2 when 'nope' then -.3 else 0 end;
  foreach t in array old.context_tags loop
   update cravings set weight=weight-previous_delta where user_id=old.user_id and tag=t;
  end loop;
 end if;
 delta:=case new.reaction when 'loved' then .2 when 'nope' then -.3 else 0 end;
 foreach t in array new.context_tags loop
  insert into cravings(user_id,tag,weight) values(new.user_id,t,1+delta)
   on conflict(user_id,tag) do update set weight=cravings.weight+delta;
 end loop;
 return new;
end $$;
create trigger log_taste after insert or update on public.logs for each row execute function public.update_taste_weights();
-- Free-tier demo protection. A serialized counter prevents concurrent quota bypass.
create table public.api_usage(user_id uuid references auth.users on delete cascade,day date,requests int not null,primary key(user_id,day));
alter table public.api_usage enable row level security;
create or replace function public.consume_places_quota() returns boolean
language plpgsql security definer set search_path=public as $$
declare total int;
begin
 if auth.uid() is null then return false;end if;
 insert into api_usage(user_id,day,requests) values(auth.uid(),current_date,1)
 on conflict(user_id,day) do update set requests=api_usage.requests+1 returning requests into total;
 return total<=40;
end $$;
revoke execute on function public.consume_places_quota() from public,anon;
grant execute on function public.consume_places_quota() to authenticated;
