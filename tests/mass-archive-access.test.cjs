/* Past mass trainings are available under training permissions, with date lookup. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const sql=fs.readFileSync(path.join(__dirname,'..','supabase/migrations/20261015211000_cc_manager_mass_training_history_v1.sql'),'utf8');
const a=app.indexOf('  function massVisibleTrainingRows_('),b=app.indexOf('  function renderMassTrainings(',a);
assert.ok(a>0&&b>a);
const select=new Function('localDateKey','eventStart','text',app.slice(a,b)+';return massVisibleTrainingRows_;')(
 d=>d instanceof Date?d.toISOString().slice(0,10):'',
 x=>x.startsAt?new Date(x.startsAt):null,
 x=>String(x??'')
);
const live=[
 {eventId:'20261015-HA-01',level:'Haladó',startsAt:'2026-10-15T18:00:00+02:00'},
 {eventId:'20261016-KH-01',level:'Középhaladó',startsAt:'2026-10-16T18:00:00+02:00'}
];
const archive=[
 {eventId:'20261015-HA-01',level:'Haladó',startsAt:'2026-10-15T18:00:00+02:00'},
 {eventId:'20261014-HA-01',level:'Haladó',startsAt:'2026-10-14T18:00:00+02:00',active:false}
];
test('After midnight the Oct 15 black training is available in historical mode',()=>{
 const result=select(live.slice(1),archive,'past','2026-10-16');
 assert.deepEqual(result.map(x=>x.eventId),['20261015-HA-01','20261014-HA-01']);
 assert.ok(result.every(x=>x.__archived===true));
});
test('Choosing Oct 15 finds the archived training regardless of the period mode',()=>{
 const result=select(live.slice(1),archive,'upcoming','2026-10-16','2026-10-15');
 assert.deepEqual(result.map(x=>x.eventId),['20261015-HA-01']);
 assert.equal(result[0].level,'Haladó');
});
test('Specific day selection deduplicates live and archived event IDs',()=>{
 const rows=select(live,archive,'all','2026-10-15','2026-10-15');
 assert.deepEqual(rows.map(x=>x.eventId),['20261015-HA-01']);
});
test('Inactive past trainings remain available in the archive',()=>{
 const result=select(live.slice(1),archive,'past','2026-10-16');
 assert.equal(result.find(x=>x.eventId==='20261014-HA-01')?.active,false);
});
test('Past archive uses train permission rather than the calendar-only RPC',()=>{
 const fn=app.slice(app.indexOf('  async function loadMassArchive(){'),app.indexOf('  async function loadMassAthletes()'));
 assert.ok(fn.includes("can('mass.trainings')"));
 assert.ok(fn.includes("cc_manager_mass_training_history_v1"));
 assert.ok(fn.includes("cc_manager_mass_calendar_v1"));
 assert.ok(fn.indexOf("can('mass.trainings')") < fn.indexOf("cc_manager_mass_training_history_v1"));
 assert.ok(fn.includes("end&&end.getTime()<Date.now()"));
 assert.ok(sql.includes("private.cc_manager_require_any_v1('mass.trainings','view')"));
 assert.ok(!sql.includes("'mass.calendar','view'"));
 assert.ok(sql.includes("upper(coalesce(e.session_type,'')) <> 'VERSENYSPORT'"));
 assert.ok(sql.includes("coalesce(e.active,false)"));
 assert.ok(sql.includes("b.source_workbook_id=e.source_workbook_id"));
 assert.ok(sql.includes("w.source_workbook_id=e.source_workbook_id"));
 assert.match(sql,/revoke all on function [^;]+ from public, anon/);
 assert.match(sql,/grant execute on function [^;]+ to authenticated/);
 assert.ok(!/\b(update|delete|insert)\s+(public\.|into)/i.test(sql));
});
test('Date filter and visible archive shortcut retain training-detail navigation',()=>{
 const screen=app.slice(b,app.indexOf('  function massAttendanceModel_',b));
 assert.ok(screen.includes('id="massTrainingsPastQuick"'));
 assert.ok(screen.includes('id="massTrainingDate"'));
 assert.ok(screen.includes("state.massTrainingDate=e.target.value"));
 assert.ok(screen.includes("massVisibleTrainingRows_(state.massTrainings,state.massArchiveEvents,mode,localDateKey(new Date()),state.massTrainingDate)"));
 assert.ok(screen.includes('massLegacyTrainingRow(e,{archived:!!e.__archived})'));
 assert.ok(app.includes('data-mass-detail='));
 assert.ok(app.includes("$('#massEventEditBtn')?.addEventListener('click'"));
});

test('Archive retains calendar-only fallback without granting training rights',()=>{
 const load=app.slice(app.indexOf('  async function loadMassArchive(){'),app.indexOf('  async function loadMassAthletes()'));
 const f=new Function('can','rpc','state','localDateKey','safeDate','eventStart',
   load+';return loadMassArchive;');
 const allowed=[];
 const state={massArchiveEvents:[]};
 const training=f(v=>v==='mass.trainings',
   async(name)=>{allowed.push(name);return [];},state,d=>'2026-10-15',x=>new Date(x),x=>new Date(x.startsAt));
 const calendar=f(v=>v==='mass.calendar',
   async(name)=>{allowed.push(name);return [];},state,d=>'2026-10-15',x=>new Date(x),x=>new Date(x.startsAt));
 return training().then(()=>calendar()).then(()=>{
   assert.deepEqual(allowed,['cc_manager_mass_training_history_v1','cc_manager_mass_calendar_v1']);
 });
});
