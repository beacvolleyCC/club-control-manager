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
});
test('upcoming and unscored matches never show invented results',()=>{
 for(const m of [{...fixture,homeSets:null,awaySets:null},{...fixture,homeSets:0,awaySets:0}]){
   const html=ctx.scoreboard(m);
   assert.ok(html.includes('– : –'));
   assert.ok(!html.includes('0–0'));
   assert.ok(!html.includes('Szettek:'));
 }
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
