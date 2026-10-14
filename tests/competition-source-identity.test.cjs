const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const migration=fs.readFileSync("supabase/migrations/20261014135156_cc_sync_identity_ambiguous_pair_preserve_v2.sql",'utf8');
const src=fs.readFileSync('app.js','utf8');
test('source sync requires unique source match pair within one incoming batch',()=>{
 assert.ok(migration.includes('SYNC_AMBIGUOUS_PAIR_IN_INCOMING_SCHEDULE'));
 assert.match(migration,/jsonb_array_elements\(p_matches\) item[\s\S]*?group by item->>'homeSourceTeamId',item->>'awaySourceTeamId'[\s\S]*?having count\(\*\)>1/);
});
test('changed technical keys recover linked event UUID without using kickoff as identity',()=>{
 assert.ok(migration.includes('MGR015_SYNC_PAIR_IDENTITY_RECOVERY_V1'));
 assert.match(migration,/s\.linked_event_id is not null[\s\S]*?v_pair_candidate_count=1/);
 assert.match(migration,/set source_match_key=v_key,updated_at=now\(\),last_run_id=p_run_id/);
 assert.match(migration,/update public\.events e set[\s\S]*?where e\.id=v_event\.id/);
});
test('ambiguous source key collision is held for manual review, not linked',()=>{
 assert.ok(migration.includes('MGR015_SAFE_IDENTITY_V2'));
 assert.match(migration,/if v_existing\.id is null and v_home_id is not null[\s\S]*?v_review:=true/);
 assert.match(migration,/if v_review or v_start is null then[\s\S]*?v_review_count:=v_review_count\+1;[\s\S]*?continue;/);
});
test('same-time different opponent cannot hijack an existing registered event',()=>{
 assert.ok(migration.includes('A kezdési időpont más ellenfélhez tartozó'));
 assert.ok(migration.includes("lower(trim(coalesce(e.title,'')))<>lower(v_title)"));
 assert.ok(migration.includes("and lower(trim(coalesce(e.title,'')))=lower(v_title)"));
 assert.ok(migration.includes('exists(select 1 from public.availability a where a.event_id=e.id)'));
 assert.ok(!migration.includes('delete from public.availability'));
});
test('Manager mobile importer and the browser helper reach same server function',()=>{
 assert.ok(src.includes("mode==='html_import'"));
 assert.ok(src.includes("ccPrepareBrszHtmlDocuments_(selected)"));
 assert.ok(src.includes("functions.invoke('cc-competition-sync'"));
 assert.ok(src.includes('mode,documents'));
});
