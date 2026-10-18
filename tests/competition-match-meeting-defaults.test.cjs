const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const s=fs.readFileSync('app.js','utf8');
test('home court and meeting defaults are explicit and editable',()=>{
 const a=s.indexOf('  function ccMatchDefaultMeeting_('),b=s.indexOf('  function openCompetitionEventEditor(',a);
 assert.ok(a>0&&b>a);
 const fn=new Function(s.slice(a,b)+';return ccMatchDefaultMeeting_;')();
 assert.equal(fn('home','20:30'),'18:30');
 assert.equal(fn('away','20:30'),'19:30');
 assert.equal(fn('away','18:00'),'17:00');
 assert.ok(s.includes("text(teamId)==='10000000-0000-4000-8000-000000000002'?'2':'3'"));
 assert.ok(s.includes("$('#ceMeetingTime')"));
});
