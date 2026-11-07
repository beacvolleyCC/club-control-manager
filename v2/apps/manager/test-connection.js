// TEST-only Manager reads through existing permission-checked Supabase RPCs.
import {getTestSession} from './test-auth.js';
const HOST='https://szzoubvhlwnojtzqjebc.supabase.co';
const $=id=>document.getElementById(id);
const status=(message,error=false)=>{const node=$('testStatus');node.textContent=message;node.setAttribute('role',error?'alert':'status');};
async function rpc(name,args,session){
 const response=await fetch(HOST+'/rest/v1/rpc/'+name,{method:'POST',headers:{apikey:session.publishableKey,Authorization:'Bearer '+session.accessToken,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify(args),cache:'no-store'});
 if(!response.ok)throw new Error('Manager RPC '+name+': HTTP '+response.status);
 const result=await response.json();
 if(!Array.isArray(result))throw new Error('Váratlan Manager RPC válasz: '+name);
 return result;
}
function rows(target,data,formatter){const container=$(target);container.replaceChildren();for(const item of data){const node=document.createElement('div');node.className='entry';const title=document.createElement('strong');title.textContent=formatter(item)[0];const subtitle=document.createElement('small');subtitle.textContent=formatter(item)[1];node.append(title,subtitle);container.append(node);}if(!data.length)container.textContent='Nincs hozzáférhető adat.';}
$('connectTest').addEventListener('click',async()=>{
 const session=getTestSession();if(!session){status('Előbb jelentkezz be a TEST Manager fiókoddal.',true);return;}
 $('connectTest').disabled=true;status('Jogosultság-ellenőrzött Manager adatok lekérése…');
 try{
  const now=new Date(),from=new Date(now.getTime()-30*86400000),to=new Date(now.getTime()+120*86400000);
  const [teams,trainings,matches,players]=await Promise.all([
   rpc('cc_manager_teams_v1',{},session),
   rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'training',p_team_id:null},session),
   rpc('cc_manager_events_v1',{p_from:from.toISOString(),p_to:to.toISOString(),p_kind:'match',p_team_id:null},session),
   rpc('cc_manager_players_v2',{p_team_id:null,p_query:''},session)
  ]);
  const events=[...trainings,...matches];
  rows('testTeams',teams,t=>[t.name||'Csapat',t.active?'Aktív':'Inaktív']);
  rows('testEvents',events,e=>[e.title||'Esemény',e.startsAt||'Nincs időpont']);
  window.dispatchEvent(new CustomEvent('cc:v2-test-data',{detail:{teams,events,players}}));
  status('TEST Manager RPC kész: '+teams.length+' csapat, '+events.length+' esemény, '+players.length+' játékos.');
 }catch(error){window.dispatchEvent(new Event('cc:v2-test-clear'));$('testTeams').replaceChildren();$('testEvents').replaceChildren();status('TEST Manager hozzáférés sikertelen: '+error.message,true);}
 finally{$('connectTest').disabled=false;}
});
