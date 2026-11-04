'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const css=fs.readFileSync(path.join(__dirname,'..','styles.css'),'utf8');
const js=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const begin=js.indexOf('function ccRosterPreviewState_(p)');
const end=js.indexOf('function ccCompactRosterRowHtml_',begin);
assert.ok(begin>=0&&end>begin,'competition presence render functions must exist');
const {preview,html}=new Function('text','esc',js.slice(begin,end)+'\nreturn {preview:ccRosterPreviewState_,html:ccCompetitionAttendanceSlider_};')(
  value=>String(value??''),value=>String(value??'')
);

test('confirmed attendance wins over an unanswered or contrary RSVP on initial render',()=>{
 const present={playerId:'QA-1',displayName:'Test 1',status:'unknown',attendanceStatus:'present'};
 const absent={playerId:'QA-2',displayName:'Test 2',status:'going',attendanceStatus:'absent'};
 assert.deepEqual(preview(present),{state:'yes',confirmed:true});
 assert.deepEqual(preview(absent),{state:'no',confirmed:true});
 assert.match(html(present,true),/data-slider-unconfirmed="0"/);
 assert.match(html(present,true),/cc-competition-attendance-slider yes/);
 assert.match(html(absent,true),/cc-competition-attendance-slider no/);
});
test('RSVP preview is never mistaken for confirmed coach attendance',()=>{
 const rsvp={playerId:'QA-3',displayName:'Test 3',status:'going'};
 assert.deepEqual(preview(rsvp),{state:'yes',confirmed:false});
 assert.match(html(rsvp,true),/data-slider-unconfirmed="1"/);
});
test('confirmed competition slides use CSS that overrides RSVP row tone in both views',()=>{
 for(const state of ['yes','no']){
  const selector='.is-confirmed .cc-competition-attendance-slider[data-slider-unconfirmed="0"][data-slider-state="'+state+'"]';
  assert.ok(css.includes(selector),state+' confirmed presentation must be explicit');
  assert.ok(css.includes('.dark :is(.cc-compact-roster-row,.cc-inline-player)'+selector),state+' dark mode must be explicit');
 }
 assert.match(js,/slider\.dataset\.sliderUnconfirmed=confirmed\?'0':'1'/);
 assert.match(js,/classList\.toggle\('is-confirmed',confirmed\)/);
});
test('mass presence colors are tied to saved state in the DOM',()=>{
 for(const state of ['yes','no']){
  const selector='.legacy-mass-roster-card .attendance-slider[data-manager-slider-kind="mass"][data-slider-state="'+state+'"]';
  assert.ok(css.includes(selector),state+' saved state');
  assert.ok(css.includes('.dark '+selector),state+' saved state dark mode');
 }
 assert.match(js,/ccSetPlayerStyleSliderState_\(slider,savedState\)/);
 assert.match(js,/data-manager-slider-kind="mass"/);
});
