-- Club Control V2 TEST-only initial internationalisation catalog.
-- No LIVE execution. Public rows are published UI copy only: no user records.
-- The database is the canonical catalogue; clients bundle a reviewed Hungarian offline snapshot.
create table if not exists public.i18n_languages (
 code text primary key check (code ~ '^[a-z]{2,3}(-[a-z0-9]{2,8})*$'),
 native_name text not null check (length(trim(native_name)) > 0),
 display_name text not null,
 enabled boolean not null default false,
 is_default boolean not null default false,
 fallback_code text not null default 'hu',
 updated_at timestamptz not null default now()
);
create unique index if not exists i18n_one_default_language_idx
 on public.i18n_languages(is_default) where is_default;

create table if not exists public.i18n_keys (
 key text primary key check (length(key)<=180 and key ~ '^[a-z][a-zA-Z0-9_]*(\.[a-z][a-zA-Z0-9_]*)+),
 scope text not null check (scope ~ '^[a-z][a-z0-9_]*$'),
 source_hu text not null check (length(source_hu)>0),
 description text not null default '',
 is_published boolean not null default false,
 updated_at timestamptz not null default now()
);
create index if not exists i18n_keys_scope_idx on public.i18n_keys(scope);

create table if not exists public.i18n_translations (
 key text not null references public.i18n_keys(key) on delete restrict,
 locale text not null references public.i18n_languages(code) on delete restrict,
 value text not null check (length(value)>0),
 status text not null default 'draft' check(status in ('draft','reviewed','published')),
 updated_at timestamptz not null default now(),
 primary key(key,locale)
);
create index if not exists i18n_translations_locale_status_idx
 on public.i18n_translations(locale,status);

create table if not exists public.i18n_versions (
 locale text primary key references public.i18n_languages(code) on delete restrict,
 revision bigint not null default 1 check (revision>=1),
 published_at timestamptz not null default now()
);

-- All exposed tables enforce RLS. Public/Player can only read *published* copy.
alter table public.i18n_languages enable row level security;
alter table public.i18n_keys enable row level security;
alter table public.i18n_translations enable row level security;
alter table public.i18n_versions enable row level security;
revoke all on table public.i18n_languages,public.i18n_keys,public.i18n_translations,public.i18n_versions
 from public,anon,authenticated;
grant select on table public.i18n_languages,public.i18n_keys,public.i18n_translations,public.i18n_versions
 to anon,authenticated;

drop policy if exists i18n_languages_public_read on public.i18n_languages;
create policy i18n_languages_public_read on public.i18n_languages
 for select to anon,authenticated using (enabled is true);
drop policy if exists i18n_keys_published_read on public.i18n_keys;
create policy i18n_keys_published_read on public.i18n_keys
 for select to anon,authenticated using (is_published is true);
drop policy if exists i18n_translations_published_read on public.i18n_translations;
create policy i18n_translations_published_read on public.i18n_translations
 for select to anon,authenticated using (
 status='published'
 and exists(select 1 from public.i18n_keys k where k.key=i18n_translations.key and k.is_published)
 and exists(select 1 from public.i18n_languages l where l.code=i18n_translations.locale and l.enabled)
 );
drop policy if exists i18n_versions_public_read on public.i18n_versions;
create policy i18n_versions_public_read on public.i18n_versions
 for select to anon,authenticated using (
 exists (select 1 from public.i18n_languages l where l.code=i18n_versions.locale and l.enabled)
 );

insert into public.i18n_languages(code,native_name,display_name,enabled,is_default,fallback_code)
values ('hu','Magyar','Hungarian',true,true,'hu'),
       ('en','English (UK)','English (British)',true,false,'hu')
on conflict (code) do nothing;

insert into public.i18n_keys(key,scope,source_hu,is_published)
values
('common.overview','common','Áttekintés',true),
('common.trainings','common','Edzések',true),
('common.matches','common','Meccsek',true),
('common.players','common','Sportolók',true),
('common.teams','common','Csapatok',true),
('common.notifications','common','Értesítések',true),
('common.profile','common','Profil',true),
('common.menu','common','Menü',true),
('common.search','common','Keresés',true),
('common.save','common','Mentés',true),
('common.cancel','common','Mégse',true),
('common.delete','common','Törlés',true),
('common.noDate','common','Nincs időpont',true),
('common.noVenue','common','Helyszín nincs megadva',true),
('common.noData','common','Nincs adat',true),
('common.waitlist','common','Várólista',true),
('common.signOut','common','Kijelentkezés',true),
('common.itemsCount','common','{count, plural, one {# elem} other {# elem}}',true),
('common.locale','common','Nyelv',true),
('auth.title','auth','TEST belépés',true),
('auth.sendCode','auth','Kód kérése',true),
('auth.signIn','auth','Belépés',true),
('auth.code','auth','Egyszer használatos kód',true),
('auth.noSession','auth','Nincs TEST munkamenet.',true),
('auth.signedOut','auth','TEST belépés szükséges',true),
('auth.loading','auth','TEST betöltés…',true),
('auth.signedIn','auth','Hitelesített TEST · csak olvasás',true),
('manager.massTrainings','manager','Tömegsport · edzések',true),
('manager.massPasses','manager','Tömegsport · bérletek',true),
('manager.finance','manager','Pénzügyek',true),
('manager.statistics','manager','Statisztikák',true),
('manager.settings','manager','Beállítások',true),
('manager.trainingsDesc','manager','A jogosult edzések listája',true),
('manager.matchesDesc','manager','Saját csapatok meccseseményei, külön jegyzőkönyv-bekötés nélkül',true),
('manager.playersDesc','manager','A jogosult csapatok sportolói',true),
('manager.teamsDesc','manager','A csapatmodulhoz engedélyezett csapatok',true),
('manager.overviewDesc','manager','Jogosultság szerint visszaadott edzések, meccsek és játékosok',true),
('player.homeDesc','player','Saját edzések, mérkőzések és értesítések',true),
('player.trainingsDesc','player','Saját csapathoz tartozó edzések',true),
('player.matchesDesc','player','Csapatesemények; hivatalos jegyzőkönyv külön modul',true),
('player.notificationsDesc','player','Saját, jogosultsággal lekért értesítések',true),
('player.profileDesc','player','Bejelentkezett sportoló adatai',true),
('player.attending','player','Jövök',true),
('player.notAttending','player','Nem jövök',true),
('player.noResponse','player','Nincs válasz',true),
('player.noMatch','player','Nincs megjeleníthető saját mérkőzés.',true),
('player.noTraining','player','Nincs megjeleníthető saját edzés.',true)
on conflict(key) do nothing;

insert into public.i18n_translations(key,locale,value,status)
values
('common.overview','en','Overview','published'),
('common.trainings','en','Training','published'),
('common.matches','en','Matches','published'),
('common.players','en','Players','published'),
('common.teams','en','Teams','published'),
('common.notifications','en','Notifications','published'),
('common.profile','en','Profile','published'),
('common.menu','en','Menu','published'),
('common.search','en','Search','published'),
('common.save','en','Save','published'),
('common.cancel','en','Cancel','published'),
('common.delete','en','Delete','published'),
('common.noDate','en','No date available','published'),
('common.noVenue','en','Venue not specified','published'),
('common.noData','en','No data available','published'),
('common.waitlist','en','Waiting list','published'),
('common.signOut','en','Sign out','published'),
('common.itemsCount','en','{count, plural, one {# item} other {# items}}','published'),
('common.locale','en','Language','published'),
('auth.title','en','TEST sign-in','published'),
('auth.sendCode','en','Request code','published'),
('auth.signIn','en','Sign in','published'),
('auth.code','en','One-time code','published'),
('auth.noSession','en','No active TEST session.','published'),
('auth.signedOut','en','TEST sign-in required','published'),
('auth.loading','en','Loading TEST data…','published'),
('auth.signedIn','en','Signed in to TEST · read-only','published'),
('manager.massTrainings','en','Recreational training','published'),
('manager.massPasses','en','Recreational passes','published'),
('manager.finance','en','Finances','published'),
('manager.statistics','en','Statistics','published'),
('manager.settings','en','Settings','published'),
('manager.trainingsDesc','en','Training sessions you can access','published'),
('manager.matchesDesc','en','Matches involving your teams; official match reports are not yet linked','published'),
('manager.playersDesc','en','Players in the teams you can access','published'),
('manager.teamsDesc','en','Teams you can access','published'),
('manager.overviewDesc','en','Training, matches and players available to your account','published'),
('player.homeDesc','en','Your training, matches and notifications','published'),
('player.trainingsDesc','en','Your team''s training sessions','published'),
('player.matchesDesc','en','Team events; official match reports are separate','published'),
('player.notificationsDesc','en','Your notifications','published'),
('player.profileDesc','en','Your player details','published'),
('player.attending','en','I''m coming','published'),
('player.notAttending','en','Not attending','published'),
('player.noResponse','en','No response','published'),
('player.noMatch','en','No matches to display.','published'),
('player.noTraining','en','No training sessions to display.','published')
on conflict(key,locale) do nothing;

insert into public.i18n_versions(locale,revision)
values ('hu',1),('en',1)
on conflict(locale) do nothing;

-- SECURITY INVOKER ensures that only records permitted by RLS appear.
-- Inactive/unrecognised locale safely falls back to Hungarian.
create or replace function public.cc_v2_i18n_bundle_v1(p_locale text default 'hu')
returns jsonb language plpgsql stable security invoker set search_path to ''
as $$
declare v_lang text:=lower(trim(coalesce(p_locale,'')));
begin
 if length(v_lang)>50 then raise exception 'V2_INVALID_LOCALE' using errcode='22023'; end if;
 if not exists (select 1 from public.i18n_languages l where l.code=v_lang and l.enabled) then
  v_lang:='hu';
 end if;
 return jsonb_build_object(
  'schemaVersion',1,
  'locale',v_lang,
  'fallbackLocale','hu',
  'revision',coalesce((select v.revision from public.i18n_versions v where v.locale=v_lang),1),
  'languages',coalesce((select jsonb_agg(jsonb_build_object(
     'code',l.code,'nativeName',l.native_name,'displayName',l.display_name,'fallbackCode',l.fallback_code
    ) order by l.is_default desc,l.code) from public.i18n_languages l where l.enabled), '[]'::jsonb),
  'messages',coalesce((select jsonb_object_agg(k.key,
    case when v_lang='hu' then k.source_hu else coalesce(t.value,k.source_hu) end
   ) from public.i18n_keys k
    left join public.i18n_translations t on t.key=k.key and t.locale=v_lang and t.status='published'
   where k.is_published), '{}'::jsonb)
 );
end $$;
revoke all on function public.cc_v2_i18n_bundle_v1(text) from public,anon,authenticated;
grant execute on function public.cc_v2_i18n_bundle_v1(text) to anon,authenticated;

-- Publication contract: editor must increment the locale's i18n_versions.revision
-- in the same DB transaction as publishing a translation, before clients refresh.
),
 scope text not null check (scope ~ '^[a-z][a-z0-9_]*$'),
 source_hu text not null check (length(source_hu)>0),
 description text not null default '',
 is_published boolean not null default false,
 updated_at timestamptz not null default now()
);
create index if not exists i18n_keys_scope_idx on public.i18n_keys(scope);

