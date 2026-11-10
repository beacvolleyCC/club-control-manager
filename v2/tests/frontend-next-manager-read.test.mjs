import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const manager=readFileSync(new URL('../frontend-next/manager/main.js',import.meta.url),'utf8');
const managerHtml=readFileSync(new URL('../frontend-next/manager/index.html',import.meta.url),'utf8');
const player=readFileSync(new URL('../frontend-next/player/main.js',import.meta.url),'utf8');
const playerHtml=readFileSync(new URL('../frontend-next/player/index.html',import.meta.url),'utf8');
const client=readFileSync(new URL('../frontend-next/shared/test-rpc.js',import.meta.url),'utf8');
const auth=readFileSync(new URL('../frontend-next/shared/test-auth-ui.js',import.meta.url),'utf8');
test('Manager shell consumes permission-checked TEST RPC without direct database access or writes',()=>{
 assert.match(manager,/readTestManagerModules\(session/);
 for(const s of ['payload.data','payload.available','available[link.dataset.view]','data.teams','requestVersion','controller?.abort','mode=','onLogout:clearRead'])assert.ok(manager.includes(s),s);
 assert.doesNotMatch(manager,/fetch\s*\(|localStorage|sessionStorage|service_role/);
 assert.match(managerHtml,/id="testAuthMount"/);
 assert.match(managerHtml,/data-view="finance" hidden/);
});
test('Player shell maps actual TEST bootstrap dateLabel and myStatus, no fabricated startedAt or RSVP write',()=>{
 assert.match(player,/readTestRpc\(session,'cc_v2_player_read_v1'/);
 for(const s of ['data.bootstrap.player','payload.notifications','event.dateLabel','event.timeLabel','event.myStatus','controller?.abort','onLogout:clearData'])assert.ok(player.includes(s),s);
 assert.doesNotMatch(player,/fetch\s*\(|localStorage|sessionStorage|service_role/);
 assert.match(playerHtml,/data-view="standings" hidden/);
});
test('one TEST-only auth component is used by both new PWAs',()=>{
 for(const src of [manager,player])assert.match(src,/mountTestAuth\(/);
 assert.match(client,/szzoubvhlwnojtzqjebc\.supabase\.co/);
 assert.doesNotMatch(client,/snqsxlyhontaepembaic|https:\/\/[^']*pages\.dev/);
 assert.match(client,/ALLOWED_READ_RPC/);
 assert.match(auth,/createTestAuthSession/);
 assert.doesNotMatch(auth,/innerHTML\s*=\s*[^;]*\$\{/);
});
