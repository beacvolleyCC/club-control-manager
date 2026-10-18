'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const root='data/competition/2026-27/';
const lists=[['menA','men-a-fixtures.psv',40],['menB','men-b-fixtures.psv',41],['womenI','women-i-fixtures.psv',126],['womenIIA','women-ii-a-fixtures.psv',42],['womenIIB','women-ii-b-fixtures.psv',43]];
const file=p=>fs.readFileSync(p,'utf8');
const norm=s=>s.toLocaleLowerCase('hu').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');
test('imported complete league schedules preserve 292 fixtures, 8 results and distinct team identities',()=>{
 let rows=0,postponed=0;
 for(const [league,path,expected] of lists){
  const data=file(root+path).split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));
  assert.equal(data.length,expected,league);
  const unique=new Set();
  for(const line of data){
   const [date,home,away,venue]=line.split('|');
   assert.ok(home&&away&&venue,line);
   if(date==='POSTPONED')postponed++;
   else assert.match(date,/^\d{2}\/\d{2} \d{2}:\d{2}$/);
   const key=date+'|'+norm(home)+'|'+norm(away);
   assert.ok(!unique.has(key),'duplicate source row '+key);
   unique.add(key);rows++;
  }
 }
 assert.equal(rows,292);
 assert.equal(postponed,5);
 const results=file(root+'verified-results.psv').split(/\r?\n/).filter(x=>x&&!x.startsWith('#'));
 assert.equal(results.length,8);
 for(const r of results){
  const [league,date,home,away,score,sets]=r.split('|');
  const [h,a]=score.split(':').map(Number);
  assert.ok(lists.some(x=>x[0]===league));
  assert.equal(sets.split(',').length,h+a,r);
 }
});
test('critical revised fixtures, aliases and league boundaries are retained',()=>{
 const men=file(root+'men-b-fixtures.psv');
 assert.ok(men.includes('10/19 19:30|BEAC|PDSE'));
 assert.ok(men.includes('11/18 20:00|Mozdulj SE|BEAC'));
 assert.ok(men.includes('02/08 19:30|BEAC|Mozdulj SE'));
 assert.ok(file(root+'women-ii-b-fixtures.psv').includes('10/20 19:30|BEAC II.|UTE U-20 Pink'));
 assert.ok(file(root+'women-i-fixtures.psv').includes('11/10 19:30|BEAC|BEAC'));
 assert.ok(file('sql/competition_user_schedule_read_v1.sql').includes("p_system='user'"));
 assert.ok(file('sql/competition_user_schedule_import_20261018.sql').includes('enable row level security'));
});
test('source import never rewrites player attendance, archived federation data or notifications',()=>{
 const sql=file('sql/competition_user_schedule_import_20261018.sql')
 +file('sql/competition_user_schedule_read_v1.sql')
 +file('sql/competition_match_arrangements_v1.sql')
 +file('sql/competition_match_full_save_v1.sql');
 for(const forbidden of [/delete\s+from\s+public\.availability\b/i,/update\s+public\.availability\b/i,
 /delete\s+from\s+public\.events\b/i,/update\s+public\.events\b/i,
 /update\s+public\.competition_source_matches\b/i,/delete\s+from\s+public\.cc_competition_mrsz_screenshot_v1\b/i])
  assert.ok(!forbidden.test(sql),'should not mutate booked team events or original source');
});
