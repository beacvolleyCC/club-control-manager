import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const root=new URL('../frontend-next/player/',import.meta.url);
const html=readFileSync(new URL('index.html',root),'utf8');
const js=readFileSync(new URL('main.js',root),'utf8');
const css=readFileSync(new URL('player.css',root),'utf8');
const build=readFileSync(new URL('../scripts/build-preview.mjs',import.meta.url),'utf8');
test('new Player is independent and has meaningful accessible routes',()=>{
 for(const route of ['home','trainings','matches','standings','notifications','profile'])assert.match(html,new RegExp('href="#'+route+'"'));
 for(const id of ['playerNav','playerView','playerMenuToggle','playerDataStatus'])assert.match(html,new RegExp('id="'+id+'"'));
 assert.match(html,/lang="hu"/);assert.match(html,/aria-expanded="false"/);
 assert.match(js,/aria-current/);assert.match(js,/hashchange/);
 new Function(js);
});
test('new Player preview is non-writing and clearly separate from LIVE',()=>{
 assert.match(html,/TEST belépés szükséges/);assert.match(html,/id="testAuthMount"/);assert.match(js,/mountTestAuth/);assert.match(js,/cc_v2_player_read_v1/);
 assert.match(js,/nincs mentés/i);
 assert.doesNotMatch(js,/\bfetch\s*\(|localStorage|sessionStorage|service_role|supabase\.co/i);assert.match(html,/\.\.\/shared\/test-auth\.css/);
 assert.doesNotMatch(html,/snqsxlyhontaepembaic|szzoubvhlwnojtzqjebc|supabase\.co/i);
});
test('new Player uses shared tokens and responsive reduced-motion-safe styling',()=>{
 assert.match(html,/\.\.\/shared\/tokens\.css/);
 assert.match(css,/@media\(max-width:600px\)/);
 assert.match(build,/frontend-next\/player\//);
 assert.match(build,/cp\(resolve\(root,'frontend-next'\)/);
});
