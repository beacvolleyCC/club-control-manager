const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const migration=fs.readFileSync(path.join(__dirname,'../supabase/migrations/20261014125538_cc_preserve_competition_match_identity_v1.sql'),'utf8');
const manager=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8');

test('competition match deletion is prohibited at the database layer',()=>{
 assert.match(migration,/CREATE OR REPLACE FUNCTION private\.cc_preserve_competition_match_identity_v1\(\)/i);
 assert.match(migration,/if tg_op = 'DELETE' then\s+raise exception 'MATCH_HARD_DELETE_FORBIDDEN'/i);
 assert.match(migration,/before delete or update of team_id, event_type\s+on public\.events/i);
 assert.match(migration,/for each row execute function private\.cc_preserve_competition_match_identity_v1\(\)/i);
});
test('competition match identity cannot be changed and RSVPs or source links forbid team transfer',()=>{
 assert.match(migration,/MATCH_EVENT_TYPE_IMMUTABLE/);
 assert.match(migration,/MATCH_TEAM_MOVE_WITH_ACTIVITY_FORBIDDEN/);
 assert.match(migration,/public\.availability a where a\.event_id=old\.id/);
 assert.match(migration,/public\.cc_coach_event_availability_v1 a where a\.event_id=old\.id/);
 assert.match(migration,/public\.competition_source_matches s where s\.linked_event_id=old\.id/);
});
test('schedule edits update the same event; cancel is not hard-delete',()=>{
 const editor=manager.slice(manager.indexOf('  function openCompetitionEventEditor('),manager.indexOf('  async function ccRosterRsvpWrite_('));
 assert.ok(editor.includes("rpc('cc_manager_competition_event_save_v1',{p_event_id:text(e.eventId||e.id),p_payload:base,p_notify:notify})"));
 assert.ok(editor.includes("rpc('cc_manager_competition_event_cancel_v1'"));
 assert.ok(!editor.includes("rpc('cc_manager_competition_event_save_v1',{p_event_id:null,p_payload:base"));
});