create table if not exists public.i18n_translations (
 key text not null references public.i18n_keys(key) on delete restrict,
 locale text not null references public.i18n_languages(code) on delete restrict,
 value text not null check (length(value)>0),
 status text not null default 'draft' check(status in ('draft','reviewed','published')),
 updated_at timestamptz not null default now(),
 primary key(key,locale)
);
create index if not exists i18n_translations_locale_status_idx
 on public.i18n_translations(locale,status);

create table if not exists public.i18n_versions (
 locale text primary key references public.i18n_languages(code) on delete restrict,
 revision bigint not null default 1 check (revision>=1),
 published_at timestamptz not null default now()
);

-- All exposed tables enforce RLS. Public/Player can only read *published* copy.
alter table public.i18n_languages enable row level security;
alter table public.i18n_keys enable row level security;
alter table public.i18n_translations enable row level security;
alter table public.i18n_versions enable row level security;
revoke all on table public.i18n_languages,public.i18n_keys,public.i18n_translations,public.i18n_versions
 from public,anon,authenticated;
grant select on table public.i18n_languages,public.i18n_keys,public.i18n_translations,public.i18n_versions
 to anon,authenticated;

drop policy if exists i18n_languages_public_read on public.i18n_languages;
create policy i18n_languages_public_read on public.i18n_languages
 for select to anon,authenticated using (enabled is true);
