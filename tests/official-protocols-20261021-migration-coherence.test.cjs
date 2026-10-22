'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const stage=JSON.parse(fs.readFileSync('data/competition/2026-27/official-protocols-20261021.json','utf8'));
const sql=fs.readFileSync('sql/official_protocols_20261021_identity_safe_migration.sql','utf8');
test('SQL evidence matches staging JSON byte-for-byte at the JSON data model level',()=>{
  const match=sql.match(/\$cc_proofs\$([\s\S]*?)\$cc_proofs\$/);
  assert.ok(match,'staged evidence must be embedded in independently reviewable migration');
  const embedded=JSON.parse(match[1]);
  const expected=stage.matches.map(item=>({
   sourceKey:item.sourceKey,
   fixtureKey:item.canonicalFixtureSourceKey,
   fileSha256:item.fileSha256,
   data:item.data
  }));
  assert.deepEqual(embedded,expected);
  assert.equal(embedded.length,2);
});
test('canonical identity and on-field bookings may not be altered',()=>{
  assert.match(sql,/sourceFixtureSnapshot/);
  assert.match(sql,/CC_PROTOCOL_MATCH_UUID_CHANGED/);
  assert.match(sql,/CC_PROTOCOL_REGRESSION/);
  assert.match(sql,/CC_PROTOCOL_PARTIAL_IMPORT/);
  assert.match(sql,/CC_PROTOCOL_FIXTURE_DRIFT/);
  assert.match(sql,/old_played\+applied/);
  assert.match(sql,/old_count<>298/);
  assert.match(sql,/old_identity<>new_identity/);
  assert.ok(!/\b(?:INSERT\s+INTO|DELETE\s+FROM)\s+public\./i.test(sql));
  assert.ok(!/UPDATE\s+public\.(?:events|availability|players|team_memberships|player_push_outbox)/i.test(sql));
  assert.match(sql,/coalesce\(s\.data->>'matchCode',s\.data->>'officialProtocolMatchCode'\)/);
  assert.doesNotMatch(sql,/jsonb_build_object\([^]*?'matchCode',code/, 'do not write matchCode top-level and mutate fixture UUID');
});
