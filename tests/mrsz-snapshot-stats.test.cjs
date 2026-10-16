/* MRSZ snapshot stats: present only grounded numbers, never synthetic form. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const start=app.indexOf('  function ccSavedLeagueResults_('),
  end=app.indexOf('  function renderManagerStandings_()',start);
assert.ok(start>=0&&end>start,'snapshot renderer present');
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const ratio=(explicit,a,b)=>{const x=Number(explicit);if(Number.isFinite(x)&&x!==0)return x.toFixed(3);const aa=Number(a),bb=Number(b);if(a==null||b==null||!Number.isFinite(aa)||!Number.isFinite(bb)||aa===0&&bb===0)return'–';if(bb===0)return aa>0?'∞':'–';return(aa/bb).toFixed(3)};
const render=new Function('text','esc','msRatio_','ccMrszNormPairName_',app.slice(start,end)+';return ccVerifiedSnapshotStatsHtml_;')(
 x=>String(x??'').trim(),esc,ratio,x=>String(x??'').trim().toLowerCase());
const beac={sourceTeamId:'299',focus:true,teamName:'BEAC',played:3,wins:2,losses:1,setsFor:7,setsAgainst:4};
const other={sourceTeamId:'900',focus:false,teamName:'Ellenfél',played:3,wins:1,losses:2,setsFor:4,setsAgainst:7};
test('Official saved snapshot shows only recorded match/sets totals for BEAC',()=>{
 const html=render([other,beac],null,{partial:false});
 for(const str of ['Statisztikák','Mérkőzések','Mérleg','Szettmérleg','Szettarány','7–4','2–1','1.750','BEAC','Mentett MRSZ-tabella'])assert.ok(html.includes(str),str);
 assert.ok(!html.includes('Legjobb forma'));
 assert.ok(!html.includes('↑'));
 assert.ok(!html.includes('↓'));
});
test('Selected league team overrides default BEAC focus',()=>{
 const html=render([beac,other],other,{partial:false});
 assert.ok(html.includes('Ellenfél'));
 assert.ok(html.includes('1–2'));
 assert.ok(!html.includes('<span>BEAC</span>'));
});
test('Partial saved table explicitly labels data as partial and never invents rank',()=>{
 const html=render([beac],null,{partial:true});
 assert.ok(html.includes('Részleges, rögzített eredmények'));
 assert.ok(!html.includes('Helyezés</span>'));
});
test('No proven selected/focus team means no made-up default team statistics',()=>{
 assert.equal(render([other],null,{partial:false}),'');
 assert.equal(render([beac],null,null),'');
});
test('Unknown data is shown as unavailable, not zero',()=>{
 const html=render([{...beac,wins:null,losses:null,setsFor:null,setsAgainst:undefined}],null,{partial:false});
 assert.ok(html.includes('<span>Mérleg</span><b>–</b>'));
 assert.ok(html.includes('<span>Szettarány</span><b>–</b>'));
 assert.ok(!html.includes('0–0'));
});
test('Zero sets conceded uses the verified infinite ratio and 0-0 remains unknown',()=>{
 assert.ok(render([{...beac,setsFor:6,setsAgainst:0}],null,{partial:false}).includes('<b>∞</b>'));
 assert.ok(render([{...beac,setsFor:0,setsAgainst:0}],null,{partial:false}).includes('<span>Szettarány</span><b>–</b>'));
});
test('HTML entity encoding protects the selected team name',()=>{
 const html=render([{...beac,teamName:'<script>bad</script>'}],null,{partial:false});
 assert.ok(html.includes('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
});
test('Snapshot stats are wired to the existing league selector, not a second table',()=>{
 const from=app.indexOf('  function renderManagerStandings_()'),to=app.indexOf('  function msPositionDelta_(',from);
 const snippet=app.slice(from,to>from?to:from+8000);
 assert.ok(snippet.includes('ccLeagueContextSelectHtml_(group)'));
 assert.ok(snippet.includes('showPhoto?ccVerifiedSnapshotStatsHtml_(rows,selected,photo,group,ccMrszPhotoState_.matches)'));
 assert.ok(snippet.includes("ccMrszLeagueFixturePanelHtml_(group"));
 assert.ok(!snippet.includes('Legnagyobb feljövő'));
});

test('Saved MRSZ table is explicitly labelled as a dated non-live snapshot',()=>{
 const html=render([beac],null,{partial:false});
 assert.ok(html.includes('Pillanatkép: 2026.10.14.'));
 assert.ok(html.includes('Nem élő adat'));
 assert.ok(html.includes('külön frissítést igényelnek'));
});
test('Standings introduction and empty state never imply live automatic data updates',()=>{
 const from=app.indexOf('  function renderManagerStandings_()');
 const end=app.indexOf('  function msPositionDelta_(',from);
 const snippet=app.slice(from,end>from?end:from+12000);
 assert.ok(snippet.includes('const meta=showPhoto?[group,ccMrszCoverageLabel_(photo)]'));
 assert.ok(snippet.includes('ccMrszCoverageLabel_(null)'));
 assert.ok(snippet.includes('Még nincs tabellaadat'));
 assert.ok(!snippet.includes('Aktuális bajnoki állás'));
 assert.ok(!snippet.includes('itt automatikusan megjelenik'));
});

test('Foreign selected team is never rendered in a different league',()=>{
 const foreign={...other,sourceTeamId:'foreign-999',teamName:'Másik bajnokság'};
 assert.equal(render([beac],foreign,{partial:false}),'');
 assert.ok(!render([beac],foreign,{partial:false}).includes('Másik bajnokság'));
});
test('Duplicate source identifiers never select an ambiguous team',()=>{
 const duplicate={...other,sourceTeamId:beac.sourceTeamId};
 assert.equal(render([beac,duplicate],beac,{partial:false}),'');
});
test('Invalid fractional or negative snapshot counters are unavailable',()=>{
 const html=render([{...beac,played:2.5,wins:-1,losses:1,setsFor:1.5,setsAgainst:2}],null,{partial:false});
 assert.ok(html.includes('<span>Mérkőzések</span><b>–</b>'));
 assert.ok(html.includes('<span>Mérleg</span><b>–</b>'));
 assert.ok(html.includes('<span>Szettmérleg</span><b>–</b>'));
 assert.ok(html.includes('<span>Szettarány</span><b>–</b>'));
});
