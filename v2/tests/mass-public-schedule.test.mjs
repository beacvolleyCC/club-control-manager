import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {readPublicMassSchedule,validateScheduleWindow} from '../frontend-next/shared/mass-schedule.js';
const src=readFileSync(new URL('../frontend-next/shared/mass-schedule-ui.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../frontend-next/mass/index.html',import.meta.url),'utf8');
const fake={schemaVersion:1,domain:'mass',events:[{eventId:'qa',date:'2026-11-15',startTime:'18:00:00',endTime:'19:30:00',level:'Kezdő',court:'A',capacity:24,remaining:3,waitlistCount:1,bookingOpen:true,waitlistOpen:false}]};
test('public schedule read only and privacy-safe',async()=>{
 const seen=[];
 const result=await readPublicMassSchedule({request:async(url,opts)=>{seen.push({url,opts});return {ok:true,json:async()=>fake}}});
 assert.equal(result.length,1);assert.equal(result[0].remaining,3);
 assert.ok(seen[0].url.endsWith('/rest/v1/rpc/cc_v2_mass_public_schedule_v1'));
 assert.equal(seen[0].opts.method,'POST');assert.ok(!seen[0].opts.headers.Authorization);
 assert.deepEqual(Object.keys(result[0]).sort(),['date','endTime','startTime','level','court','eventId','capacity','remaining','waitlistCount','bookingOpen','waitlistOpen'].sort());
 for(const privateField of ['email','name','passNumber','legacy_row','note','cancellation_token'])assert.ok(!(privateField in result[0]));
});
test('fail-closed malformed response and private fields are not emitted',async()=>{
 await assert.rejects(readPublicMassSchedule({request:async()=>({ok:true,json:async()=>({...fake,events:[{...fake.events[0],remaining:25}]})})}),/INVALID_EVENT/);
 await assert.rejects(readPublicMassSchedule({request:async()=>({ok:true,json:async()=>({...fake,schemaVersion:2})})}),/INVALID_RESPONSE/);
 await assert.rejects(readPublicMassSchedule({request:async()=>({ok:false,status:403})}),/HTTP_403/);
});
test('bounded date window protects the public endpoint',()=>{
 assert.deepEqual(validateScheduleWindow(),{p_from:null,p_to:null});
 assert.throws(()=>validateScheduleWindow('2026-11-01','2027-01-01'),/INVALID_WINDOW/);
 assert.throws(()=>validateScheduleWindow('2026-13-01',''),/INVALID_DATE/);
});
test('both Player and standalone web mount the same shared widget',()=>{
 assert.match(html,/massPublicMount/);assert.match(html,/mass-schedule.css/);
 assert.match(src,/mountPublicMassSchedule/);assert.match(src,/readPublicMassSchedule/);
 assert.doesNotMatch(src,/service_role|\.innerHTML\s*=|insertAdjacentHTML/);
 const player=readFileSync(new URL('../frontend-next/player/index.html',import.meta.url),'utf8');
 assert.match(player,/massPublicMount/);
});
