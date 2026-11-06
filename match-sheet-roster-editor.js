/* TEST-only roster editor: preserve IDs and original metadata on updates. */
(function(root){
'use strict';
function mount(host,{db,eventId,sheet,roster,onSaved}){
 if(!sheet?.updated_at||!root.CCMatchSheetApi)throw Error('Saved sheet required');
 const form=document.createElement('form'),title=document.createElement('h3');title.textContent='Játékoskeret';form.append(title);
 const rows=document.createElement('div');form.append(rows);
 function add(item={}){
  if(rows.children.length>=60)return;
  const line=document.createElement('div');line.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin:6px 0';
  const side=document.createElement('select');
  [['home','Hazai'],['away','Vendég']].forEach(([v,label])=>{const o=document.createElement('option');o.value=v;o.textContent=label;side.append(o)});side.value=item.side||'home';
  const number=document.createElement('input');number.type='number';number.min='0';number.max='999';number.placeholder='Mezszám';number.style.width='80px';number.value=item.jersey_no??'';
  const name=document.createElement('input');name.placeholder='Játékos neve';name.value=item.player_name||'';
  const position=document.createElement('input');position.placeholder='Poszt';position.value=item.position||'';position.style.width='80px';
  const captain=document.createElement('label'),c=document.createElement('input');c.type='checkbox';c.checked=!!item.is_captain;captain.append(c,document.createTextNode(' C'));
  const libero=document.createElement('label'),l=document.createElement('input');l.type='checkbox';l.checked=!!item.is_libero;libero.append(l,document.createTextNode(' L'));
  const remove=document.createElement('button');remove.type='button';remove.textContent='Törlés';remove.addEventListener('click',()=>line.remove());
  line.append(side,number,name,position,captain,libero,remove);line._values=()=>({
   side:side.value,playerName:name.value.trim(),jerseyNo:number.value===''?null:Number(number.value),
   position:position.value.trim(),isCaptain:c.checked,isLibero:l.checked,
   playerId:item.player_id||null,externalPlayerId:item.external_player_id||null,
   rosterOrder:item.roster_order??null,source:item.source||'manual'
  });rows.append(line);
 }
 (roster||[]).forEach(add);
 const addButton=document.createElement('button');addButton.type='button';addButton.textContent='Játékos hozzáadása';addButton.addEventListener('click',()=>add());
 const save=document.createElement('button');save.type='submit';save.textContent='Keret mentése';
 const feedback=document.createElement('p');feedback.setAttribute('role','status');form.append(addButton,save,feedback);
 form.addEventListener('submit',async e=>{
  e.preventDefault();const payload=Array.from(rows.children,line=>line._values());
  if(payload.some(p=>!p.playerName||p.playerName.length>200||p.jerseyNo!==null&&(!Number.isInteger(p.jerseyNo)||p.jerseyNo<0||p.jerseyNo>999))){feedback.textContent='Ellenőrizd a neveket és mezszámokat.';return}
  const seen=new Set();
  for(const p of payload){if(p.jerseyNo===null)continue;const key=p.side+':'+p.jerseyNo;if(seen.has(key)){feedback.textContent='Azonos oldalon nem lehet két azonos mezszám.';return}seen.add(key)}
  save.disabled=true;feedback.textContent='Mentés…';
  try{const result=await root.CCMatchSheetApi.saveRoster(db,eventId,payload,sheet.updated_at);feedback.textContent='Mentve';if(typeof onSaved==='function')onSaved(result)}
  catch(error){const message=String(error?.message||error);feedback.textContent=/MATCH_SHEET_CONFLICT|40001/.test(message)?'A keret közben változott. Frissítsd a jegyzőkönyvet.':'Mentési hiba: '+message}
  finally{save.disabled=false}
 });host.append(form);return form;
}
root.CCMatchSheetRosterEditor=Object.freeze({mount});
})(typeof globalThis!=='undefined'?globalThis:this);
