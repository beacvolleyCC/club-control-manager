/* TEST: edit up to five volleyball set scores using version-locked RPC. */
(function(root){
  'use strict';
  function mount(host,{db,eventId,sheet,sets,onSaved}){
    if(!sheet||!sheet.updated_at||!root.CCMatchSheetApi)throw new Error('Saved sheet required');
    const form=document.createElement('form'),heading=document.createElement('h3');
    heading.textContent='Szetteredmények';form.appendChild(heading);
    const rows=[];
    for(let i=1;i<=5;i++){
      const existing=(sets||[]).find(s=>Number(s.set_no)===i);
      const label=document.createElement('label');label.textContent=i+'. szett ';
      const home=document.createElement('input'),away=document.createElement('input');
      [home,away].forEach(input=>{input.type='number';input.min='0';input.max='999';input.step='1';input.style.width='70px'});
      home.value=existing?.home_points??'';away.value=existing?.away_points??'';
      label.append(home,document.createTextNode(' : '),away);form.appendChild(label);
      rows.push({i,home,away,existing});
    }
    const button=document.createElement('button');button.type='submit';button.textContent='Szettek mentése';
    const feedback=document.createElement('p');feedback.setAttribute('role','status');form.append(button,feedback);
    form.addEventListener('submit',async event=>{
      event.preventDefault();const payload=[];
      for(const row of rows){
        const h=row.home.value.trim(),a=row.away.value.trim();
        if(!h&&!a)continue;
        if(!h||!a||![h,a].every(v=>/^\d+$/.test(v)&&Number(v)<=999)){feedback.textContent='Minden kitöltött szetthez két érvényes pontszám kell.';return}
        payload.push({setNo:row.i,homePoints:Number(h),awayPoints:Number(a),homeStartingLineup:row.existing?.home_starting_lineup||[],awayStartingLineup:row.existing?.away_starting_lineup||[],extra:row.existing?.extra||{}});
      }
      button.disabled=true;feedback.textContent='Mentés…';
      try{const result=await root.CCMatchSheetApi.saveSets(db,eventId,payload,sheet.updated_at);feedback.textContent='Mentve';if(typeof onSaved==='function')onSaved(result)}
      catch(error){const message=String(error?.message||error);feedback.textContent=/MATCH_SHEET_CONFLICT|40001/.test(message)?'Az adatok megváltoztak. Frissítsd a jegyzőkönyvet.':'Mentési hiba: '+message}
      finally{button.disabled=false}
    });
    host.appendChild(form);return form;
  }
  root.CCMatchSheetSetsEditor=Object.freeze({mount});
})(typeof globalThis!=='undefined'?globalThis:this);
