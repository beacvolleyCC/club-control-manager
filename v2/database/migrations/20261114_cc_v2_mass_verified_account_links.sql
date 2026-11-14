-- V2 TEST-only: explicit identities for mass-only players, no automatic email merging.
-- Authenticated accounts remain separate from legacy mass_athletes until verified
-- ownership has been proven by a trusted server-side email-OTP workflow.
create table if not exists public.cc_v2_mass_verified_account_links_v1(
 auth_user_id uuid primary key references auth.users(id) on delete cascade,
 mass_athlete_id text not null unique references public.mass_athletes(id) on delete restrict,
 verified_method text not null check (verified_method in ('verified_email_otp','manager_verified')),
 verified_at timestamptz not null,
 created_at timestamptz not null default now()
);
create index if not exists cc_v2_mass_verified_account_links_athlete_idx
 on public.cc_v2_mass_verified_account_links_v1(mass_athlete_id);
alter table public.cc_v2_mass_verified_account_links_v1 enable row level security;
revoke all on public.cc_v2_mass_verified_account_links_v1 from public,anon,authenticated;

-- Only a verified owner can see their own link; the public never gets an account lookup.
-- No user-writable linking endpoint is exposed in this migration.
create or replace function public.cc_v2_mass_account_status_v1()
returns jsonb language plpgsql stable security definer set search_path to ''
as $function$
declare v_user uuid := (select auth.uid());
 v_link public.cc_v2_mass_verified_account_links_v1%rowtype;
begin
 if v_user is null then
  raise exception 'CC_V2_MASS_AUTH_REQUIRED' using errcode='42501';
 end if;
 select * into v_link from public.cc_v2_mass_verified_account_links_v1
 where auth_user_id=v_user;
 return jsonb_build_object(
  'schemaVersion',1,
  'verified',v_link.auth_user_id is not null,
  'hasMassProfile',v_link.mass_athlete_id is not null,
  'verifiedAt',v_link.verified_at
 );
end $function$;
revoke all on function public.cc_v2_mass_account_status_v1() from public,anon,authenticated;
grant execute on function public.cc_v2_mass_account_status_v1() to authenticated;
