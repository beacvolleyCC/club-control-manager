import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../apps/manager/main.js',import.meta.url),'utf8');
test('event mapping uses Manager RPC camelCase contract',()=>{assert.match(src,/e\.eventId/);assert.match(src,/e\.teamId/);assert.match(src,/e\.startsAt/);assert.doesNotMatch(src,/e\.team_id|e\.starts_at/);});
test('player mapping uses authorized RPC player data',()=>{assert.match(src,/p\.playerId/);assert.match(src,/p\.displayName/);assert.match(src,/liveTestData\?\.players\?\?players/);assert.match(src,/sourcePlayers\.filter/);});
test('missing event timestamps never show epoch',()=>{assert.match(src,/Nincs időpont/);assert.match(src,/Number\.isNaN/);});
