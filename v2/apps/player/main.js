import {events,teams} from '../manager/fixtures.js';
const root=document.getElementById('schedule');
const date=new Intl.DateTimeFormat('hu-HU',{dateStyle:'medium',timeStyle:'short',timeZone:'Europe/Budapest'});
for(const event of [...events].sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt))){
 const row=document.createElement('div');row.className='entry';
 const info=document.createElement('div');const title=document.createElement('strong');title.textContent=event.name;
 const detail=document.createElement('small');detail.textContent=date.format(new Date(event.startsAt))+' · '+event.venue;
 info.append(title,detail);const team=document.createElement('span');team.className='tag';team.textContent=teams.find(t=>t.id===event.teamId)?.name??'–';row.append(info,team);root.append(row);
}
