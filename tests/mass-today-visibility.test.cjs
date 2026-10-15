/* A completed training must remain editable in today's training list. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const src=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const from=src.indexOf('  function massVisibleTrainingRows_('),to=src.indexOf('  function renderMassTrainings()',from);
assert.ok(from>=0&&to>from,'Current-day list helper exists in real Manager app');
const select=new Function('localDateKey','eventStart','text',src.slice(from,to)+';return massVisibleTrainingRows_;')(
 d=>d instanceof Date?d.toISOString().slice(0,10):'',x=>x.startsAt?new Date(x.startsAt):null,x=>String(x??'')
);
const live=[
 {eventId:'20261015-HA-01',level:'Haladó',startsAt:'2026-10-15T18:00:00+02:00',endsAt:'2026-10-15T20:00:00+02:00'},
 {eventId:'20261016-KE-01',level:'Kezdő',startsAt:'2026-10-16T17:30:00+02:00'},
 {eventId:'20261014-HA-01',level:'Haladó',startsAt:'2026-10-14T18:00:00+02:00'}
];
const archive=[
 {eventId:'20261015-HA-01',startsAt:'2026-10-15T18:00:00+02:00'},
 {eventId:'20261014-HA-01',startsAt:'2026-10-14T18:00:00+02:00'}
];
test('Today 18–20 Haladó stays in current list even after 20:00',()=>{
 const result=select(live,archive,'upcoming','2026-10-15');
 assert.deepEqual(result.map(x=>x.eventId),['20261015-HA-01','20261016-KE-01']);
 assert.equal(result[0].__archived,false);
});
test('Yesterday disappears from current training list after midnight',()=>{
 const result=select(live,archive,'upcoming','2026-10-16');
 assert.deepEqual(result.map(x=>x.eventId),['20261016-KE-01']);
});
test('All-time view does not show completed same-day session twice',()=>{
 const result=select(live,archive,'all','2026-10-15');
 assert.equal(result.filter(x=>x.eventId==='20261015-HA-01').length,1);
 assert.equal(result.length,3);
 assert.equal(result.find(x=>x.eventId==='20261014-HA-01').__archived,true);
});
test('Past view still exposes archived sessions and preserves sort newest-first',()=>{
 const result=select(live,archive,'past','2026-10-15');
 assert.deepEqual(result.map(x=>x.eventId),['20261015-HA-01','20261014-HA-01']);
});
test('Rendered Manager UI retains training details and editing action',()=>{
 const view=src.slice(to,src.indexOf('  function massAttendanceModel_',to));
 assert.ok(view.includes('massVisibleTrainingRows_(state.massTrainings,state.massArchiveEvents,mode,localDateKey(new Date()),state.massTrainingDate)'));
 assert.ok(view.includes('massLegacyTrainingRow(e,{archived:!!e.__archived})'));
 assert.ok(src.includes("$('#massEventEditBtn')?.addEventListener('click'"));
 assert.ok(src.includes("openMassEventEditor_(eventId)"));
 assert.ok(src.includes("cc_manager_mass_event_save_v1"));
 assert.ok(src.includes('LEZAJLOTT'));
});
