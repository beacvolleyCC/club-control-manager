'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
function section(start,end){
 const a=source.indexOf(start),b=source.indexOf(end,a+start.length);
 assert.ok(a>=0&&b>a, 'expected UI section '+start);
 return source.slice(a,b);
}
const mass=section('function massLegacyTrainingRow(','async function toggleMassInlineRoster_');
const binds=section('function bindMassLegacyRows()','function overviewMatrixWidth_()');
const competition=section('function ccCompetitionEventWithRosterHtml_','async function ccToggleTrainingInlineRoster_');
const compToggle=section('async function ccToggleTrainingInlineRoster_','function ccBindTrainingRosterToggles_');
const massDetail=section('async function openMassEventDetail(','async function toggleMassRegistrationGate(');
test('completed mass training offers a direct attendance editor for authorized coaches',()=>{
 assert.match(mass,/\(archived\|\|finished\)&&e\.active!==false&&canAction\('mass\.trainings','edit'\)/);
 assert.match(mass,/data-mass-attendance-open/);
 assert.match(mass,/Jelenlét szerkesztése/);
 assert.match(mass,/data-mass-roster-toggle/);
 assert.match(binds,/\[data-mass-attendance-open\]/);
 assert.match(binds,/openMassEventDetail\(b\.dataset\.massAttendanceOpen\)/);
});
test('past competition training retains an editable attendance roster, not just RSVP',()=>{
 assert.match(competition,/kind==='training'&&isEventPast\(e\)&&attendanceEditable/);
 assert.match(competition,/\$\{attendanceLabel\}/);
 assert.match(compToggle,/eventStart\(e\)<=new Date\(\)/);
 assert.match(compToggle,/ccBindCompetitionRoster_/);
});
test('old event detail still saves via canonical attendance RPC and has confirmed readback',()=>{
 assert.match(massDetail,/bindMassAttendanceSliders_\(eventId\)/);
 assert.match(source,/cc_manager_mass_attendance_r1_v1/);
 assert.match(source,/cc_manager_mass_attendance_snapshot_r1_v1/);
 assert.match(source,/ccSetPlayerStyleSliderState_\(slider,savedState\)/);
});
