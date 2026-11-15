/** One self-service interface for public website and Player TEST preview.
 * Never exposes database credentials; token only in JS memory; all mutations server-scoped.
 */
import {createMassSelfClient} from './mass-self-client.js';
import {readPublicMassSchedule} from './mass-schedule.js';

const texts={
 hu:{title:'Tömegsport · jelentkezés',intro:'TEST rendszer. Az e-mailes regisztráció és a jelentkezések itt ellenőrizhetők.',email:'E-mail-cím',code:'E-mailben kapott kód',send:'Kód kérése',login:'Belépés',name:'Teljes név',level:'Edzésszint',register:'Profil létrehozása / összekapcsolása',myBookings:'Saját jelentkezéseim',myWaitlist:'Saját várólistám',pass:'Bérletellenőrzés',event:'Válassz edzést',book:'Jelentkezem',wait:'Várólistára',first:'Első edzés',claimed:'A bérletet már megvettem, de az import még késhet',cancel:'Lemondás',logout:'Kijelentkezés',unknown:'Nincs megerősített bérlet',pending_import:'Importellenőrzésre vár',sales_unavailable_grace:'Bérletértékesítés még nem elérhető · feltételes jelentkezés',missing:'Hiányzó bérlet',verified:'Ellenőrzött bérlet',qa_mock_pass:'Fiktív tesztbérlet',empty:'Nincs saját jelentkezés.',otpSent:'Ha lehetséges, a TEST e-mail-kódot elküldtük.',signedIn:'E-mail sikeresen ellenőrizve.',registered:'Profil sikeresen beállítva.',saved:'A művelet sikerült. A foglalás és bérletellenőrzés külön állapot.',failed:'A művelet nem sikerült. Ellenőrizd a hozzáférést vagy a foglalási szabályokat.',ready:'Lépj be, majd hozd létre vagy kapcsold össze a profilodat.',notReady:'Jelenleg nincs foglalható TEST-edzés.',choose:'Válassz edzést'},
 en:{title:'Recreational training · booking',intro:'TEST system. Email registration and bookings can be checked here.',email:'Email address',code:'Code from email',send:'Request code',login:'Sign in',name:'Full name',level:'Training level',register:'Create / link profile',myBookings:'My bookings',myWaitlist:'My waiting list',pass:'Pass verification',event:'Select training',book:'Book place',wait:'Join waiting list',first:'First training',claimed:'I have purchased a pass but the import may be delayed',cancel:'Cancel',logout:'Sign out',unknown:'No verified pass',pending_import:'Awaiting import check',sales_unavailable_grace:'Pass sales not available yet · conditional booking',missing:'Pass missing',verified:'Pass verified',qa_mock_pass:'Fictitious test pass',empty:'No bookings.',otpSent:'If available, your TEST email code has been sent.',signedIn:'Email successfully verified.',registered:'Profile connected.',saved:'Action completed. Your booking and pass verification have separate statuses.',failed:'Action could not be completed. Check your access or the booking rules.',ready:'Sign in, then create or link your profile.',notReady:'No TEST training sessions available for booking.',choose:'Choose a session'}
};
const elem=(tag,value,cls)=>{const e=document.createElement(tag);if(value!==undefined)e.textContent=String(value);if(cls)e.className=cls;return e};
export function mountMassSelfService(root,{client=createMassSelfClient(),read=readPublicMassSchedule}={}){
 if(!root)throw Error('MASS_SELF_MOUNT_MISSING');
 const container=elem('section',undefined,'mass-self-panel');
 const heading=elem('h2'),intro=elem('p'),status=elem('p');status.setAttribute('role','status');
 const form=elem('div',undefined,'mass-self-controls'),results=elem('div',undefined,'mass-self-results');
 container.append(heading,intro,status,form,results);root.replaceChildren(container);
 let locale='hu',phase='signed-out',own=null,sessions=[],serial=0,busy=false,notice='';
 const tr=()=>texts[locale];
 function input(label,type='text'){
  const holder=elem('label'),caption=elem('span',label),field=elem('input');
  field.type=type;field.setAttribute('aria-label',label);holder.append(caption,field);return {holder,field};
 }
 const email=input('Email','email'),code=input('Code','text'),name=input('Full name');
 email.field.autocomplete='email';code.field.inputMode='numeric';code.field.maxLength=10;
 name.field.maxLength=100;
 const level=elem('select');level.setAttribute('aria-label','Edzésszint / Level');
 for(const [value,title] of [['Kezdő','Kezdő / Beginner'],['Középhaladó','Középhaladó / Intermediate'],['Haladó','Haladó / Advanced']]){
  const opt=elem('option',title);opt.value=value;level.append(opt);
 }
 const requested=elem('select');requested.setAttribute('aria-label','Edzés / Session');
 const paid=input('', 'checkbox'),type=elem('select');
 for(const [value,title] of [['book','Jelentkezés / Book'],['wait','Várólista / Waiting list'],['first_training','Első edzés / First training']]){
  const opt=elem('option',title);opt.value=value;type.append(opt);
 }
 function addButton(label,action){const b=elem('button',label);b.type='button';b.disabled=busy;b.addEventListener('click',action);form.append(b);return b}
 function message(msg){notice=msg;status.textContent=msg}
 async function act(task,success){
  if(busy)return;busy=true;render();
  const ownRequest=++serial;
  try{
   await task();
   if(ownRequest!==serial)return;
   if(success)message(success);
  }catch(error){
   if(ownRequest!==serial)return;
   // Error codes only; no server response/PII shown in the UI.
   message(tr().failed+' ('+String(error.message||'ERROR').slice(0,70)+')');
  }finally{if(ownRequest===serial){busy=false;render()}}
 }
 async function reload(){
  try{
   const [mine,events]=await Promise.all([client.ownData(),read()]);
   own=mine;sessions=events.filter(e=>e.bookingOpen||e.waitlistOpen);
   phase='registered';
  }catch(error){
   if(String(error.message).includes('MASS_PROFILE_LINK_REQUIRED')){phase='unregistered';own=null}
   else throw error;
  }
 }
 function ownList(title,entries,kind){
  results.append(elem('h3',title));
  if(!entries.length){results.append(elem('p',tr().empty));return}
  for(const entry of entries.slice(0,50)){
   const r=elem('div',undefined,'mass-self-record');
   const detail=elem('span',[entry.eventDate,entry.startTime,String(entry.status||'')].filter(Boolean).join(' · '));
   const b=elem('button',tr().cancel);b.type='button';b.disabled=busy;
   const id=kind==='booking'?entry.bookingId:entry.waitlistId;
   b.addEventListener('click',()=>act(async()=>{await client.cancel(id,kind);await reload()},tr().saved));
   r.append(detail,b);results.append(r);
  }
 }
 function render(){
  const t=tr();heading.textContent=t.title;intro.textContent=t.intro;
  status.textContent=notice||t.ready;form.replaceChildren();results.replaceChildren();
  if(phase==='signed-out'){
   email.field.placeholder=t.email;code.field.placeholder=t.code;
   form.append(email.holder,code.holder);
   addButton(t.send,()=>act(()=>client.requestCode(email.field.value),t.otpSent));
   addButton(t.login,()=>act(async()=>{await client.verifyCode(email.field.value,code.field.value);await reload()},t.signedIn));
   return;
  }
  addButton(t.logout,()=>{serial++;client.signOut();own=null;phase='signed-out';notice='';render()});
  if(phase==='unregistered'){
   name.field.placeholder=t.name;form.append(name.holder,level);
   addButton(t.register,()=>act(async()=>{
    await client.register(name.field.value,level.value);
    await reload();
   },t.registered));return;
  }
  if(!own)return;
  const badge=elem('p',t.pass+': '+(t[own.pass.status]||t.unknown)+' · '+String(own.pass.importFreshness||''));
  results.append(badge);
  const options=[...sessions];
  requested.replaceChildren();
  for(const e of options){
   const opt=elem('option',[e.date,e.startTime.slice(0,5),e.level,e.remaining+' szabad'].join(' · '));
   opt.value=e.eventId;requested.append(opt);
  }
  if(options.length){
   form.append(elem('p',t.event),requested,type,paid.holder);
   paid.holder.querySelector('span').textContent=t.claimed;
   addButton(t.book,()=>act(async()=>{await client.book(requested.value,type.value,paid.field.checked);await reload()},t.saved));
  }else form.append(elem('p',t.notReady));
  ownList(t.myBookings,own.bookings,'booking');
  ownList(t.myWaitlist,own.waitlist,'waitlist');
 }
 async function open(){
  try{sessions=(await read()).filter(e=>e.bookingOpen||e.waitlistOpen)}
  catch{sessions=[]}
  render();
 }
 void open();
 return {setLanguage:value=>{locale=value==='en'?'en':'hu';render()},dispose:()=>{serial++;client.signOut();root.replaceChildren()}};
}
