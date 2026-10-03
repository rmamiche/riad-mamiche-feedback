-- Run in SQL Editor AFTER schema.sql; all fixtures are rolled back.
begin;
insert into public.sessions(code,title,subtitle,location,dates,trainer,is_open)
values('RM-SECURITY-TEST','Test','Test','Test','Test','Test',true),('RM-CLOSED-TEST','Test','Test','Test','Test','Test',false);
insert into auth.users(id) values ('aa000000-0000-4000-8000-000000000001'),('aa000000-0000-4000-8000-000000000002');
insert into public.trainers values ('aa000000-0000-4000-8000-000000000001');
create function pg_temp.test_payload() returns jsonb language sql as $$
select jsonb_build_object('submission_id','bb000000-0000-4000-8000-000000000001','session_code','RM-SECURITY-TEST','questionnaire_version','rm-pdp-v1','ratings',jsonb_build_object('s1q1',4,'s1q2',4,'s1q3',4,'s1q4',4,'s1q5',4,'s2q1',4,'s2q2',4,'s2q3',4,'s2q4',4,'s2q5',4,'s3q1',4,'s3q2',4,'s3q3',4,'s4q1',4,'s4q2',4,'s4q3',4,'s5q1',4),'recommend','Oui','before_level','Débutant','after_level','Avancé','fonction','','strengths','','improvements','','topics','');
$$;
set local role anon;
do $$
declare payload jsonb:=pg_temp.test_payload(); rejected boolean;
begin
 if not exists(select 1 from public.sessions where code='RM-SECURITY-TEST') then raise exception 'FAIL public open session'; end if;
 if exists(select 1 from public.sessions where code='RM-CLOSED-TEST') then raise exception 'FAIL closed session visibility'; end if;
 if exists(select 1 from public.trainers) then raise exception 'FAIL memberships visible'; end if;
 perform public.submit_evaluation(payload);
 perform public.submit_evaluation(payload); -- retry must not duplicate
 rejected:=false;
 begin perform 1 from public.responses; exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'FAIL anon response read allowed'; end if;
 rejected:=false;
 begin insert into public.trainers values ('aa000000-0000-4000-8000-000000000002'); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'FAIL self authorization allowed'; end if;
 rejected:=false;
 begin insert into public.responses select * from public.responses; exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'FAIL direct insert allowed'; end if;
 rejected:=false;
 begin perform public.submit_evaluation(jsonb_set(payload,'{ratings,s1q1}','5')); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'FAIL invalid rating accepted'; end if;
 rejected:=false;
 begin perform public.submit_evaluation(payload-'recommend'); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'FAIL missing field accepted'; end if;
 rejected:=false;
 begin perform public.submit_evaluation(jsonb_set(payload,'{ratings}',(payload->'ratings')-'s5q1')); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'FAIL missing rating accepted'; end if;
 rejected:=false;
 begin perform public.submit_evaluation(jsonb_set(payload,'{recommend}','"Maybe"')); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'FAIL invalid category accepted'; end if;
 rejected:=false;
 begin perform public.submit_evaluation(jsonb_set(payload,'{strengths}',to_jsonb(repeat('x',4001)))); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'FAIL oversized comments accepted'; end if;
 rejected:=false;
 begin perform public.submit_evaluation(jsonb_set(jsonb_set(payload,'{submission_id}','"bb000000-0000-4000-8000-000000000002"'),'{session_code}','"RM-CLOSED-TEST"')); exception when raise_exception then rejected:=true; end;
 if not rejected then raise exception 'FAIL closed session submission accepted'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000002',true);
set local role authenticated;
do $$ declare rejected boolean:=false; begin
 if exists(select 1 from public.responses) then raise exception 'FAIL ordinary account reads responses'; end if;
 if exists(select 1 from public.sessions where code='RM-CLOSED-TEST') then raise exception 'FAIL ordinary account reads closed sessions'; end if;
 begin insert into public.sessions(code,title,subtitle,location,dates,trainer) values('RM-UNAUTHORIZED','Test','','','',''); exception when insufficient_privilege then rejected:=true; end;
 if not rejected then raise exception 'FAIL ordinary account creates session'; end if;
end $$;
reset role;
select set_config('request.jwt.claim.sub','aa000000-0000-4000-8000-000000000001',true);
set local role authenticated;
do $$ begin
 if (select count(*) from public.responses where session_code='RM-SECURITY-TEST')<>1 then raise exception 'FAIL trainer read or idempotency'; end if;
 if not exists(select 1 from public.sessions where code='RM-CLOSED-TEST') then raise exception 'FAIL trainer closed session read'; end if;
 update public.sessions set is_open=false where code='RM-SECURITY-TEST';
 if not found then raise exception 'FAIL trainer close session'; end if;
 insert into public.sessions(code,title,subtitle,location,dates,trainer) values('RM-AUTHORIZED','Test','','','','');
end $$;
reset role;
rollback;
select 'Security checks passed; test fixtures rolled back.' as result;
