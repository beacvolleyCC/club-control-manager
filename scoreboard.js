/* Club Control Manager – Számláló v1. Training tool, local-only; no DB writes. */
(function(){
  'use strict';
  const KEY='cc-manager-training-scoreboard-v1';
  const MAX_COURTS=6;
  let nextId=0, model=null, root=null, projectorId=null;
  let tickHandle=null;
  const htmlEscape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const byId=id=>model.courts.find(c=>c.id===String(id));
  const cleanNumber=(v,min,max,fallback)=>Number.isFinite(Number(v))?Math.min(max,Math.max(min,Math.trunc(Number(v)))):fallback;
  function makeCourt(number){
    return {id:String(++nextId),name:number+'. pálya',home:'A csapat',away:'B csapat',points:[0,0],sets:[0,0],setNumber:1,finished:false,last:'',history:[],timer:{type:'countdown',durationMs:600000,elapsedMs:0,since:0,running:false}};
  }
  function restoreCourt(c,index){
    const fresh=makeCourt(index+1),t=c&&typeof c==='object'?c:{},clock=t.timer&&typeof t.timer==='object'?t.timer:{};
    fresh.id=String(t.id||fresh.id);
    nextId=Math.max(nextId,cleanNumber(fresh.id,1,999999,nextId));
    fresh.name=String(t.name||fresh.name).slice(0,60);
    fresh.home=String(t.home||fresh.home).slice(0,60);
    fresh.away=String(t.away||fresh.away).slice(0,60);
    fresh.points=[0,1].map(i=>cleanNumber(t.points?.[i],0,999,0));
    fresh.sets=[0,1].map(i=>cleanNumber(t.sets?.[i],0,9,0));
    fresh.setNumber=cleanNumber(t.setNumber,1,9,1);
    fresh.finished=t.finished===true;
    fresh.last=String(t.last||'').slice(0,100);
    fresh.history=Array.isArray(t.history)?t.history.slice(-30):[];
    fresh.timer={type:clock.type==='stopwatch'?'stopwatch':'countdown',durationMs:cleanNumber(clock.durationMs,60000,10800000,600000),elapsedMs:cleanNumber(clock.elapsedMs,0,10800000,0),since:cleanNumber(clock.since,0,99999999999999,0),running:clock.running===true};
    return fresh;
  }
  function load(){
    const initial={mode:'volleyball',target:25,bestOf:3,courts:[makeCourt(1),makeCourt(2)]};
    try{
      const parsed=JSON.parse(localStorage.getItem(KEY)||'null');
      if(!parsed||!Array.isArray(parsed.courts)||!parsed.courts.length)return initial;
      const courts=parsed.courts.slice(0,MAX_COURTS).map(restoreCourt);
      const ids=new Set(courts.map(c=>c.id));
      if(ids.size!==courts.length) courts.forEach((c,i)=>{c.id=String(1000+i)});
      return {mode:parsed.mode==='free'?'free':'volleyball',target:[15,21,25].includes(parsed.target)?parsed.target:25,bestOf:parsed.bestOf===5?5:3,courts};
    }catch(_){return initial}
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(model))}catch(_){}}
  function elapsed(c){const t=c.timer;return t.elapsedMs+(t.running?Math.max(0,Date.now()-t.since):0)}
  function remaining(c){return c.timer.type==='countdown'?Math.max(0,c.timer.durationMs-elapsed(c)):elapsed(c)}
  function formatMs(ms){
    let seconds=Math.floor(Math.max(0,ms)/1000);
    const h=Math.floor(seconds/3600);seconds%=3600;
    const m=Math.floor(seconds/60),s=seconds%60;
    return h?String(h)+':'+String(m).padStart(2,'0')+':'+String(s).padStart(2,'0'):String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
  }
  function paintTimers(){
    if(!root||!root.isConnected)return;
    for(const el of root.querySelectorAll('[data-cc-clock]')){
      const c=byId(el.dataset.ccClock);if(!c)continue;
      el.textContent=formatMs(remaining(c));
      el.classList.toggle('cc-counter-finished',c.timer.type==='countdown'&&remaining(c)===0);
    }
    for(const c of model.courts){
      if(c.timer.running&&c.timer.type==='countdown'&&elapsed(c)>=c.timer.durationMs){
        c.timer.elapsedMs=c.timer.durationMs;c.timer.since=0;c.timer.running=false;save();
        const btn=root.querySelector('[data-cc-action="timer-toggle"][data-id="'+c.id+'"]');
        if(btn)btn.textContent='▶ Indítás';
      }
    }
  }
  function snapshot(c){
    c.history.push({points:c.points.slice(),sets:c.sets.slice(),setNumber:c.setNumber,finished:c.finished,last:c.last});
    if(c.history.length>30)c.history.shift();
  }
  function point(c,side,difference){
    if(c.finished&&difference>0)return;
    if(difference<0&&c.points[side]===0)return;
    snapshot(c);
    c.points[side]=Math.max(0,Math.min(999,c.points[side]+difference));
    c.last=(difference>0?'+1':'−1')+' · '+(side===0?c.home:c.away);
    if(model.mode==='volleyball'&&difference>0){
      const goal=Math.ceil(model.bestOf/2);
      const deciding=c.sets[0]===goal-1&&c.sets[1]===goal-1;
      const target=deciding?15:model.target;
      const other=1-side;
      if(c.points[side]>=target&&c.points[side]-c.points[other]>=2){
        c.sets[side]++;
        if(c.sets[side]>=goal){
          c.finished=true;c.last='Mérkőzés vége · '+(side===0?c.home:c.away)+' nyert';
        }else{
          c.last=String(c.setNumber)+'. szett vége · '+(side===0?c.home:c.away);
          c.setNumber++;c.points=[0,0];
        }
      }
    }
    save();render();
  }
  function undo(c){
    const old=c.history.pop();if(!old)return;
    c.points=old.points;c.sets=old.sets;c.setNumber=old.setNumber;c.finished=old.finished;c.last=old.last;
    save();render();
  }
  function resetScore(c){
    if(!window.confirm(c.name+': biztosan új mérkőzést kezdesz? Az előző eredmény ezen az eszközön törlődik.'))return;
    c.points=[0,0];c.sets=[0,0];c.setNumber=1;c.finished=false;c.last='Új mérkőzés';c.history=[];
    save();render();
  }
  function timerToggle(c){
    const t=c.timer;
    if(t.running){t.elapsedMs=elapsed(c);t.running=false;t.since=0}
    else{
      if(t.type==='countdown'&&t.elapsedMs>=t.durationMs)t.elapsedMs=0;
      t.running=true;t.since=Date.now();
    }
    save();render();
  }
  function timerReset(c){c.timer.elapsedMs=0;c.timer.running=false;c.timer.since=0;save();render()}
  function setTimer(c,minutes){
    const min=cleanNumber(minutes,1,180,10);
    c.timer.durationMs=min*60000;c.timer.elapsedMs=0;c.timer.since=0;c.timer.running=false;
    save();render();
  }
  function button(label,action,id,extra,disabled){
    return '<button type="button" class="cc-counter-btn '+(extra||'')+'" data-cc-action="'+action+'" data-id="'+id+'"'+(disabled?' disabled':'')+'>'+label+'</button>';
  }
  function boardHtml(c){
    const id=htmlEscape(c.id),goal=Math.ceil(model.bestOf/2),setter=model.mode==='volleyball';
    const score=(side)=>{
      const name=side===0?'home':'away';
      const title=side===0?c.home:c.away;
      return '<div class="cc-counter-team"><label class="cc-counter-small" for="cc-team-'+id+'-'+side+'">Csapat '+(side===0?'A':'B')+'</label>'+
        '<input id="cc-team-'+id+'-'+side+'" class="cc-counter-team-name" data-cc-name="'+name+'" data-id="'+id+'" maxlength="60" value="'+htmlEscape(title)+'" aria-label="'+(side===0?'A':'B')+' csapat neve">'+
        '<div class="cc-counter-score" aria-label="'+htmlEscape(title)+' pontjai">'+c.points[side]+'</div>'+
        '<div class="cc-counter-point-buttons">'+button('−','minus-'+side,id,'cc-counter-minus',c.finished)+button('+1','plus-'+side,id,'cc-counter-plus',c.finished)+'</div></div>';
    };
    return '<article class="cc-counter-court panel" data-cc-court="'+id+'">'+
      '<div class="cc-counter-card-head"><div class="cc-counter-court-title"><label for="cc-court-'+id+'">Pálya</label><input id="cc-court-'+id+'" maxlength="60" data-cc-name="name" data-id="'+id+'" value="'+htmlEscape(c.name)+'"></div>'+
      '<div class="cc-counter-head-actions">'+button('⛶ Kivetítő','project',id,'cc-counter-quiet')+button('×','remove',id,'cc-counter-quiet cc-counter-remove',model.courts.length===1)+'</div></div>'+
      '<div class="cc-counter-score-row">'+score(0)+'<div class="cc-counter-middle"><span>:</span></div>'+score(1)+'</div>'+
      (setter?'<div class="cc-counter-setbar"><span>Szettek</span><strong>'+c.sets[0]+' : '+c.sets[1]+'</strong><span>'+c.setNumber+'. szett · '+(c.finished?'vége':goal+' nyert szettig')+'</span></div>':'<div class="cc-counter-setbar"><span>Szabad pontozás</span><span>Nincs automatikus szettváltás</span></div>')+
      '<div class="cc-counter-last" role="status">'+htmlEscape(c.last||'Érintsd meg a +1 gombot a pontozáshoz.')+'</div>'+
      '<div class="cc-counter-bottom-actions">'+button('↶ Visszavonás','undo',id,'cc-counter-quiet',!c.history.length)+button('Új mérkőzés','reset-score',id,'cc-counter-quiet')+'</div>'+
      '<div class="cc-counter-timer"><div class="cc-counter-timer-top"><div><div class="cc-counter-small">Időmérő</div><output class="cc-counter-clock" data-cc-clock="'+id+'">'+formatMs(remaining(c))+'</output></div>'+
      '<select aria-label="Időmérő módja" data-cc-timer-type="'+id+'"><option value="countdown"'+(c.timer.type==='countdown'?' selected':'')+'>Visszaszámláló</option><option value="stopwatch"'+(c.timer.type==='stopwatch'?' selected':'')+'>Stopper</option></select></div>'+
      '<div class="cc-counter-timer-actions">'+button(c.timer.running?'Ⅱ Szünet':'▶ Indítás','timer-toggle',id,'cc-counter-primary')+button('↺ Nullázás','timer-reset',id,'cc-counter-quiet')+'</div>'+
      '<div class="cc-counter-timer-presets"><span class="cc-counter-small">Perc</span>'+
      [5,10,15,20].map(m=>button(m+'′','preset-'+m,id,'cc-counter-quiet')).join('')+
      '<label class="cc-counter-custom"><input type="number" inputmode="numeric" aria-label="Egyéni percek" min="1" max="180" value="'+Math.round(c.timer.durationMs/60000)+'" data-cc-minutes="'+id+'">'+button('Beállítás','custom-time',id,'cc-counter-quiet')+'</label></div></div></article>';
  }
  function projectorHtml(){
    if(!projectorId)return '';
    const c=byId(projectorId);if(!c)return '';
    return '<section class="cc-counter-projector" role="dialog" aria-modal="true" aria-label="Kivetítő mód"><div class="cc-counter-projector-top"><span>CLUB CONTROL · '+htmlEscape(c.name)+'</span>'+button('× Bezárás','close-project',c.id,'cc-counter-project-close')+'</div>'+
      '<div class="cc-counter-projector-body"><div class="cc-counter-project-team"><div>'+htmlEscape(c.home)+'</div><strong>'+c.points[0]+'</strong></div>'+
      '<div class="cc-counter-project-colon">:</div><div class="cc-counter-project-team"><div>'+htmlEscape(c.away)+'</div><strong>'+c.points[1]+'</strong></div></div>'+
      '<div class="cc-counter-projector-foot"><div>'+ (model.mode==='volleyball'?'SZETTEK · '+c.sets[0]+' : '+c.sets[1]+' · '+c.setNumber+'. SZETT':'SZABAD PONTOZÁS')+'</div><output data-cc-clock="'+htmlEscape(c.id)+'">'+formatMs(remaining(c))+'</output></div></section>';
  }
  function render(){
    if(!root||!root.isConnected)return;
    root.innerHTML='<div class="page-intro cc-page-header-panel"><div><h2>Számláló</h2><p>Többpályás pontszámlálás és időmérés edzésekhez, minitornákhoz.</p></div><span class="read-only-badge">HELYI ESZKÖZ</span></div>'+
      '<div class="cc-counter-intro"><div class="cc-counter-settings"><label>Játékmód <select id="cc-counter-mode"><option value="volleyball"'+(model.mode==='volleyball'?' selected':'')+'>Röplabda</option><option value="free"'+(model.mode==='free'?' selected':'')+'>Szabad pontozás</option></select></label>'+
      (model.mode==='volleyball'?'<label>Pontszám <select id="cc-counter-target">'+[15,21,25].map(n=>'<option value="'+n+'"'+(model.target===n?' selected':'')+'>'+n+' pont</option>').join('')+'</select></label><label>Nyert szettek <select id="cc-counter-bestof"><option value="3"'+(model.bestOf===3?' selected':'')+'>2 (3 szettből)</option><option value="5"'+(model.bestOf===5?' selected':'')+'>3 (5 szettből)</option></select></label>':'')+
      '</div>'+button('+ Pálya hozzáadása','add','','cc-counter-add',model.courts.length>=MAX_COURTS)+'</div>'+
      '<div class="cc-counter-notice">A pontok és az időmérők állása automatikusan ezen az eszközön tárolódik. Másik készülékkel még nem szinkronizál, hivatalos jegyzőkönyvet nem készít.</div>'+
      '<div class="cc-counter-grid">'+model.courts.map(boardHtml).join('')+'</div>'+
      '<p class="cc-counter-footnote">A kivetítő mód ugyanezen az eszközön nyílik meg, például képernyőtükrözéshez. Rádiós/gyári eredményjelző, forgáskövetés és játékosstatisztika későbbi modul.</p>'+
      projectorHtml();
    if(projectorId)document.body.classList.add('cc-counter-projecting');
    else document.body.classList.remove('cc-counter-projecting');
    paintTimers();
  }
  function handleClick(e){
    const b=e.target.closest('[data-cc-action]');
    if(!b||!root.contains(b))return;
    const action=b.dataset.ccAction,c=byId(b.dataset.id);
    if(action==='add'&&model.courts.length<MAX_COURTS){model.courts.push(makeCourt(model.courts.length+1));save();render();return}
    if(!c)return;
    if(action.startsWith('plus-'))return point(c,Number(action.slice(-1)),1);
    if(action.startsWith('minus-'))return point(c,Number(action.slice(-1)),-1);
    if(action==='undo')return undo(c);
    if(action==='reset-score')return resetScore(c);
    if(action==='timer-toggle')return timerToggle(c);
    if(action==='timer-reset')return timerReset(c);
    if(action.startsWith('preset-'))return setTimer(c,Number(action.split('-')[1]));
    if(action==='custom-time'){const input=root.querySelector('[data-cc-minutes="'+c.id+'"]');return setTimer(c,input?.value)}
    if(action==='remove'){
      if(model.courts.length<=1||!window.confirm(c.name+' eltávolítása? Az eredményei törlődnek.'))return;
      model.courts=model.courts.filter(x=>x.id!==c.id);save();render();return;
    }
    if(action==='project'){projectorId=c.id;render();const panel=root.querySelector('.cc-counter-projector');if(panel?.requestFullscreen)panel.requestFullscreen().catch(()=>{});return}
    if(action==='close-project'){projectorId=null;if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});render()}
  }
  function resetAllMatches(){
    for(const c of model.courts){c.points=[0,0];c.sets=[0,0];c.setNumber=1;c.finished=false;c.last='';c.history=[]}
  }
  function handleChange(e){
    const el=e.target,c=byId(el.dataset.id);
    if(el.id==='cc-counter-mode'||el.id==='cc-counter-target'||el.id==='cc-counter-bestof'){
      if(!window.confirm('A szabályok módosítása az összes pályán új mérkőzést kezd. Folytatod?')){render();return}
      if(el.id==='cc-counter-mode')model.mode=el.value==='free'?'free':'volleyball';
      if(el.id==='cc-counter-target')model.target=cleanNumber(el.value,15,25,25);
      if(el.id==='cc-counter-bestof')model.bestOf=el.value==='5'?5:3;
      resetAllMatches();save();render();return;
    }
    if(el.dataset.ccName&&c){c[el.dataset.ccName]=String(el.value||'').trim().slice(0,60)||('Csapat');save();render();return}
    if(el.dataset.ccTimerType&&byId(el.dataset.ccTimerType)){
      const court=byId(el.dataset.ccTimerType),t=court.timer;
      t.elapsedMs=0;t.since=0;t.running=false;t.type=el.value==='stopwatch'?'stopwatch':'countdown';
      save();render();
    }
  }
  function mount(host){
    if(!host)return;
    if(!model)model=load();
    root=host;
    root.addEventListener('click',handleClick);
    root.addEventListener('change',handleChange);
    if(!tickHandle)tickHandle=window.setInterval(paintTimers,250);
    projectorId=null;
    render();
  }
  window.CCManagerScoreboard=Object.freeze({mount:mount});
})();