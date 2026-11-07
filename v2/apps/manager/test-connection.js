// Explicit, opt-in TEST data connection. No session tokens persisted to storage.
import {getTestSession} from './test-auth.js';
const TEST_HOST='szzoubvhlwnojtzqjebc.supabase.co';
const $=id=>document.getElementById(id);
const setStatus=(message,error=false)=>{const target=$('testStatus');target.textContent=message;target.setAttribute('role',error?'alert':'status');};
const request=async(path,key,token)=>{
 const response=await fetch('https://'+TEST_HOST+'/rest/v1/'+path,{method:'GET',headers:{apikey:key,Authorization:'Bearer '+token,Accept:'application/json'},cache:'no-store'});
 if(!response.ok)throw new Error('HTTP '+response.status+' – jogosultság vagy kapcsolat ellenőrzendő');
 const body=await response.json();if(!Array.isArray(body))throw new Error('Váratlan válasz');return body;
};
function renderRows(target,rows,make){const el=$(target);el.replaceChildren();for(const row of rows){const item=document.createElement('div');item.className='entry';const text=document.createElement('div');const strong=document.createElement('strong');strong.textContent=make(row)[0];const small=document.createElement('small');small.textContent=make(row)[1];text.append(strong,small);item.append(text);el.append(item);}if(!rows.length)el.textContent='Nincs hozzáférhető adat.';}
$('connectTest').addEventListener('click',async()=>{
 const session=getTestSession();
 if(!session){setStatus('Előbb jelentkezz be a TEST fiókoddal.',true);return;}
 // SECURITY GATE: current REST table policies authorize player membership, not Manager permissions.
 // Keep Manager TEST data mode disabled until a server-side manager-scoped endpoint is verified.
 setStatus('A Manager TEST adatnézet jogosultsági ellenőrzésig zárolva. A játékos-RLS nem helyettesíti a Manager jogosultságokat.',true);
 return;
 const {publishableKey:key,accessToken:token}=session;
 $('connectTest').disabled=true;setStatus('TEST adatok lekérése…');
 try{
  const [teams,events]=await Promise.all([
   request('teams?select=id,name,active&order=name.asc&limit=100',key,token),
   request('events?select=id,team_id,title,starts_at,venue,status&order=starts_at.asc&limit=100',key,token)
  ]);
  // Never blend fixture data with live TEST responses.
  renderRows('testTeams',teams,t=>[t.name,t.active?'Aktív':'Inaktív']);
  renderRows('testEvents',events,e=>[e.title||'Esemény',e.starts_at?new Intl.DateTimeFormat('hu-HU',{dateStyle:'short',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(e.starts_at))+' · '+(e.venue||''):'Nincs időpont']);
  window.dispatchEvent(new CustomEvent('cc:v2-test-data',{detail:{teams,events}}));
  setStatus('TEST lekérdezés kész: '+teams.length+' csapat, '+events.length+' esemény. Csak a session által engedélyezett sorok.');
 }catch(err){window.dispatchEvent(new Event('cc:v2-test-clear'));$('testTeams').replaceChildren();$('testEvents').replaceChildren();setStatus('TEST kapcsolat sikertelen: '+err.message,true);}finally{$('connectTest').disabled=false;}
});
