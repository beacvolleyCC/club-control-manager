/* Editing mass training must not silently overwrite hidden event metadata. */
'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),
  fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const sql=fs.readFileSync(path.join(__dirname,'..','supabase/migrations/20261015234500_cc_manager_mass_event_save_safe_v2.sql'),'utf8');
const a=app.indexOf('  function massEventPayloadFromForm_(existing={})'),
  b=app.indexOf('  async function openMassEventEditor_(eventId=null)',a);
assert.ok(a>=0&&b>a,'extract real payload function');
const fields={
  '#meDate':{value:'2026-10-15'},'#meStart':{value:'18:00'},'#meEnd':{value:'20:00'},
  '#meSession':{value:'TÖMEGSPORT'},'#meCapacity':{value:'24'},
  '#meColor':{value:'#535353'},'#meLevel':{value:'HALADÓ'},
  '#meCourt':{value:'2. pálya'},'#meCancelHours':{value:'6'},
  '#meActive':{checked:true}
};
const render=new Function('$','ccNormalizeTime24_','text','massLevelColor',app.slice(a,b)+';return massEventPayloadFromForm_;')(
 selector=>fields[selector],v=>v,x=>String(x??'').trim(),()=> '#535353');
const existing={eventId:'20261015-HA-01',level:'Haladó',active:true,capacity:24,color:null,
  newLimit:24,oldLimit:6,publicRegistrationActive:false,teamId:'private_team',visibility:'PRIVATE'};
test('Editing existing training never sends hidden legacy limits, visibility or public gate',()=>{
 const out=render(existing);
 for(const k of ['oldLimit','newLimit','publicRegistrationActive','teamId','visibility']){
   assert.ok(!Object.hasOwn(out,k),k+' must stay server-controlled');
 }
 assert.equal(out.eventDate,'2026-10-15');
 assert.equal(out.capacity,24);
 assert.ok(!Object.hasOwn(out,'color'),'fallback color must not overwrite nullable stored color');
});
test('Intentionally choosing a different color sends an explicit color edit',()=>{
 fields['#meColor'].value='#112233';
 assert.equal(render(existing).color,'#112233');
 fields['#meColor'].value='#535353';
});
test('New training creation keeps existing creation contract',()=>{
 const created=render({});
 assert.equal(created.oldLimit,0);
 assert.equal(created.newLimit,24);
 assert.equal(created.publicRegistrationActive,true);
 assert.equal(created.color,'#535353');
 assert.equal(created.visibility,'PUBLIC');
});
test('Editor uses preserving edit RPC and avoids second write when active is unchanged',()=>{
 const editor=app.slice(b,app.indexOf('  function openMassAddAthlete_(',b));
 assert.ok(editor.includes("rpc('cc_manager_mass_event_save_safe_v2'"));
 assert.ok(editor.includes("if(base.active!==e.active)await rpc('cc_manager_mass_event_set_active_v1'"));
 assert.ok(editor.includes("if(can('mass.calendar'))reload.push(loadMassCalendar().catch"));
 assert.ok(editor.includes('e.capacity??e.totalLimit??18'));
 assert.ok(editor.includes("rpc('cc_manager_mass_event_save_v1',{p_event_id:null"));
});
test('Server wrapper preserves current database hidden fields under write-permission gate',()=>{
 assert.match(sql,/private\.cc_manager_require_any_v1\('mass\.trainings','edit'\)/);
 assert.match(sql,/from public\.mass_events e[\s\S]*for update/);
 assert.ok(sql.includes("'oldLimit',v_event.old_limit"));
 assert.ok(sql.includes("'newLimit',v_new_limit"));
 assert.ok(sql.includes("'publicRegistrationActive',v_event.public_registration_active"));
 assert.ok(sql.includes("'teamId',v_event.team_id"));
 assert.ok(sql.includes("'visibility',v_event.visibility"));
 assert.ok(sql.includes("when p_payload ? 'color'"));
 assert.ok(sql.includes('return public.cc_manager_mass_event_save_v1'));
 assert.match(sql,/revoke all on function public\.cc_manager_mass_event_save_safe_v2\(text,jsonb\) from public,anon/);
 assert.match(sql,/grant execute on function public\.cc_manager_mass_event_save_safe_v2\(text,jsonb\) to authenticated/);
});
