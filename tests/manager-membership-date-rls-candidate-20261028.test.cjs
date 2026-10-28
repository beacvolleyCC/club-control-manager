'use strict';
// Static review + model QA only. NEVER changes Supabase. Not an authenticated DB RLS test.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const filename=path.join(__dirname,'..','docs','security','TEST_RLS_MEMBERSHIP_DATE_CANDIDATE_DO_NOT_APPLY_20261028.sql');
const raw=fs.readFileSync(filename,'utf8');
const sql=raw.replace(/--[^\n]*/g,'');
const blocks=sql.split(/CREATE OR REPLACE FUNCTION/i).slice(1);
test('candidate is review-only, has exactly the two existing private helper signatures',()=>{
 assert.match(raw,/DO NOT EXECUTE AUTOMATICALLY/);
 assert.equal(blocks.length,2);
 assert.match(blocks[0],/^\s+private\.current_team_ids\(\)/);
 assert.match(blocks[1],/^\s+private\.player_in_my_team\(target_player uuid\)/);
 assert.doesNotMatch(sql,/\b(?:GRANT|REVOKE|DROP|ALTER|TRUNCATE|INSERT|UPDATE|DELETE)\b/i);
 assert.doesNotMatch(sql,/\b(?:snqsxlyhontaepembaic|service_role|sb_secret_)\b/i);
});
for(const [i,name] of ['current_team_ids','player_in_my_team'].entries()){
 test(name+' requires active player, membership and team within the effective interval',()=>{
  const fn=blocks[i];
  assert.match(fn,/LANGUAGE sql\s+STABLE\s+SECURITY DEFINER\s+SET search_path TO ''/i);
  assert.match(fn,/tm\.active\s*=\s*TRUE/i);
  assert.match(fn,/t\.active\s*=\s*TRUE/i);
  assert.match(fn,/(?:p|target_p)\.active\s*=\s*TRUE/i);
  assert.match(fn,/tm\.starts_on\s*<=\s*CURRENT_DATE/i);
  assert.match(fn,/tm\.ends_on\s+IS\s+NULL\s+OR\s+tm\.ends_on\s*>=\s*CURRENT_DATE/i);
 });
}
test('the caller is scoped by auth.uid; target player must share an effective team',()=>{
 assert.match(blocks[0],/p\.auth_user_id\s*=\s*\(SELECT auth\.uid\(\)\)/i);
 assert.match(blocks[1],/tm\.player_id\s*=\s*target_player/i);
 assert.match(blocks[1],/tm\.team_id IN \(SELECT private\.current_team_ids\(\)\)/i);
});
// Expected decision matrix with synthetic rows; only live DB tests can verify actual PG enforcement.
const today='2026-10-28';
function membershipEffective(row){
 return !!(row.playerActive&&row.teamActive&&row.active&&row.startsOn
  &&row.startsOn<=today&&(!row.endsOn||row.endsOn>=today));
}
test('synthetic membership cases: current, inclusive boundaries, future, expired, inactive, missing start',()=>{
 const base={playerActive:true,teamActive:true,active:true,startsOn:'2026-10-01',endsOn:null};
 const cases=[
  [base,true], [{...base,startsOn:today,endsOn:today},true],
  [{...base,startsOn:'2026-11-01'},false],
  [{...base,endsOn:'2026-10-27'},false],
  [{...base,active:false},false],
  [{...base,playerActive:false},false],
  [{...base,teamActive:false},false],
  [{...base,startsOn:null},false]
 ];
 for(const [row,expected] of cases)assert.equal(membershipEffective(row),expected,JSON.stringify(row));
});
test('synthetic shared-team and no-Auth cases default to deny',()=>{
 const row={playerActive:true,teamActive:true,active:true,startsOn:'2026-10-01',endsOn:null};
 const canSee=(authUid,ownTeamIds,targetTeamId)=>Boolean(authUid)&&membershipEffective(row)&&ownTeamIds.includes(targetTeamId);
 assert.equal(canSee(null,['bb2'],'bb2'),false);
 assert.equal(canSee('test-auth',['bb2'],'bb1'),false);
 assert.equal(canSee('test-auth',['bb2'],'bb2'),true);
});