drop policy if exists i18n_keys_published_read on public.i18n_keys;
create policy i18n_keys_published_read on public.i18n_keys
 for select to anon,authenticated using (is_published is true);
drop policy if exists i18n_translations_published_read on public.i18n_translations;
create policy i18n_translations_published_read on public.i18n_translations
 for select to anon,authenticated using (
 status='published'
 and exists(select 1 from public.i18n_keys k where k.key=i18n_translations.key and k.is_published)
 and exists(select 1 from public.i18n_languages l where l.code=i18n_translations.locale and l.enabled)
 );
drop policy if exists i18n_versions_public_read on public.i18n_versions;
create policy i18n_versions_public_read on public.i18n_versions
 for select to anon,authenticated using (
 exists (select 1 from public.i18n_languages l where l.code=i18n_versions.locale and l.enabled)
 );

insert into public.i18n_languages(code,native_name,display_name,enabled,is_default,fallback_code)
values ('hu','Magyar','Hungarian',true,true,'hu'),
       ('en','English (UK)','English (British)',true,false,'hu')
on conflict (code) do nothing;

insert into public.i18n_keys(key,scope,source_hu,is_published)
values
('common.overview','common','Áttekintés',true),
('common.trainings','common','Edzések',true),
('common.matches','common','Meccsek',true),
('common.players','common','Sportolók',true),
('common.teams','common','Csapatok',true),
('common.notifications','common','Értesítések',true),
('common.profile','common','Profil',true),
('common.menu','common','Menü',true),
('common.search','common','Keresés',true),
('common.save','common','Mentés',true),
('common.cancel','common','Mégse',true),
('common.delete','common','Törlés',true),
('common.noDate','common','Nincs időpont',true),
('common.noVenue','common','Helyszín nincs megadva',true),
('common.noData','common','Nincs adat',true),
('common.waitlist','common','Várólista',true),
('common.signOut','common','Kijelentkezés',true),
('common.itemsCount','common','{count, plural, one {# elem} other {# elem}}',true),
('common.locale','common','Nyelv',true),
('auth.title','auth','TEST belépés',true),
('auth.sendCode','auth','Kód kérése',true),
('auth.signIn','auth','Belépés',true),
('auth.code','auth','Egyszer használatos kód',true),
('auth.noSession','auth','Nincs TEST munkamenet.',true),
('auth.signedOut','auth','TEST belépés szükséges',true),
('auth.loading','auth','TEST betöltés…',true),
('auth.signedIn','auth','Hitelesített TEST · csak olvasás',true),
('manager.massTrainings','manager','Tömegsport · edzések',true),
('manager.massPasses','manager','Tömegsport · bérletek',true),
('manager.finance','manager','Pénzügyek',true),
('manager.statistics','manager','Statisztikák',true),
('manager.settings','manager','Beállítások',true),
('manager.trainingsDesc','manager','A jogosult edzések listája',true),
('manager.matchesDesc','manager','Saját csapatok meccseseményei, külön jegyzőkönyv-bekötés nélkül',true),
('manager.playersDesc','manager','A jogosult csapatok sportolói',true),
('manager.teamsDesc','manager','A csapatmodulhoz engedélyezett csapatok',true),
('manager.overviewDesc','manager','Jogosultság szerint visszaadott edzések, meccsek és játékosok',true),
('player.homeDesc','player','Saját edzések, mérkőzések és értesítések',true),
('player.trainingsDesc','player','Saját csapathoz tartozó edzések',true),
('player.matchesDesc','player','Csapatesemények; hivatalos jegyzőkönyv külön modul',true),
('player.notificationsDesc','player','Saját, jogosultsággal lekért értesítések',true),
('player.profileDesc','player','Bejelentkezett sportoló adatai',true),
('player.attending','player','Jövök',true),
('player.notAttending','player','Nem jövök',true),
('player.noResponse','player','Nincs válasz',true),
('player.noMatch','player','Nincs megjeleníthető saját mérkőzés.',true),
('player.noTraining','player','Nincs megjeleníthető saját edzés.',true)
on conflict(key) do nothing;

