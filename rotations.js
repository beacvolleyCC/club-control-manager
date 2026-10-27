/* Club Control · Állásrend v2 · local browser storage only; no database writes. */
(function () {
  'use strict';
  const KEY='cc-manager-training-rotations-v1';
  const NEXT=[0,6,1,2,3,4,5];
  const ROLES=[
    ['setter','Feladó','Feladó'],
    ['outside-near','Közelebbi négyes','Közelebbi 4-es'],
    ['middle-near','Közelebbi center','Közelebbi center'],
    ['opposite','Átló','Átló'],
    ['outside-far','Távolabbi négyes','Távolabbi 4-es'],
    ['middle-far','Távolabbi center','Távolabbi center']
  ];
  let data=null,host=null,picked=null,editOpen=false,lastTap=null;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const roleLabel=id=>(ROLES.find(x=>x[0]===id)||ROLES[0])[1];
  const roleShort=id=>(ROLES.find(x=>x[0]===id)||ROLES[0])[2];
  const defaults=i=>({
    name:i===0?'A csapat':'B csapat',
    color:i===0?'#d29b00':'#2685c4',
    round:0,
    spots:[1,2,3,4,5,6],
    players:Array.from({length:6},(_,n)=>({id:n+1,number:String(n+1),name:'',role:ROLES[n][0]}))
  });
  function sanitize(v,i){
    const t=defaults(i);
    if(!v||typeof v!=='object')return t;
    t.name=String(v.name??t.name).slice(0,48);
    if(/^#[0-9a-f]{6}$/i.test(v.color||''))t.color=v.color;
    if(Number.isInteger(v.round))t.round=((v.round%6)+6)%6;
    if(Array.isArray(v.spots)&&v.spots.length===6&&[...v.spots].sort().join(',')==='1,2,3,4,5,6')t.spots=[...v.spots];
    if(Array.isArray(v.players))t.players=t.players.map(p=>{
      const x=v.players.find(q=>q&&q.id===p.id);
      if(!x)return p;
      return {id:p.id,number:String(x.number??p.number).slice(0,3),name:String(x.name??p.name).slice(0,48),role:ROLES.some(r=>r[0]===x.role)?x.role:p.role};
    });
    return t;
  }
  function load(){
    try{
      const x=JSON.parse(localStorage.getItem(KEY)||'null');
      if(x&&Array.isArray(x.teams)&&x.teams.length===2)return {teams:x.teams.map(sanitize)};
    }catch(_){}
    return {teams:[defaults(0),defaults(1)]};
  }
  function save(){try{localStorage.setItem(KEY,JSON.stringify(data))}catch(_){}}
  function step(t,dir){
    const target=[];
    for(let pos=1;pos<=6;pos++){
      const next=dir===1?NEXT[pos]:NEXT.indexOf(pos);
      target[next-1]=t.spots[pos-1];
    }
    t.spots=target;t.round=(t.round+(dir===1?1:5))%6;
  }
  function at(t,pos){return t.players[t.spots[pos-1]-1]}
  function playerButton(teamIndex,pos){
    const t=data.teams[teamIndex],p=at(t,pos),active=picked&&picked.team===teamIndex&&picked.pos===pos;
    return '<div class="cc-rot-cell"><button type="button" class="cc-rot-player'+(active?' picked':'')+'" data-rot-action="pick" data-team="'+teamIndex+'" data-pos="'+pos+'" aria-pressed="'+!!active+'" aria-label="'+esc(t.name)+': '+pos+'. forgási hely; mezszám '+esc(p.number)+', '+esc(p.name||roleLabel(p.role))+'. Dupla koppintás szerkesztéshez">'+
      '<span class="cc-rot-pos">'+pos+'. hely</span><strong>'+esc(p.number||'–')+'</strong>'+
      '<span class="cc-rot-person">'+esc(p.name||'Név nélkül')+'</span>'+
      '<span class="cc-rot-role" title="'+esc(roleLabel(p.role))+'">'+esc(roleShort(p.role))+'</span></button>'+
      '<button type="button" class="cc-rot-edit-player" data-rot-action="edit-player" data-team="'+teamIndex+'" data-pos="'+pos+'" aria-label="'+esc(p.name||p.number||'Játékos')+' szerkesztése" title="Játékos szerkesztése">✎</button></div>';
  }
  function court(teamIndex){
    const t=data.teams[teamIndex],rows=teamIndex===1?[[1,6,5],[2,3,4]]:[[4,3,2],[5,6,1]];
    return '<section class="cc-rot-half" style="--rot-color:'+t.color+'">'+
      '<header class="cc-rot-half-head"><b><i></i>'+esc(t.name)+'</b><div class="cc-rot-controls">'+
      '<button type="button" data-rot-action="step" data-team="'+teamIndex+'" data-dir="-1" aria-label="Előző forgás: '+esc(t.name)+'">‹</button>'+
      '<span>'+(t.round+1)+'/6</span>'+
      '<button type="button" data-rot-action="step" data-team="'+teamIndex+'" data-dir="1" aria-label="Következő forgás: '+esc(t.name)+'">›</button>'+
      '</div></header><div class="cc-rot-court">'+rows.map(row=>'<div class="cc-rot-row">'+row.map(pos=>playerButton(teamIndex,pos)).join('')+'</div>').join('')+'</div></section>';
  }
  function editor(teamIndex){
    const t=data.teams[teamIndex];
    return '<section class="cc-rot-editor-team"><h3>'+(teamIndex===0?'A csapat':'B csapat')+'</h3>'+
      '<div class="cc-rot-team-fields"><label>Csapatnév<input type="text" maxlength="48" data-rot-edit="team-name" data-team="'+teamIndex+'" value="'+esc(t.name)+'"></label>'+
      '<label>Szín<input type="color" data-rot-edit="team-color" data-team="'+teamIndex+'" value="'+esc(t.color)+'"></label></div>'+
      '<p class="cc-rot-editor-note">A játékosokat közvetlenül a pályán, a ceruzával vagy dupla koppintással szerkesztheted.</p></section>';
  }
  function paint(){
    if(!host||!host.isConnected)return;
    host.innerHTML='<div class="cc-rot-wrap"><div class="cc-rot-intro"><div><h2>Állásrend és forgások</h2><p>Koppintással kijelölés és helycsere. Dupla koppintással vagy a ✎ ikonnal játékosszerkesztés.</p></div>'+
      '<button type="button" class="cc-rot-btn '+(editOpen?'active':'')+'" data-rot-action="edit">'+(editOpen?'Csapatadatok bezárása':'✎ Csapatnevek, színek')+'</button></div>'+
      '<div class="cc-rot-main"><div class="cc-rot-board">'+court(1)+'<div class="cc-rot-net"><span>HÁLÓ</span></div>'+court(0)+'</div>'+
      '<div class="cc-rot-bottom"><button type="button" class="cc-rot-btn" data-rot-action="reset">↺ Vissza az 1. forgásra</button><button type="button" class="cc-rot-btn" data-rot-action="clear-pick">Kijelölés törlése</button></div>'+
      '<div class="cc-rot-help">A feladó az 1., a közelebbi négyes a 2., a közelebbi center a 3., az átló a 4., a távolabbi négyes az 5., a távolabbi center a 6. helyről indul. A poszt a játékossal együtt forog. Mentés ezen az eszközön.</div></div>'+
      (editOpen?'<div class="cc-rot-edit-grid">'+editor(0)+editor(1)+'</div>':'')+'</div>';
  }
  function dialogMarkup(side,pos){
    const t=data.teams[side],p=at(t,pos);
    return '<dialog class="cc-rot-dialog" data-rot-dialog aria-labelledby="ccRotPlayerTitle"><form method="dialog" class="cc-rot-dialog-form" data-rot-side="'+side+'" data-rot-player="'+p.id+'">'+
      '<div class="cc-rot-dialog-head"><div><small>'+esc(t.name)+' · '+pos+'. hely</small><h3 id="ccRotPlayerTitle">Játékos szerkesztése</h3></div><button type="button" class="cc-rot-dialog-close" data-rot-action="cancel-player" aria-label="Bezárás">×</button></div>'+
      '<div class="cc-rot-dialog-fields"><label>Mezszám<input name="jersey" type="text" inputmode="numeric" maxlength="3" autocomplete="off" value="'+esc(p.number)+'" placeholder="Pl. 12"></label>'+
      '<label>Játékos neve<input name="playerName" type="text" maxlength="48" autocomplete="off" value="'+esc(p.name)+'" placeholder="Játékos neve"></label>'+
      '<label>Poszt<select name="role">'+ROLES.map(r=>'<option value="'+r[0]+'"'+(p.role===r[0]?' selected':'')+'>'+esc(r[1])+'</option>').join('')+'</select></label>'+
      '<label>Pályahely az aktuális forgásban<select name="spot">'+Array.from({length:6},(_,i)=>'<option value="'+(i+1)+'"'+(pos===i+1?' selected':'')+'>'+(i+1)+'. hely</option>').join('')+'</select></label></div>'+
      '<p class="cc-rot-dialog-tip">Ha másik pályahelyet választasz, a két ott álló játékos helyet cserél. A poszt mindig a játékossal együtt mozog a forgásokban.</p>'+
      '<div class="cc-rot-dialog-actions"><button type="button" class="cc-rot-btn" data-rot-action="cancel-player">Mégse</button><button type="submit" class="cc-rot-btn cc-rot-btn-primary">Mentés</button></div></form></dialog>';
  }
  function openPlayer(side,pos){
    if(!data.teams[side]||!Number.isInteger(pos)||pos<1||pos>6)return;
    const existing=host.querySelector('[data-rot-dialog]');
    if(existing)existing.remove();
    host.insertAdjacentHTML('beforeend',dialogMarkup(side,pos));
    const dialog=host.querySelector('[data-rot-dialog]');
    if(!dialog)return;
    if(typeof dialog.showModal==='function')dialog.showModal();
    else dialog.setAttribute('open','');
    picked=null;lastTap=null;
  }
  function closePlayer(){
    const dialog=host?.querySelector('[data-rot-dialog]');
    if(dialog){if(typeof dialog.close==='function'&&dialog.open)dialog.close();dialog.remove()}
    paint();
  }
  function onClick(ev){
    const b=ev.target.closest('[data-rot-action]');
    if(!b||!host.contains(b))return;
    const a=b.dataset.rotAction,side=Number(b.dataset.team),t=data.teams[side];
    if(a==='cancel-player'){closePlayer();return}
    if(a==='edit-player'&&t){openPlayer(side,Number(b.dataset.pos));return}
    if(a==='edit'){editOpen=!editOpen;lastTap=null;paint();return}
    if(a==='step'&&t){step(t,Number(b.dataset.dir)===-1?-1:1);picked=null;lastTap=null}
    else if(a==='pick'&&t){
      const pos=Number(b.dataset.pos),now=Date.now();
      if(lastTap&&lastTap.side===side&&lastTap.pos===pos&&now-lastTap.at<=520){
        openPlayer(side,pos);return;
      }
      lastTap={side,pos,at:now};
      if(picked&&picked.team===side&&picked.pos===pos)picked=null;
      else if(picked&&picked.team===side){
        const other=picked.pos;
        [t.spots[pos-1],t.spots[other-1]]=[t.spots[other-1],t.spots[pos-1]];
        picked=null;
      }else picked={team:side,pos};
    }else if(a==='clear-pick'){picked=null;lastTap=null}
    else if(a==='reset'){
      data.teams.forEach(team=>{while(team.round!==0)step(team,-1)});
      picked=null;lastTap=null;
    }else return;
    save();paint();
  }
  function onSubmit(ev){
    const form=ev.target.closest('.cc-rot-dialog-form');
    if(!form||!host.contains(form))return;
    ev.preventDefault();
    const side=Number(form.dataset.rotSide),id=Number(form.dataset.rotPlayer),t=data.teams[side];
    if(!t)return;
    const player=t.players.find(p=>p.id===id);
    if(!player)return;
    const get=name=>form.elements.namedItem(name)?.value??'';
    const role=get('role'),spot=Number(get('spot'));
    player.number=String(get('jersey')).replace(/[^\d]/g,'').slice(0,3);
    player.name=String(get('playerName')).trim().slice(0,48);
    if(ROLES.some(r=>r[0]===role))player.role=role;
    const from=t.spots.indexOf(id),to=spot-1;
    if(from>=0&&to>=0&&to<6&&from!==to)[t.spots[from],t.spots[to]]=[t.spots[to],t.spots[from]];
    picked=null;lastTap=null;save();closePlayer();
  }
  function onInput(ev){
    const input=ev.target,what=input.dataset.rotEdit;
    if(!what)return;
    const t=data.teams[Number(input.dataset.team)];
    if(!t)return;
    if(what==='team-name')t.name=input.value.slice(0,48);
    else if(what==='team-color'&&/^#[0-9a-f]{6}$/i.test(input.value))t.color=input.value;
    else return;
    save();
    const board=host.querySelector('.cc-rot-board');
    if(board)board.outerHTML='<div class="cc-rot-board">'+court(1)+'<div class="cc-rot-net"><span>HÁLÓ</span></div>'+court(0)+'</div>';
  }
  function mount(element){
    if(!element)return;
    host=element;data=load();picked=null;editOpen=false;lastTap=null;
    host.addEventListener('click',onClick);
    host.addEventListener('input',onInput);
    host.addEventListener('submit',onSubmit);
    paint();
  }
  window.CCManagerRotations=Object.freeze({mount});
})();
