import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const read=name=>readFileSync(new URL('../database/migrations/'+name,import.meta.url),'utf8');
const pub=read('20261114_cc_v2_mass_public_schedule_preview.sql');
const sales=read('20261114_cc_v2_mass_pass_sales_window.sql');
const links=read('20261114_cc_v2_mass_verified_account_links.sql');
const fixtures=read('20261114_cc_v2_mass_synthetic_pass_fixtures.sql');
const translated=read('20261114_cc_v2_mass_schedule_i18n.sql');

test('published mass schedule never exposes booking, athlete, pass or raw JSON values',()=>{
 assert.match(pub,/create or replace function public\.cc_v2_mass_public_schedule_v1/);
 assert.match(pub,/e\.public_registration_active is true/);
 assert.match(pub,/e\.active is true/);
 assert.match(pub,/e\.session_type/);
 assert.match(pub,/revoke all on function public\.cc_v2_mass_public_schedule_v1/);
 assert.match(pub,/grant execute on function public\.cc_v2_mass_public_schedule_v1\(date,date\) to anon,authenticated/);
 const expose=pub.slice(pub.indexOf('select coalesce(jsonb_agg'),pub.indexOf('into v_events'));
 for(const field of ['email','pass_number','name','source_workbook_id','legacy_row','token_hash','cancellation_token','athlete_id']){
  assert.doesNotMatch(expose,new RegExp("['\\\"]"+field+"['\\\"]"));
 }
});

test('BEAC sales grace cannot silently fake a payment or bypass bookings',()=>{
 assert.match(sales,/sales_state in \('unknown','available','unavailable'\)/);
 assert.match(sales,/grace_until/);
 assert.match(sales,/cc_v2_mass_pass_sales_audit_v1/);
 assert.match(sales,/cc_manager_require_any_v1\('mass\.passes','view'\)/);
 assert.match(sales,/cc_manager_require_any_v1\('mass\.passes','edit'\)/);
 assert.match(sales,/revoke all on function public\.cc_v2_manager_pass_sales_set_v1/);
 assert.doesNotMatch(sales,/grant execute[^;]+to anon/);
 assert.doesNotMatch(sales,/update public\.mass_bookings|insert into public\.mass_bookings/);
});

test('a mass-only Player identity is linked by verified ownership, not unverified email',()=>{
 assert.match(links,/references auth\.users\(id\)/);
 assert.match(links,/references public\.mass_athletes\(id\)/);
 assert.match(links,/verified_method in \('verified_email_otp','manager_verified'\)/);
 assert.match(links,/auth\.uid\(\)/);
 assert.match(links,/revoke all on public\.cc_v2_mass_verified_account_links_v1/);
 assert.doesNotMatch(links,/on conflict.*email|lower\(.*email|grant insert|grant update/i);
});

test('fixture names and addresses are fictional and QA workbook-scoped',()=>{
 assert.match(fixtures,/CC-QA-SYNTHETIC/);
 assert.match(fixtures,/QA_FIXTURES_REQUIRE_SYNTHETIC_WORKBOOK/);
 assert.match(fixtures,/example\.invalid/);
 assert.match(fixtures,/notRealPurchase/);
 assert.doesNotMatch(fixtures,/LIVE|service_role/i);
});

test('localized public mass-schedule labels are in shared hu/en database catalog',()=>{
 assert.match(translated,/mass\.schedule\.title/);
 assert.match(translated,/mass\.schedule\.intro/);
 assert.match(translated,/i18n_versions/);
 const ui=readFileSync(new URL('../frontend-next/shared/mass-schedule-ui.js',import.meta.url),'utf8');
 assert.match(ui,/locale\.t\(token\)/);
 assert.match(ui,/createTestI18n/);
});
