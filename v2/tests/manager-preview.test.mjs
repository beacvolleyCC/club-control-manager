import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const base=new URL('../apps/manager/',import.meta.url);
const html=readFileSync(new URL('index.html',base),'utf8');
const js=readFileSync(new URL('main.js',base),'utf8');
const fixture=await import(new URL('fixtures.js',base));
test('Manager preview has event, player and team modules',()=>{
 for(const id of ['events','players','teams','teamFilter','eventList','playerList','teamList'])assert.match(html,new RegExp('id="'+id+'"'));
});
test('preview is explicit about fake data and no database connection',()=>{
 assert.match(html,/DEMO ADATOK/);
 assert.doesNotMatch(js,/supabase|fetch\s*\(/i);
});
test('demo fixtures have consistent team references and distinct IDs',()=>{
 const teamIds=new Set(fixture.teams.map(t=>t.id));
 assert.equal(teamIds.size,fixture.teams.length);
 for(const e of fixture.events)assert.ok(teamIds.has(e.teamId));
 for(const p of fixture.players)assert.ok(teamIds.has(p.teamId));
});
