'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
const start=source.indexOf('  const ccMassRulesMeta_=');
const end=source.indexOf('  function renderMassTrainings()',start);
assert.ok(start>=0&&end>start,'Advanced rule module must be in TEST Manager source');
const fragment=source.slice(start,end);
const escaped=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const build=new Function('esc','rpc','status','text','window',fragment+'\nreturn {specs:ccMassRulesMeta_,render:ccMassRulesPanelHtml_,load:ccMassRulesPanelLoad_};');
const api=build(escaped,async()=>{},()=>{},String,{confirm:()=>true});
const defaults={
 bookingCloseMinutes:120,waitlistCloseMinutes:40,lateCancelMinutes:360,
 cancellationCloseMinutes:-1,offerCloseMinutes:-1,acceptCloseMinutes:-1,
 offerValidMinutes:30,lateOfferWindowMinutes:60,lateOfferValidMinutes:10,
 waitlistLimit:5,waitlistEnabled:true,autoOfferEnabled:true
};
test('all 12 rules appear with independent offer and accept windows',()=>{
 assert.equal(api.specs.length,12);
 assert.ok(api.specs.some(x=>x[0]==='offerCloseMinutes'));
 assert.ok(api.specs.some(x=>x[0]==='acceptCloseMinutes'));
 assert.ok(api.specs.some(x=>x[0]==='lateCancelMinutes'));
});
test('global panel has per-field factory reset and full factory reset',()=>{
 const html=api.render({defaults,globalOverrides:{bookingCloseMinutes:90},globalEffective:{...defaults,bookingCloseMinutes:90}},'GLOBAL');
 assert.match(html,/Gyári alapértékek visszaállítása/);
 assert.equal((html.match(/data-cc-rule-reset="/g)||[]).length,12);
 assert.match(html,/value="90"/);
 assert.doesNotMatch(html,/data-cc-rule-custom/);
});
test('event panel inherits global except independently overridden rule',()=>{
 const html=api.render({defaults,globalEffective:defaults,eventOverrides:{waitlistCloseMinutes:25},effective:{...defaults,waitlistCloseMinutes:25}},'EVENT');
 assert.match(html,/Globális alapértékek visszaállítása/);
 assert.equal((html.match(/data-cc-rule-custom="/g)||[]).length,12);
 assert.match(html,/data-cc-rule="waitlistCloseMinutes"[^>]*value="25"/);
 assert.match(html,/data-cc-rule="bookingCloseMinutes"[^>]*disabled/);
});
test('global controls and event details exist in trainings UI without exposing anon write',()=>{
 assert.match(source,/id="massTrainingRulesToggle"/);
 assert.match(source,/id="massGlobalAdvancedRulesPanel"/);
 assert.match(source,/id="massEventAdvancedRulesBody"/);
 assert.match(fragment,/cc_manager_mass_rules_patch_v1/);
 assert.match(fragment,/cc_manager_mass_rules_reset_v1/);
 assert.match(fragment,/p_key:key/);
 assert.match(fragment,/scope==='EVENT'&&!custom\?\.checked/);
 assert.match(fragment,/scope==='GLOBAL'&&value===info\.defaults\[key\]/);
});
