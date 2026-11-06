/* TEST-only match sheet base fields editor. Requires authenticated Manager RPC adapter. */
(function(root){
  'use strict';
  function mount(host,options){
    const {db,eventId,sheet,onSaved}=options;
    if(!host||!db||!eventId||!root.CCMatchSheetApi||!sheet)throw new Error('Missing match sheet editor context');
    const form=document.createElement('form');
    form.className='cc-match-sheet-base-editor';
    const title=document.createElement('h3');title.textContent='Jegyzőkönyv alapadatok';
    form.appendChild(title);
    const fields=[['homeTeamName','Hazai csapat','home_team_name'],['awayTeamName','Vendégcsapat','away_team_name'],['venue','Helyszín','venue']];
    const inputs={};
    fields.forEach(([key,label,column])=>{
      const wrapper=document.createElement('label');wrapper.textContent=label;
      const input=document.createElement('input');input.name=key;input.value=sheet[column]||'';
      wrapper.appendChild(input);form.appendChild(wrapper);inputs[key]=input;
    });
    const button=document.createElement('button');button.type='submit';button.textContent='Alapadatok mentése';
    const feedback=document.createElement('p');feedback.setAttribute('role','status');
    form.append(button,feedback);
    form.addEventListener('submit',async event=>{
      event.preventDefault();button.disabled=true;feedback.textContent='Mentés…';
      const payload={matchStatus:sheet.match_status||'draft',officialMatchId:sheet.official_match_id||'',officialReportUrl:sheet.official_report_url||'',metadata:sheet.metadata||{}};
      fields.forEach(([key])=>{payload[key]=inputs[key].value.trim()});
      try{
        const result=await root.CCMatchSheetApi.save(db,eventId,payload,sheet.updated_at);
        feedback.textContent='Sikeres mentés';if(typeof onSaved==='function')onSaved(result);
      }catch(error){
        const message=String(error&&error.message||error);
        feedback.textContent=/MATCH_SHEET_CONFLICT|40001/.test(message)?'Az adatok közben megváltoztak. Frissítés szükséges.':'Mentési hiba: '+message;
      }finally{button.disabled=false}
    });
    host.appendChild(form);return form;
  }
  root.CCMatchSheetBaseEditor=Object.freeze({mount});
})(typeof globalThis!=='undefined'?globalThis:this);
