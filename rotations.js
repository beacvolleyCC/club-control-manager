/* Club Control · Állásrend v1 · only browser-local data, no server writes. */
(function () {
  'use strict';
  const KEY = 'cc-manager-training-rotations-v1';
  const NEXT = [0, 6, 1, 2, 3, 4, 5];
  let data = null, host = null, picked = null, editOpen = false;
  const esc = v => String(v == null ? '' : v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const defaults = i => ({
    name: i === 0 ? 'A csapat' : 'B csapat',
    color: i === 0 ? '#d29b00' : '#2685c4',
    round: 0,
    spots: [1,2,3,4,5,6],
    players: Array.from({length:6}, (_,n)=>({id:n+1, number:String(n+1), name:''}))
  });
  function sanitize(v,i) {
    const t=defaults(i);
    if(!v || typeof v!=='object') return t;
    t.name=String(v.name??t.name).slice(0,48);
    if(/^#[0-9a-f]{6}$/i.test(v.color||'')) t.color=v.color;
    if(Number.isInteger(v.round)) t.round=((v.round%6)+6)%6;
    if(Array.isArray(v.spots) && v.spots.length===6 && [...v.spots].sort().join(',')==='1,2,3,4,5,6') t.spots=[...v.spots];
    if(Array.isArray(v.players)) t.players=t.players.map(p=>{
      const x=v.players.find(q=>q && q.id===p.id);
      return x ? {id:p.id,number:String(x.number??'').slice(0,3),name:String(x.name??'').slice(0,48)} : p;
    });
    return t;
  }
  function load(){
    try {
      const x=JSON.parse(localStorage.getItem(KEY)||'null');
      if(x && Array.isArray(x.teams) && x.teams.length===2) return {teams:x.teams.map(sanitize)};
    }catch(_){}
    return {teams:[defaults(0),defaults(1)]};
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(_){}}
  function step(t,dir){
    const target=[];
    for(let pos=1;pos<=6;pos++) {
      const next=dir===1?NEXT[pos]:NEXT.indexOf(pos);
      target[next-1]=t.spots[pos-1];
    }
    t.spots=target;
    t.round=(t.round+(dir===1?1:5))%6;
  }
  function at(t,pos){return t.players[t.spots[pos-1]-1]}
  function playerButton(teamIndex,pos){
    const t=data.teams[teamIndex],p=at(t,pos);
    const active=picked&&picked.team===teamIndex&&picked.pos===pos;
    return '<button type="button" class="cc-rot-player'+(active?' picked':'')+'" data-rot-action="pick" data-team="'+teamIndex+'" data-pos="'+pos+'" aria-pressed="'+!!active+'" aria-label="'+esc(t.name)+': '+pos+'. hely, '+esc(p.number)+' '+esc(p.name)+'">'+
      '<span class="cc-rot-pos">'+pos+'. hely</span><strong>'+esc(p.number||'–')+'</strong><span class="cc-rot-person">'+esc(p.name||'Játékos')+'</span></button>';
  }
  function court(teamIndex){
    const t=data.teams[teamIndex],top=teamIndex===1;
    // Each team faces the net; on the upper half positions 2 and 4 appear reversed.
    const rows=top?[[1,6,5],[2,3,4]]:[[4,3,2],[5,6,1]];
    return '<section class="cc-rot-half" style="--rot-color:'+t.color+'">'+
      '<header class="cc-rot-half-head"><b><i></i>'+esc(t.name)+'</b><div class="cc-rot-controls">'+
      '<button type="button" data-rot-action="step" data-team="'+teamIndex+'" data-dir="-1" aria-label="Előző forgás: '+esc(t.name)+'">‹</button>'+
      '<span>'+ (t.round+1)+'/6</span>'+
      '<button type="button" data-rot-action="step" data-team="'+teamIndex+'" data-dir="1" aria-label="Következő forgás: '+esc(t.name)+'">›</button>'+
      '</div></header><div class="cc-rot-court">'+rows.map(row=>'<div class="cc-rot-row">'+row.map(pos=>playerButton(teamIndex,pos)).join('')+'</div>').join('')+'</div></section>';
  }
  function editor(teamIndex){
    const t=data.teams[teamIndex];
    return '<section class="cc-rot-editor-team"><h3>'+(teamIndex===0?'A csapat':'B csapat')+'</h3>'+
      '<div class="cc-rot-team-fields"><label>Csapatnév<input type="text" maxlength="48" data-rot-edit="team-name" data-team="'+teamIndex+'" value="'+esc(t.name)+'"></label>'+
      '<label>Szín<input type="color" data-rot-edit="team-color" data-team="'+teamIndex+'" value="'+esc(t.color)+'"></label></div>'+
      '<div class="cc-rot-roster">'+t.players.map(p=>'<div class="cc-rot-roster-row"><span>Játékos '+p.id+'</span>'+
      '<label>Mezszám<input type="text" inputmode="numeric" maxlength="3" data-rot-edit="number" data-team="'+teamIndex+'" data-id="'+p.id+'" value="'+esc(p.number)+'"></label>'+
      '<label>Név<input type="text" maxlength="48" data-rot-edit="name" data-team="'+teamIndex+'" data-id="'+p.id+'" value="'+esc(p.name)+'" placeholder="Név"></label></div>').join('')+'</div></section>';
  }
  function paint(){
    if(!host||!host.isConnected)return;
    const focusKey=document.activeElement&&document.activeElement.dataset?.rotEdit;
    host.innerHTML='<div class="cc-rot-wrap"><div class="cc-rot-intro"><div><h2>Állásrend és forgások</h2><p>Két csapat, hat-hat játékos. A forgásokat külön-külön léptetheted, vagy választhatsz két játékost a helycseréhez.</p></div>'+
      '<button type="button" class="cc-rot-btn '+(editOpen?'active':'')+'" data-rot-action="edit">'+(editOpen?'Szerkesztő bezárása':'✎ Nevek, számok')+'</button></div>'+
      '<div class="cc-rot-main"><div class="cc-rot-board">'+court(1)+'<div class="cc-rot-net"><span>HÁLÓ</span></div>'+court(0)+'</div>'+
      '<div class="cc-rot-bottom"><button type="button" class="cc-rot-btn" data-rot-action="reset">↺ Mindkét csapat az 1. forgásba</button><button type="button" class="cc-rot-btn" data-rot-action="clear-pick">Kijelölés törlése</button></div>'+
      '<div class="cc-rot-help">A hálóhoz közeli sor a 4–3–2-es első sor, a távolabbi az 5–6–1-es hátsó sor. A felső térfélen a játékosok a háló felé néznek. A változások ezen az eszközön automatikusan mentődnek.</div></div>'+
      (editOpen?'<div class="cc-rot-edit-grid">'+editor(0)+editor(1)+'</div>':'')+'</div>';
  }
  function onClick(ev){
    const b=ev.target.closest('[data-rot-action]');
    if(!b||!host.contains(b))return;
    const a=b.dataset.rotAction,side=Number(b.dataset.team),t=data.teams[side];
    if(a==='edit'){editOpen=!editOpen;paint();return}
    if(a==='step'&&t){step(t,Number(b.dataset.dir)===-1?-1:1);picked=null}
    else if(a==='pick'&&t){
      const pos=Number(b.dataset.pos);
      if(picked && picked.team===side && picked.pos===pos) picked=null;
      else if(picked && picked.team===side) {
        const other=picked.pos;
        [t.spots[pos-1],t.spots[other-1]]=[t.spots[other-1],t.spots[pos-1]];
        picked=null;
      }else picked={team:side,pos};
    }else if(a==='clear-pick')picked=null;
    else if(a==='reset'){
      data.teams.forEach(team=>{while(team.round!==0)step(team,-1)});
      picked=null;
    }else return;
    save();paint();
  }
  function onInput(ev){
    const input=ev.target,what=input.dataset.rotEdit;
    if(!what)return;
    const t=data.teams[Number(input.dataset.team)];
    if(!t)return;
    const id=Number(input.dataset.id),p=t.players.find(x=>x.id===id);
    if(what==='team-name') t.name=input.value.slice(0,48);
    else if(what==='team-color'&&/^#[0-9a-f]{6}$/i.test(input.value))t.color=input.value;
    else if(what==='number'&&p)p.number=input.value.slice(0,3);
    else if(what==='name'&&p)p.name=input.value.slice(0,48);
    else return;
    save();
    // Live repaint would remove focus and the iOS keyboard; update only visible court labels.
    const board=host.querySelector('.cc-rot-board');
    if(board){
      const selected=host.querySelector('.cc-rot-edit-grid');
      board.outerHTML='<div class="cc-rot-board">'+court(1)+'<div class="cc-rot-net"><span>HÁLÓ</span></div>'+court(0)+'</div>';
    }
  }
  function mount(element){
    if(!element)return;
    host=element;data=load();picked=null;editOpen=false;
    host.addEventListener('click',onClick);
    host.addEventListener('input',onInput);
    paint();
  }
  window.CCManagerRotations=Object.freeze({mount:mount});
})();
