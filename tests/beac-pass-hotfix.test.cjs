'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
test('BEAC import weekly match is loaded only with both permissions',()=>{
 assert.match(app,/if\(can\('mass\.passes'\)\)\{jobs\.push\(loadMassPasses/);
 assert.match(app,/if\(can\('mass\.trainings'\)\)jobs\.push\(loadMassWeeklyPassMatches_/);
 assert.match(app,/cc_manager_mass_weekly_pass_matches_v1/);
});
test('Athlete detail shows BEAC purchase and allows per-training pass edits',()=>{
 assert.match(app,/BEAC import vásárlás/);
 assert.match(app,/BEAC import bérletszám/);
 assert.match(app,/data-mass-athlete-pass-event/);
 assert.match(app,/matches\.length!==1/);
});
test('Training roster shows imported pass and audited edit actions',()=>{
 assert.match(app,/Importált szám átvétele/);
 assert.match(app,/Bérletszám javítása/);
 assert.match(app,/cc_manager_mass_booking_pass_number_set_v1/);
 assert.match(app,/p_reason:reason/);
 assert.match(app,/ELLENŐRZÉSRE VÁR/);
});
