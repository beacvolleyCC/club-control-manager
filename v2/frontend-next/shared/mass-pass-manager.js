/* V2 TEST: Manager-only pass sales / import delay controls. */
/* Uses existing Manager JWT, and the server enforces mass.passes view/edit. */
import {TEST_ORIGIN,TEST_PUBLISHABLE_KEY} from './test-rpc.js';
const requestRpc=async(session,name,args,request=fetch)=>{
 if(!session?.accessToken)throw Error('MASS_MANAGER_LOGIN_REQUIRED');
 const response=await request(TEST_ORIGIN+'/rest/v1/rpc/'+name,{
  method:'POST',cache:'no-store',
  headers:{apikey:TEST_PUBLISHABLE_KEY,Authorization:'Bearer '+session.accessToken,
   'Content-Type':'application/json',Accept:'application/json'},
  body:JSON.stringify(args)
 });
 if(!response.ok)throw Error('MASS_MANAGER_HTTP_'+response.status);
 const result=await response.json();
 if(result?.schemaVersion!==1)throw Error('MASS_MANAGER_INVALID_RESPONSE');
 return result;
};
export function readManagerPassSales(session,month,{request=fetch}={}){
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(String(month)))throw Error('MASS_MANAGER_MONTH_INVALID');
 return requestRpc(session,'cc_v2_manager_pass_sales_status_v1',{p_month:month},request);
}
export function setManagerPassSales(session,{month,state,graceUntil=null,reason=''},{request=fetch}={}){
 if(!/^20\d{2}-(0[1-9]|1[0-2])$/.test(String(month))||
  !['unknown','available','unavailable'].includes(state)||String(reason).length>800||
  (state!=='unavailable'&&graceUntil!==null))throw Error('MASS_MANAGER_POLICY_INVALID');
 return requestRpc(session,'cc_v2_manager_pass_sales_set_v1',{
  p_month:month,p_state:state,p_grace_until:graceUntil,p_reason:reason
 },request);
}
const mk=(tag,value)=>{const x=document.createElement(tag);if(value!==undefined)x.textContent=String(value);return x};
export function mountManagerPassSales(root,session,{month,request=fetch}={}){
 if(!root||!session?.accessToken)return;
 const section=mk('section'),heading=mk('h3','BEAC-bérletértékesítés · TEST');
 const status=mk('p','Állapot ellenőrzése…');status.setAttribute('role','status');
 const label=mk('label','Értékesítés állapota '),pick=mk('select');
 for(const [code,title] of [['unknown','Ismeretlen / ellenőrizendő'],['available','Bérletvásárlás elérhető'],['unavailable','Bérletvásárlás nem elérhető']]){
  const opt=mk('option',title);opt.value=code;pick.append(opt);
 }
 label.append(pick);
 const reasonLabel=mk('label','Indok '),reason=mk('input');reason.maxLength=800;reasonLabel.append(reason);
 const untilLabel=mk('label','Feltételes jelentkezés határideje '),until=mk('input');
 until.type='datetime-local';untilLabel.append(until);
 const submit=mk('button','Mentés');submit.type='button';submit.disabled=true;
 const note=mk('p','A jelenlegi szabály csak a bérletellenőrzési állapotot szabályozza; nem igazol fizetést.');
 section.append(heading,status,label,reasonLabel,untilLabel,submit,note);root.replaceChildren(section);
 let serial=0;
 const dateLocal=t=>{
  if(!t)return'';
  const d=new Date(t);if(!Number.isFinite(d.getTime()))return'';
  return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')+'T'+[d.getHours(),d.getMinutes()].map(x=>String(x).padStart(2,'0')).join(':');
 };
 function syncForm(){until.disabled=pick.value!=='unavailable';if(until.disabled)until.value=''}
 pick.addEventListener('change',syncForm);
 async function read(){
  const own=++serial;submit.disabled=true;
  try{
   const value=await readManagerPassSales(session,month,{request});
   if(own!==serial||!root.isConnected)return;
   pick.value=value.salesState;reason.value=value.reason||'';
   until.value=dateLocal(value.graceUntil);
   status.textContent='Hónap: '+value.validMonth+' · '+value.salesState;
   const canEdit=value.canEdit===true;
   submit.hidden=!canEdit;
   submit.disabled=!canEdit;pick.disabled=!canEdit;reason.disabled=!canEdit;
   if(!canEdit){until.disabled=true;status.textContent+=' · csak megtekintés'}
   else syncForm();
  }catch(error){if(own!==serial)return;status.textContent='Nem elérhető vagy nincs jogosultság ('+String(error.message||'ERROR')+')';}
 }
 submit.addEventListener('click',async()=>{
  if(submit.disabled)return;submit.disabled=true;
  try{
   const datetime=until.value?new Date(until.value):null;
   if(datetime&&!Number.isFinite(datetime.getTime()))throw Error('MASS_MANAGER_DATE_INVALID');
   const value=await setManagerPassSales(session,{
    month,state:pick.value,graceUntil:datetime?datetime.toISOString():null,reason:reason.value
   },{request});
   status.textContent='Mentve, auditálva: '+value.salesState;
  }catch(error){status.textContent='Nem menthető: '+String(error.message||'ERROR')}
  finally{submit.disabled=false}
 });
 void read();
 return {dispose:()=>{serial++;root.replaceChildren()}};
}
