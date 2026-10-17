const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8'),css=fs.readFileSync('styles.css','utf8');
const begin=js.indexOf('  function ccMatchScoreboardRank_(');
const end=js.indexOf('  function ccMrszMergedLeagueMatches_(',begin);
assert.ok(begin>0&&end>begin);
const ctx={
 text:x=>String(x??'').trim(),
 esc:x=>String(x??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch])),
 msLogoHtml_:(id,name)=>'<span class="ms-monogram">'+String(name).slice(0,1)+'</span>',
 ccMrszLocalKickoff_:x=>({date:String(x||'').slice(0,10),time:String(x||'').slice(11,16)}),
 ccMrszPhotoState_:{tables:[]},
 ccMrszNormPairName_:name=>String(name||'').toLowerCase()
};
vm.createContext(ctx);
vm.runInContext(js.slice(begin,end)+'\nthis.scoreboard=ccMatchScoreboardHtml_;',ctx);
const fixture={homeName:'BEAC II.',awayName:'UTE',startsAt:'2026-10-13T19:30:00',
 venue:'Bogdánfy u. 10/B.',competitionLabel:'Női Budapest II. osztály – B csoport'};
test('played match shows prominent outcome and set-by-set scores',()=>{
 const html=ctx.scoreboard({...fixture,homeSets:3,awaySets:1,setScores:[{home:25,away:19},{home:25,away:20},{home:16,away:25},{home:25,away:14}]});
 for(const expected of ['BEAC II.','UTE','3–1','25:19','16:25','19:30','Bogdánfy'])
   assert.ok(html.includes(expected),expected);
 assert.ok(html.includes('is-played'));
 assert.ok(html.includes('<span class="cc-scoreboard-set-results"'));
 assert.ok(html.includes('25:19 · 25:20 · 16:25 · 25:14'));
 assert.ok(html.includes('<small class="cc-scoreboard-set-coverage">4/4 szett</small>'));
 assert.ok(html.indexOf('<strong>3 – 1</strong>')<html.indexOf('cc-scoreboard-set-results'));
 assert.ok(!html.includes('Szettek:'));
 assert.ok(!html.includes('Végeredmény'));
 assert.ok(!html.includes('Következő meccs'));
});
test('upcoming and unscored matches display regular-weight VS. instead of score placeholders',()=>{
 for(const m of [{...fixture,homeSets:null,awaySets:null},{...fixture,homeSets:0,awaySets:0},{...fixture,homeSets:3,awaySets:null}]){
   const html=ctx.scoreboard(m);
   assert.ok(html.includes('<span class="cc-scoreboard-versus">VS.</span>'));
   assert.ok(!html.includes('– : –'));
   assert.ok(!html.includes('0–0'));
   assert.ok(!html.includes('<strong>VS.</strong>'));
   assert.ok(!html.includes('cc-scoreboard-set-results'));
   assert.ok(!html.includes('Szettek:'));
   assert.ok(!html.includes('Következő meccs'));
   assert.ok(html.includes('is-upcoming'));
 }
 const past=ctx.scoreboard({...fixture,homeSets:null,awaySets:null},{past:true});
 assert.ok(past.includes('<span class="cc-scoreboard-versus">VS.</span>'));
 assert.ok(!past.includes('Eredmény még nincs'));
 assert.ok(!past.includes('Következő meccs'));
});
test('completed results stay bold and upcoming VS. styling stays nonbold on desktop and mobile',()=>{
 const played=ctx.scoreboard({...fixture,homeSets:3,awaySets:2});
 assert.ok(played.includes('<strong>3 – 2</strong>'));
 assert.ok(!played.includes('cc-scoreboard-versus'));
 assert.ok(css.includes('.cc-scoreboard-score>.cc-scoreboard-versus{'));
 assert.match(css,/\.cc-scoreboard-score>\.cc-scoreboard-versus\{[^}]*font-weight:400;/);
 assert.ok(css.includes('font-size:clamp(18px,1.8vw,23px)'));
 assert.ok(css.includes('.cc-scoreboard-set-results{'));
 assert.ok(!css.includes('.cc-scoreboard-sets{'));
 assert.ok(!css.includes('.cc-scoreboard-score>small{'));
 assert.ok(css.includes('@media(max-width:700px)'));
 assert.ok(css.includes('@media(max-width:430px)'));
});
test('linked match retains its event ID and live RSVP count',()=>{
 const html=ctx.scoreboard({...fixture,homeSets:null,awaySets:null},{eventId:'match-id',meta:'12 jövök / 14 kerettag',badge:'Hazai meccs'});
 assert.ok(html.startsWith('<button'));
 assert.ok(html.includes('data-event-id="match-id"'));
 assert.ok(html.includes('12 jövök / 14 kerettag'));
 assert.ok(js.includes("kind==='match'?ccManagerScoreboardCard_(e):ccEventCardHtml_(e,kind)"));
 assert.ok(js.includes('ccTrainingInlinePreviewHtml_(cached,id,editable,attendanceEditable)'));
});
test('league-only cards escape source names and disallow unsafe URLs',()=>{
 const html=ctx.scoreboard({...fixture,homeName:'<script>alert(1)</script>',homeSets:3,awaySets:1},{sourceUrl:'javascript:alert(1)'});
 assert.ok(html.startsWith('<article'));
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
 assert.ok(!html.includes('href="javascript:'));
});
test('league rank appears only from an actual nonpartial standings snapshot',()=>{
 ctx.ccMrszPhotoState_.tables=[{competitionLabel:fixture.competitionLabel,partial:false,rows:[{teamName:'BEAC II.',position:2}]}];
 assert.ok(ctx.scoreboard({...fixture,homeSets:3,awaySets:1}).includes('2. helyen áll'));
 ctx.ccMrszPhotoState_.tables[0].partial=true;
 assert.ok(!ctx.scoreboard({...fixture,homeSets:3,awaySets:1}).includes('2. helyen áll'));
});
test('Manager Meccsek has one selected-league table above the preserved BEAC roster',()=>{
 const start=js.indexOf('  function renderCompetitionMatchCards_()'),end=js.indexOf('  function renderEventList(',start);
 const section=js.slice(start,end);
 assert.equal(section.split('ccLeagueMatchesContextHtml_()').length-1,1);
 assert.ok(!section.includes("standingsSection_('events')"));
 assert.ok(!section.includes('${ccMrszPhotoPanelHtml_()}'));
 assert.ok(section.indexOf('ccLeagueMatchesContextHtml_()')<section.indexOf('ccCompetitionEventWithRosterHtml_'));
 assert.ok(!section.includes('ccLeagueFixturePanelHtml_()'));
});
test('desktop and phone scoreboard styling remains responsive',()=>{
 assert.ok(css.includes('.cc-match-scoreboard{'));
 assert.ok(css.includes('.cc-scoreboard-main{'));
 assert.ok(css.includes('@media(max-width:700px)'));
 assert.ok(css.includes('@media(max-width:430px)'));
});

