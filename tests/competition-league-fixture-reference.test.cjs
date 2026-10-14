const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const dataset=JSON.parse(fs.readFileSync('data/brsz_group_fixtures_2026_27_source.json','utf8'));
const begin=js.indexOf('// Competition schedule snapshot.');
const end=js.indexOf('  function renderCompetitionMatchCards_()',begin);
assert.ok(begin>=0&&end>begin,'snapshot-only UI helpers present');
const helpers=js.slice(begin,end);
const context={msLogoHtml_:(_id,name)=>'<span class="ms-monogram">'+String(name||'').slice(0,1)+'</span>',text:x=>String(x??''),esc:x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]))};
vm.createContext(context);
vm.runInContext(helpers+
 '\nthis.qa={html:ccLeagueFixturePanelHtml_,load:ccLoadLeagueFixtureSnapshot_,inject:(rows)=>{ccLeagueFixtureRows_=rows},setGroup:(name)=>{ccLeagueSelectedGroup_=name},setScope:(scope)=>{ccLeagueSnapshotScope_=scope},setPhoto:(matches)=>{ccMrszPhotoState_.matches=matches}};',context);
test('source snapshot declares itself non-live and not a verified complete league schedule',()=>{
 const html=context.qa.html();
 assert.match(html,/nem élő BRSZ/);
 assert.match(html,/nem teljes/);
 assert.match(html,/nem aktuális hivatalos/);
});
test('all three official BRSZ league links are present',()=>{
 const html=context.qa.html();
 for(const id of ['1121','1146','1137'])assert.ok(html.includes('bajnoksag_id='+id));
});
test('snapshot lists only the three configured league contexts',()=>{
 const allowed=new Set(['Női I. osztály','Női II. osztály B csoport','Férfi I. osztály B csoport']);
 const rows=dataset.fixtures.filter(f=>allowed.has(f.group));
 assert.ok(rows.length>=30,'reference fixture source has data');
 context.qa.inject(rows);
 const html=context.qa.html();
 assert.match(html,/Bajnoki menetrend/);
 assert.ok(html.includes('BEAC II.'));
 assert.ok(!html.includes('BDG – BDTSE Taksony'),'out-of-context league row should not be shown');
});
test('group filter never mixes in other league rows',()=>{
 context.qa.setGroup('Női II. osztály B csoport');
 const html=context.qa.html();
 assert.ok(html.includes('BEAC II.'));
 assert.ok(!html.includes('MAFC-Schönherz'));
});
test('ambiguous rows display review warning rather than disappearing',()=>{
 context.qa.setGroup('all');
 context.qa.inject([{group:'Férfi I. osztály B csoport',date:null,time:null,home:'',away:'',venue:null,review:true}]);
 const html=context.qa.html();
 assert.match(html,/Ellenőrzendő/);
 assert.match(html,/Időpont nélkül/);
});
test('HTML-escape adversarial source names',()=>{
 context.qa.setScope('all');
 context.qa.inject([{group:'Női I. osztály',date:'2026-10-14',time:'18:30',home:'<script>x</script>',away:'A & B',venue:'<img>',review:false}]);
 const html=context.qa.html();
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('<img>'));
});
test('match page uses separate full-season period, without mutating training filter',()=>{
 const start=js.indexOf('  function renderCompetitionMatchCards_()');
 const end=js.indexOf('  function renderEventList(',start);
 const code=js.slice(start,end);
 assert.ok(code.includes("state.ccMatchPeriod||'all'"));
 assert.ok(code.includes("state.ccMatchPeriod=e.target.value"));
 assert.ok(!code.includes('state.eventPeriod=e.target.value'));
 assert.ok(code.includes('ccLeagueFixturePanelHtml_()'));
 assert.ok(css.includes('.cc-league-fixture-row'));
});
test('BEAC-only is the default and all-league toggle restores opponent fixtures',()=>{
 const rows=dataset.fixtures.filter(f=>f.group==='Női II. osztály B csoport');
 context.qa.inject(rows);context.qa.setGroup('Női II. osztály B csoport');context.qa.setScope('beac');
 const beac=context.qa.html();
 assert.ok(beac.includes('data-league-snapshot-scope="beac" aria-pressed="true"'));
 assert.ok(beac.includes('BEAC II.'));
 const beacCards=(beac.match(/class="cc-match-scoreboard /g)||[]).length;
 context.qa.setScope('all');
 const all=context.qa.html(),allCards=(all.match(/class="cc-match-scoreboard /g)||[]).length;
 assert.ok(allCards>beacCards,'all league scope must show more fixtures than BEAC-only');
 assert.ok(all.includes('RKSK felnőtt női'));
 context.qa.setScope('beac');context.qa.setGroup('all');
});
test('only an exact Budapest-date and opponent match overlays archival MRSZ results',()=>{
 const rows=dataset.fixtures.filter(f=>f.group==='Női II. osztály B csoport');
 context.qa.inject(rows);context.qa.setGroup('Női II. osztály B csoport');context.qa.setScope('all');
 context.qa.setPhoto([{competitionLabel:'Női Budapest II. osztály – B csoport',
  homeName:'MTK kék',awayName:'RKSK felnőtt női',startsAt:'2026-10-13T18:20:00+02:00',
  homeSets:3,awaySets:0,setScores:[{home:25,away:18}]}]);
 const html=context.qa.html();
 assert.ok(html.includes('3–0'));
 assert.ok(html.includes('Szettek: 25:18'));
 assert.ok(html.includes('MRSZ · 2026.10.14-i eredmény'));
 context.qa.setPhoto([]);context.qa.setScope('beac');context.qa.setGroup('all');
});
