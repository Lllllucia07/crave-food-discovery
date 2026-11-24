-- Apply before deploying the updated recommendation function.
drop function if exists public.rank_candidates(jsonb,text[],int);
create or replace function public.rank_candidates(candidates jsonb, selected_tags text[], context_hour int default 18, search_radius int default 5000)
returns table(place jsonb,score numeric)
language sql stable security invoker set search_path = public,extensions as $$
 with entries as (
  select value as p, array(select jsonb_array_elements_text(value->'tags')) as tags
  from jsonb_array_elements(candidates)
  where (value->>'open')::boolean and (value->>'meters')::numeric <= least(25000,greatest(1000,search_radius))
 ), nopes as (
  select unnest(context_tags) tag,count(*) n from logs where user_id=auth.uid() and reaction='nope' group by tag
 ), components as (
  select p,
   case when cardinality(selected_tags)>0 then
    (select coalesce(sum(case when t=any(tags) then greatest(.1,coalesce(w.weight,1)) else 0 end),0)/greatest(.1,sum(greatest(.1,coalesce(w.weight,1)))) from unnest(selected_tags) t left join cravings w on w.user_id=auth.uid() and w.tag=t)
    else case when (case when context_hour>=21 then 'late' when context_hour<14 then 'brunch' else 'comfort' end)=any(tags) then 1 else .3 end end c,
   exp(-(p->>'meters')::numeric/greatest(800,least(25000,greatest(1000,search_radius))*.6)) d,
   (((p->>'rating')::numeric*(p->>'count')::numeric+4.2*50)/((p->>'count')::numeric+50))/5 q,
   coalesce((select max((select count(*)::numeric from unnest(l.context_tags) t where t=any(tags))/greatest(cardinality(l.context_tags),1)) from logs l where l.user_id=auth.uid() and l.reaction='loved'),0) a,
   case when exists(select 1 from logs where user_id=auth.uid() and place_id=p->>'id') then 0 else 1 end n
  from entries where not exists(select 1 from logs where user_id=auth.uid() and place_id=p->>'id' and reaction='nope')
   and not exists(select 1 from nopes where n>=3 and tag in ('noodles','sushi','pizza','burgers') and tag=any(tags))
 ) select p,(.35*c+.25*d+.20*q+.15*a+.05*n)::numeric from components order by 2 desc limit 5;
$$;
revoke execute on function public.rank_candidates(jsonb,text[],int,int) from public,anon;
grant execute on function public.rank_candidates(jsonb,text[],int,int) to authenticated;
