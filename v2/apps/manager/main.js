// Deliberately isolated demo. Never silently connect to LIVE or TEST databases.
import { teams, players, events } from './fixtures.js';
const byId = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const date = value => new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'}).format(new Date(value));
function row(title,detail,tag){return '<div class="entry"><div><strong>'+esc(title)+'</strong><small>'+esc(detail)+'</small></div><span class="tag">'+esc(tag)+'</span></div>'}
function render(){
 const selected=byId('teamFilter').value;
 const visible=events.filter(e=>selected==='all'||e.teamId===selected).sort((a,b)=>new Date(a.startsAt)-new Date(b.startsAt));
 byId('stats').innerHTML=[['Edzések',visible.length],['Játékosok',players.length],['Csapatok',teams.length]].map(([k,v])=>'<div class="stat"><span>'+esc(k)+'</span><strong>'+v+'</strong></div>').join('');
 byId('eventList').innerHTML=visible.map(e=>row(e.name,date(e.startsAt)+' · '+e.venue,teams.find(t=>t.id===e.teamId)?.name||'–')).join('')||'<p class="empty">Nincs edzés a szűrésben.</p>';
}
byId('teamFilter').innerHTML+=[...teams].map(t=>'<option value="'+esc(t.id)+'">'+esc(t.name)+'</option>').join('');
byId('teamFilter').addEventListener('change',render);
byId('playerList').innerHTML=players.map(p=>row(p.name,p.position,teams.find(t=>t.id===p.teamId)?.name||'–')).join('');
byId('teamList').innerHTML=teams.map(t=>row(t.name,t.area==='competition'?'Versenysport':'Tömegsport',t.id)).join('');
render();
