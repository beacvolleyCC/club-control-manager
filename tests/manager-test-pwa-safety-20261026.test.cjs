'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const read=name=>fs.readFileSync(name,'utf8');
const cfg=read('config.js'),html=read('index.html'),app=read('app.js'),worker=read('sw.js');
const m=JSON.parse(read('manifest.webmanifest'));
test('Manager phone test is marked and has its own iOS icons',()=>{
 assert.equal(m.short_name,'MGR TEST');
 assert.ok(m.id.includes('manager-test-'));
 assert.match(html,/CC MANAGER TEST · DEMÓ · NEM ÉLES/);
 for(const n of [180,192,512])assert.ok(fs.statSync('icons/cc-manager-test-'+n+'.png').size>1000);
 assert.match(html,/cc-manager-test-180\.png/);
});
test('TEST demo is disconnected and rejects all non-staging Supabase URLs',()=>{
 assert.match(cfg,/TEST_ONLY:true/);
 assert.match(cfg,/DATA_MODE:'demo'/);
 assert.match(cfg,/SUPABASE_URL:''/);
 assert.match(cfg,/SUPABASE_PUBLISHABLE_KEY:''/);
 assert.match(app,/cfg\.STAGING_REF==='szzoubvhlwnojtzqjebc'/);
 assert.match(app,/cfg\.SUPABASE_URL\)==='https:\/\/szzoubvhlwnojtzqjebc\.supabase\.co'/);
 assert.match(app,/state\.mode==='demo'[\s\S]*?useDemo\(\)/);
 assert.doesNotMatch(cfg,/snqsxlyhontaepembaic|sb_secret_|service_role/);
 assert.doesNotMatch(html,/https:\/\/\*\.supabase\.co|wss:\/\/\*\.supabase\.co/);
});
test('TEST Service Worker and browser Auth/session storage do not collide with production',()=>{
 assert.match(worker,/cc-manager-test-20261026-demo-v1/);
 assert.match(worker,/keys\.filter\(key=>key\.startsWith\('cc-manager-test-'\)/);
 assert.match(app,/cc-manager-test-auth-session-v1/);
 assert.match(app,/cc-manager-test-20261026:/);
 assert.doesNotMatch(app,/(?<!window\.)\blocalStorage\.(?:getItem|setItem|removeItem)\(/);
});
test('future Pages deploy remains isolated to a second GitHub repo and does not include private project files',()=>{
 const w=read('.github/workflows/cc-manager-test-pages.yml');
 assert.match(w,/github\.repository == 'beacvolleyCC\/club-control-manager-test'/);
 assert.doesNotMatch(w,/cp -r data|supabase\/migrations|\.sql\s+_site|cp -r docs/);
});

test('safe public export manifest excludes archived data, SQL migrations and secrets',()=>{
 const s=read('scripts/export-manager-test-pages.ps1');
 assert.match(s,/Target must be empty except for the .git directory/);
 assert.match(s,/CC Manager TEST: export ONLY vetted/);
 assert.doesNotMatch(s,/Copy-Item.+?data(?:\/|')/);
 assert.doesNotMatch(s,/Copy-Item.+?supabase\/migrations/);
 assert.match(s,/Copy-Item -LiteralPath \$in -Destination \$to/);
});