insert into public.i18n_translations(key,locale,value,status)
values
('common.overview','en','Overview','published'),
('common.trainings','en','Training','published'),
('common.matches','en','Matches','published'),
('common.players','en','Players','published'),
('common.teams','en','Teams','published'),
('common.notifications','en','Notifications','published'),
('common.profile','en','Profile','published'),
('common.menu','en','Menu','published'),
('common.search','en','Search','published'),
('common.save','en','Save','published'),
('common.cancel','en','Cancel','published'),
('common.delete','en','Delete','published'),
('common.noDate','en','No date available','published'),
('common.noVenue','en','Venue not specified','published'),
('common.noData','en','No data available','published'),
('common.waitlist','en','Waiting list','published'),
('common.signOut','en','Sign out','published'),
('common.itemsCount','en','{count, plural, one {# item} other {# items}}','published'),
('common.locale','en','Language','published'),
('auth.title','en','TEST sign-in','published'),
('auth.sendCode','en','Request code','published'),
('auth.signIn','en','Sign in','published'),
('auth.code','en','One-time code','published'),
('auth.noSession','en','No active TEST session.','published'),
('auth.signedOut','en','TEST sign-in required','published'),
('auth.loading','en','Loading TEST data…','published'),
('auth.signedIn','en','Signed in to TEST · read-only','published'),
('manager.massTrainings','en','Recreational training','published'),
('manager.massPasses','en','Recreational passes','published'),
('manager.finance','en','Finances','published'),
('manager.statistics','en','Statistics','published'),
('manager.settings','en','Settings','published'),
('manager.trainingsDesc','en','Training sessions you can access','published'),
('manager.matchesDesc','en','Matches involving your teams; official match reports are not yet linked','published'),
('manager.playersDesc','en','Players in the teams you can access','published'),
('manager.teamsDesc','en','Teams you can access','published'),
('manager.overviewDesc','en','Training, matches and players available to your account','published'),
('player.homeDesc','en','Your training, matches and notifications','published'),
('player.trainingsDesc','en','Your team''s training sessions','published'),
('player.matchesDesc','en','Team events; official match reports are separate','published'),
('player.notificationsDesc','en','Your notifications','published'),
('player.profileDesc','en','Your player details','published'),
('player.attending','en','I''m coming','published'),
('player.notAttending','en','Not attending','published'),
('player.noResponse','en','No response','published'),
('player.noMatch','en','No matches to display.','published'),
('player.noTraining','en','No training sessions to display.','published')
on conflict(key,locale) do nothing;

