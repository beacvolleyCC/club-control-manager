import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const src=readFileSync(new URL('../apps/manager/main.js',import.meta.url),'utf8');
test('event mapping uses Manager RPC camelCase contract',()=>{assert.match(src,/e\.eventId/);assert.match(src,/e\.teamId/);assert.match(src,/e\.startsAt/);assert.doesNotMatch(src,/e\.team_id|e\.starts_at/);});
test('player mapping uses authorized RPC player data',()=>{assert.match(src,/p\.playerId/);assert.match(src,/p\.displayName/);assert.match(src,/liveTestData\?\.players\?\?players/);assert.match(src,/sourcePlayers\.filter/);});
test('missing event timestamps never show epoch',()=>{assert.match(src,/Nincs időpont/);assert.match(src,/Number\.isNaN/);});

test('Manager overview hides unverified privileged controls',()=>{assert.match(src,/byId\('newEvent'\)\.hidden=true/);assert.match(src,/byId\('settingsNav'\)\.hidden=true/);});
test('Manager overview filters player and team lists by selected team',()=>{assert.match(src,/sourcePlayers\.filter\(p=>selected==='all'\|\|p\.teamId===selected\)/);assert.match(src,/sourceTeams\.filter\(t=>selected==='all'\|\|t\.id===selected\)/);});
test('Manager overview defaults to nearest upcoming and most recent past',()=>{assert.match(src,/period==='past'\?-1:1/);assert.match(src,/sort==='oldest'\?1:sort==='recent'\?-1/);});