test('saved fixture shows match date in place of the Mentett menetrend label and time at right',()=>{
 const html=ctx.scoreboard({...fixture,homeSets:null,awaySets:null},{badge:'Mentett menetrend',dateInsteadOfBadge:true});
 assert.ok(html.includes('<span class="cc-scoreboard-label">2026-10-13</span>'));
 assert.ok(html.includes('<span class="cc-scoreboard-kickoff">19:30</span>'));
 assert.ok(!html.includes('Mentett menetrend'));
 assert.ok(!html.includes('Következő meccs'));
 assert.ok(html.includes('<span class="cc-scoreboard-versus">VS.</span>'));
 const normal=ctx.scoreboard({...fixture,homeSets:null,awaySets:null},{badge:'Hazai meccs'});
 assert.ok(normal.includes('<span class="cc-scoreboard-label">Hazai meccs</span>'));
 assert.ok(normal.includes('<span class="cc-scoreboard-kickoff">2026-10-13 · 19:30</span>'));
});
test('untrusted or invalid set-score content is quarantined from the central result area',()=>{
 const html=ctx.scoreboard({...fixture,homeSets:3,awaySets:1,setScores:[{home:'25',away:'19'},{home:'<img>',away:20}]},{eventId:'match-123'});
 assert.ok(html.includes('Szettadat ellenőrzendő'));
 assert.ok(!html.includes('<img>'));
 assert.ok(!html.includes('25:19 ·'));
 assert.ok(!html.includes('Szettek:'));
});


test('Contradictory linked set-point records are not presented as an agreed set breakdown',()=>{
 const html=ctx.scoreboard({...fixture,homeSets:3,awaySets:1,
   setScores:[{home:25,away:18},{home:25,away:19},{home:25,away:20},{home:15,away:25}]},{eventId:'id123'});
 assert.ok(html.includes('<strong>3 – 1</strong>'));
 assert.ok(html.includes('Szettadat ellenőrzendő'));
 assert.ok(!html.includes('25:18 · 25:19'));
});

test('saved set point coverage stays factual for missing, partial, full and invalid set lists',()=>{
 const all={...fixture,homeSets:3,awaySets:1,setScores:[
  {home:25,away:18},{home:17,away:25},{home:25,away:19},{home:25,away:23}
 ]};
 const full=ctx.scoreboard(all,{badge:'MRSZ · eredmény',meta:'2026.10.14-i mentett eredmény'});
 assert.ok(full.includes('4/4 szett'));
 assert.ok(full.includes('MRSZ · eredmény'));
 assert.ok(full.includes('2026.10.14-i mentett eredmény'));
 assert.ok(!full.includes('részleges'));
 const partial=ctx.scoreboard({...all,setScores:all.setScores.slice(0,2)});
 assert.ok(partial.includes('2/4 szett · részleges'));
 assert.ok(partial.includes('25:18 · 17:25'));
 const missing=ctx.scoreboard({...all,setScores:[]});
 assert.ok(missing.includes('Nincs rögzített szettpontszám'));
 assert.ok(!missing.includes('0/4 szett'));
 const noField=ctx.scoreboard({...all,setScores:undefined});
 assert.ok(noField.includes('Nincs rögzített szettpontszám'));
 const wrong=ctx.scoreboard({...all,setScores:[{home:25,away:25}]});
 assert.ok(wrong.includes('Szettadat ellenőrzendő'));
 assert.ok(!wrong.includes('25:25'));
 assert.ok(!wrong.includes('részleges'));
});
test('unplayed match remains VS. with no artificial set-point status',()=>{
 const html=ctx.scoreboard({...fixture,homeSets:null,awaySets:null});
 assert.ok(html.includes('cc-scoreboard-versus'));
 assert.ok(!html.includes('cc-scoreboard-set-coverage'));
 assert.ok(!html.includes('Nincs rögzített szettpontszám'));
 assert.ok(css.includes('.cc-scoreboard-set-coverage{'));
 assert.ok(css.includes('  .cc-scoreboard-set-coverage{font-size:8px;'));
});
