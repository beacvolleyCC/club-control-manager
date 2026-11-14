/* TEST public mass training schedule: one read-only API for web and Player. */
import {TEST_ORIGIN,TEST_PUBLISHABLE_KEY} from './test-rpc.js';

export const MAX_SCHEDULE_DAYS=45;
export function validateScheduleWindow(from='',to=''){
 const d=/^20\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/;
 if((from&&!d.test(from))||(to&&!d.test(to)))throw Error('CC_MASS_INVALID_DATE');
 if(from&&to&&(to<from||(Date.parse(to)-Date.parse(from))>MAX_SCHEDULE_DAYS*86400000))
  throw Error('CC_MASS_INVALID_WINDOW');
 return {p_from:from||null,p_to:to||null};
}
const safeEvent=e=>{
 if(!e||typeof e!=='object'||Array.isArray(e)||
  typeof e.eventId!=='string'||e.eventId.length>200||
  typeof e.date!=='string'||!/^20\d\d-\d\d-\d\d$/.test(e.date)||
  typeof e.startTime!=='string'||!/^\d\d:\d\d/.test(e.startTime)||
  !Number.isInteger(e.capacity)||e.capacity<0||
  !Number.isInteger(e.remaining)||e.remaining<0||e.remaining>e.capacity||
  !Number.isInteger(e.waitlistCount)||e.waitlistCount<0||
  typeof e.bookingOpen!=='boolean'||typeof e.waitlistOpen!=='boolean')
  throw Error('CC_MASS_INVALID_EVENT');
 const values=['date','endTime','startTime','level','court','eventId','capacity','remaining','waitlistCount','bookingOpen','waitlistOpen'];
 const copy=Object.create(null);
 for(const key of values)copy[key]=e[key]??null;
 return Object.freeze(copy);
};
export async function readPublicMassSchedule({from='',to='',request=fetch,signal}={}){
 const body=validateScheduleWindow(from,to);
 const res=await request(TEST_ORIGIN+'/rest/v1/rpc/cc_v2_mass_public_schedule_v1',{
  method:'POST',cache:'no-store',signal,
  headers:{apikey:TEST_PUBLISHABLE_KEY,'Content-Type':'application/json',Accept:'application/json'},
  body:JSON.stringify(body)
 });
 if(!res.ok)throw Error('CC_MASS_SCHEDULE_HTTP_'+res.status);
 const value=await res.json();
 if(!value||value.schemaVersion!==1||value.domain!=='mass'||!Array.isArray(value.events)||
  value.events.length>90)throw Error('CC_MASS_INVALID_RESPONSE');
 return Object.freeze(value.events.map(safeEvent));
}
