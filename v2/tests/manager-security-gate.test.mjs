import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../apps/manager/test-connection.js',import.meta.url),'utf8');
test('Manager reads use only permission checked RPCs',()=>{for(const name of ['cc_manager_teams_v1','cc_manager_events_v1','cc_manager_players_v2'])assert.ok(js.includes(name));assert.doesNotMatch(js,/\/rest\/v1\/(teams|events|players)/);});
test('RPC requests include TEST bearer token and never write tables',()=>{assert.match(js,/\/rest\/v1\/rpc\//);assert.match(js,/Authorization:'Bearer '/);assert.doesNotMatch(js,/\.from\(|PATCH|DELETE/);});
