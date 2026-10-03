-- Run once in Supabase SQL Editor as the database owner.
begin;
create table public.trainers (
 user_id uuid primary key references auth.users(id) on delete cascade
);
create table public.sessions (
 code text primary key check(code ~ '^[A-Z0-9-]{3,80}$'),
 title text not null check(length(title) between 1 and 500),
 subtitle text not null check(length(subtitle)<=1000),
 location text not null check(length(location)<=200),
 dates text not null check(length(dates)<=200),
 trainer text not null check(length(trainer)<=200),
 questionnaire_version text not null default 'rm-pdp-v1' check(questionnaire_version='rm-pdp-v1'),
 is_open boolean not null default true,
 created_at timestamptz not null default now()
);
create table public.responses (
 id uuid primary key,
 session_code text not null references public.sessions(code),
 questionnaire_version text not null check(questionnaire_version='rm-pdp-v1'),
 ratings jsonb not null,
 recommend text not null check(recommend in ('Oui','Non')),
 before_level text not null check(before_level in ('Débutant','Intermédiaire','Avancé')),
 after_level text not null check(after_level in ('Débutant','Intermédiaire','Avancé')),
 fonction text not null default '' check(length(fonction)<=200),
 strengths text not null default '' check(length(strengths)<=4000),
 improvements text not null default '' check(length(improvements)<=4000),
 topics text not null default '' check(length(topics)<=4000),
 raw_payload jsonb not null,
 created_at timestamptz not null default now()
);
create index responses_session_id on public.responses(session_code,id);
alter table public.trainers enable row level security;
alter table public.sessions enable row level security;
alter table public.responses enable row level security;
revoke all on public.trainers,public.sessions,public.responses from public,anon,authenticated;
-- Anon sees zero membership rows (no anon policy); required by the session-read subquery.
grant select on public.trainers to anon,authenticated;
grant select on public.sessions to anon,authenticated;
grant insert on public.sessions to authenticated;
grant update(is_open,dates,location) on public.sessions to authenticated;
grant select on public.responses to authenticated;
create policy trainer_self on public.trainers for select to authenticated using(user_id=(select auth.uid()));
create policy session_read on public.sessions for select to anon,authenticated using(is_open or exists(select 1 from public.trainers where user_id=(select auth.uid())));
create policy session_create on public.sessions for insert to authenticated with check(exists(select 1 from public.trainers where user_id=(select auth.uid())));
create policy session_update on public.sessions for update to authenticated using(exists(select 1 from public.trainers where user_id=(select auth.uid()))) with check(exists(select 1 from public.trainers where user_id=(select auth.uid())));
create policy response_read on public.responses for select to authenticated using(exists(select 1 from public.trainers where user_id=(select auth.uid())));

create function public.submit_evaluation(payload jsonb) returns boolean
language plpgsql security definer set search_path = '' as $$
declare
 rating_keys text[] := array['s1q1','s1q2','s1q3','s1q4','s1q5','s2q1','s2q2','s2q3','s2q4','s2q5','s3q1','s3q2','s3q3','s4q1','s4q2','s4q3','s5q1'];
 k text; existing jsonb; session_version text;
begin
 if jsonb_typeof(payload) is distinct from 'object' or octet_length(payload::text)>60000 then raise exception 'Invalid payload'; end if;
 if (select count(*) from jsonb_object_keys(payload))<>11 or not payload ?& array['submission_id','session_code','questionnaire_version','ratings','fonction','recommend','before_level','after_level','strengths','improvements','topics'] then raise exception 'Invalid fields'; end if;
 foreach k in array array['submission_id','session_code','questionnaire_version','fonction','recommend','before_level','after_level','strengths','improvements','topics'] loop
   if jsonb_typeof(payload->k) is distinct from 'string' then raise exception 'Invalid text'; end if;
 end loop;
 if jsonb_typeof(payload->'ratings') is distinct from 'object' then raise exception 'Invalid ratings'; end if;
 if (select count(*) from jsonb_object_keys(payload->'ratings'))<>17 or not (payload->'ratings') ?& rating_keys then raise exception 'Incomplete ratings'; end if;
 foreach k in array rating_keys loop
   if jsonb_typeof(payload->'ratings'->k) is distinct from 'number' or (payload->'ratings'->>k) not in ('1','2','3','4') then raise exception 'Invalid rating'; end if;
 end loop;
 if length(payload->>'fonction')>200 or length(payload->>'strengths')>4000 or length(payload->>'improvements')>4000 or length(payload->>'topics')>4000
   or (payload->>'recommend') not in ('Oui','Non') or (payload->>'before_level') not in ('Débutant','Intermédiaire','Avancé') or (payload->>'after_level') not in ('Débutant','Intermédiaire','Avancé') then raise exception 'Invalid answers'; end if;
 if payload->>'questionnaire_version'<>'rm-pdp-v1' then raise exception 'Unsupported questionnaire'; end if;
 -- Stable random ID makes a retry safe if the first request committed but its reply was lost.
 select raw_payload into existing from public.responses where id=(payload->>'submission_id')::uuid;
 if found then
   if existing=payload then return true; end if;
   raise exception 'Invalid submission';
 end if;
 select questionnaire_version into session_version from public.sessions where code=payload->>'session_code' and is_open for share;
 if not found or session_version<>payload->>'questionnaire_version' then raise exception 'Session unavailable'; end if;
 insert into public.responses(id,session_code,questionnaire_version,ratings,recommend,before_level,after_level,fonction,strengths,improvements,topics,raw_payload)
 values((payload->>'submission_id')::uuid,payload->>'session_code',session_version,payload->'ratings',payload->>'recommend',payload->>'before_level',payload->>'after_level',payload->>'fonction',payload->>'strengths',payload->>'improvements',payload->>'topics',payload)
 on conflict(id) do nothing;
 select raw_payload into existing from public.responses where id=(payload->>'submission_id')::uuid;
 if existing is distinct from payload then raise exception 'Invalid submission'; end if;
 return true;
end;
$$;
revoke all on function public.submit_evaluation(jsonb) from public;
grant execute on function public.submit_evaluation(jsonb) to anon,authenticated;
insert into public.sessions(code,title,subtitle,location,dates,trainer) values
('RM-PDP-5J-CTMC-2026','Protection des données à caractère personnel — 5 jours (30 heures)','Protection des données à caractère personnel : Loi n° 18-07 modifiée et complétée par la Loi n° 25-11','CTMC / SPA','À renseigner par le formateur','M. Riad MAMICHE');
commit;
