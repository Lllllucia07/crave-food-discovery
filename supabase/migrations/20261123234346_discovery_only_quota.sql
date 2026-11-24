-- Legacy requests mixed search, details and photos. Count searches separately.
alter table public.api_usage add column if not exists search_requests integer not null default 0 check (search_requests >= 0);
create or replace function public.consume_places_quota() returns boolean
language plpgsql security definer set search_path=public as $$
declare total integer;
begin
 if auth.uid() is null then return false; end if;
 insert into public.api_usage(user_id,day,requests,search_requests) values(auth.uid(),current_date,1,1)
 on conflict(user_id,day) do update set
   requests=api_usage.requests+1,
   search_requests=api_usage.search_requests+1
 returning search_requests into total;
 return total<=40;
end $$;
revoke execute on function public.consume_places_quota() from public,anon;
grant execute on function public.consume_places_quota() to authenticated;