insert into public.i18n_versions(locale,revision)
values ('hu',1),('en',1)
on conflict(locale) do nothing;

-- SECURITY INVOKER ensures that only records permitted by RLS appear.
-- Inactive/unrecognised locale safely falls back to Hungarian.
create or replace function public.cc_v2_i18n_bundle_v1(p_locale text default 'hu')
returns jsonb language plpgsql stable security invoker set search_path to ''
as $$
declare v_lang text:=lower(trim(coalesce(p_locale,'')));
begin
 if length(v_lang)>50 then raise exception 'V2_INVALID_LOCALE' using errcode='22023'; end if;
 if not exists (select 1 from public.i18n_languages l where l.code=v_lang and l.enabled) then
  v_lang:='hu';
 end if;
 return jsonb_build_object(
  'schemaVersion',1,
  'locale',v_lang,
  'fallbackLocale','hu',
  'revision',coalesce((select v.revision from public.i18n_versions v where v.locale=v_lang),1),
  'languages',coalesce((select jsonb_agg(jsonb_build_object(
     'code',l.code,'nativeName',l.native_name,'displayName',l.display_name,'fallbackCode',l.fallback_code
    ) order by l.is_default desc,l.code) from public.i18n_languages l where l.enabled), '[]'::jsonb),
  'messages',coalesce((select jsonb_object_agg(k.key,
    case when v_lang='hu' then k.source_hu else coalesce(t.value,k.source_hu) end
   ) from public.i18n_keys k
    left join public.i18n_translations t on t.key=k.key and t.locale=v_lang and t.status='published'
   where k.is_published), '{}'::jsonb)
 );
end $$;
revoke all on function public.cc_v2_i18n_bundle_v1(text) from public,anon,authenticated;
grant execute on function public.cc_v2_i18n_bundle_v1(text) to anon,authenticated;

-- Publication contract: editor must increment the locale's i18n_versions.revision
-- in the same DB transaction as publishing a translation, before clients refresh.
