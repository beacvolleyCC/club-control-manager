/* Club Control Manager — consistent Hungarian date/time controls.
 * UI-only. Native inputs retain ISO yyyy-mm-dd / HH:mm values and form
 * validation. The original input stays mounted for existing event handlers.
 * No dependencies, no network, no Supabase changes.
 */
(() => {
  "use strict";
  const DAYS = ["H", "K", "Sze", "Cs", "P", "Szo", "V"];
  const TWO = n => String(n).padStart(2, "0");
  const isoDay = (y,m,d) => [y,TWO(m),TWO(d)].join("-");
  const asDate = s => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || ""));
    if (!m) return null;
    const d = new Date(+m[1],+m[2]-1,+m[3],12);
    return d.getFullYear() === +m[1] && d.getMonth() === +m[2]-1 &&
      d.getDate() === +m[3] ? d : null;
  };
  const dateText = iso => {
    const d = asDate(iso);
    return d ? new Intl.DateTimeFormat("hu-HU", {
      year:"numeric",month:"2-digit",day:"2-digit"
    }).format(d) : "Dátum kiválasztása";
  };
  const timeText = v => /^([01]\d|2[0-3]):[0-5]\d$/.test(String(v || ""))
    ? v : "Időpont kiválasztása";
  const dayKey = d => isoDay(d.getFullYear(),d.getMonth()+1,d.getDate());
  const localeMonth = d => new Intl.DateTimeFormat("hu-HU",{
    month:"long",year:"numeric"
  }).format(d);
  const localToday = () => {
    const parts = new Intl.DateTimeFormat("en-CA",{
      timeZone:"Europe/Budapest",year:"numeric",month:"2-digit",day:"2-digit"
    }).formatToParts(new Date());
    const part = kind => parts.find(x=>x.type===kind)?.value;
    return isoDay(part("year"),part("month"),part("day"));
  };
  let sheet = null, currentInput = null, lastTrigger = null;
  function close() {
    if (sheet) sheet.remove();
    sheet = null; currentInput = null;
    if (lastTrigger && lastTrigger.isConnected) lastTrigger.focus({preventScroll:true});
    lastTrigger = null;
  }
  function commit(value) {
    if (!currentInput) return;
    const field = currentInput;
    field.value=value;
    field.dispatchEvent(new Event("input",{bubbles:true}));
    field.dispatchEvent(new Event("change",{bubbles:true}));
    const target=document.querySelector('[data-cc-control-for="'+field.id+'"]');
    if (target) target.textContent=field.type==="date"?dateText(value):timeText(value);
    close();
  }
  function layerFor(input,title) {
    const parent=input.closest("dialog[open]")||document.body;
    const layer=document.createElement("div");
    layer.className="cc-hu-overlay";
    layer.innerHTML='<div class="cc-hu-picker-backdrop"></div>'+
      '<section class="cc-hu-picker" role="dialog" aria-modal="true" aria-label="'+title+'">'+
      '<div class="cc-hu-picker-head"><strong>'+title+'</strong>'+
      '<button class="cc-hu-close" type="button" aria-label="Bezárás">×</button></div>'+
      '<div class="cc-hu-picker-content"></div></section>';
    layer.querySelector(".cc-hu-picker-backdrop").addEventListener("click",close);
    layer.querySelector(".cc-hu-close").addEventListener("click",close);
    parent.append(layer);
    sheet=layer;
    layer.querySelector(".cc-hu-close").focus({preventScroll:true});
    return layer.querySelector(".cc-hu-picker-content");
  }
  function openTime(input) {
    const start=/^([01]\d|2[0-3]):[0-5]\d$/.test(input.value)?input.value:"18:00";
    let [h,m]=start.split(":").map(Number);
    const content=layerFor(input,"Időpont kiválasztása · 24 órás");
    const quick=document.createElement("div");
    quick.className="cc-hu-quick-times";
    quick.setAttribute("role","listbox");
    quick.setAttribute("aria-label","Félórás időpontok");
    let nearIndex=0,nearDistance=Infinity;
    for(let i=0;i<48;i++){
      const value=TWO(Math.floor(i/2))+":"+(i%2?"30":"00");
      const item=document.createElement("button");
      item.type="button";item.className="cc-hu-quick-time";
      item.textContent=value;item.setAttribute("role","option");
      const minutes=Math.floor(i/2)*60+(i%2)*30;
      const distance=Math.abs(minutes-(h*60+m));
      if(distance<nearDistance){nearIndex=i;nearDistance=distance;}
      if(value===start){item.classList.add("chosen");item.setAttribute("aria-selected","true");}
      else item.setAttribute("aria-selected","false");
      item.addEventListener("click",()=>commit(value));
      quick.append(item);
    }
    const custom=document.createElement("button");
    custom.type="button";custom.className="cc-hu-custom-toggle";
    custom.textContent="Percenkénti beállítás (00–59)";
    const wheels=document.createElement("div");
    wheels.className="cc-hu-wheels";
    const makeWheel=(label,count,selected,choose)=>{
      const group=document.createElement("div");
      group.className="cc-hu-wheel-group";
      const title=document.createElement("div");
      title.className="cc-hu-wheel-title";
      title.textContent=label;
      const list=document.createElement("div");
      list.className="cc-hu-wheel";
      list.setAttribute("role","listbox");
      list.setAttribute("aria-label",label);
      list.tabIndex=0;
      for(let i=0;i<count;i++){
        const item=document.createElement("button");
        item.type="button";
        item.className="cc-hu-wheel-item";
        item.textContent=TWO(i);
        item.dataset.index=String(i);
        item.tabIndex=-1;
        item.setAttribute("role","option");
        item.addEventListener("click",()=>chooseValue(i,true));
        list.append(item);
      }
      function chooseValue(i,scroll){
        i=(i+count)%count;
        choose(i);
        Array.from(list.children).forEach((btn,n)=>{
          btn.classList.toggle("chosen",n===i);
          btn.setAttribute("aria-selected",String(n===i));
        });
        if(scroll) list.scrollTo({top:i*42,behavior:"smooth"});
      }
      let t=0;
      list.addEventListener("scroll",()=>{
        clearTimeout(t);
        t=setTimeout(()=>chooseValue(Math.round(list.scrollTop/42),false),85);
      },{passive:true});
      list.addEventListener("keydown",e=>{
        const keys={ArrowDown:1,ArrowUp:-1,PageDown:5,PageUp:-5};
        if(!Object.hasOwn(keys,e.key))return;
        e.preventDefault();
        const active=Math.round(list.scrollTop/42);
        chooseValue(active+keys[e.key],true);
      });
      group.append(title,list);
      requestAnimationFrame(()=>{list.scrollTop=selected*42;chooseValue(selected,false);});
      return group;
    };
    wheels.append(makeWheel("Óra",24,h,n=>{h=n;}));
    const colon=document.createElement("div");
    colon.className="cc-hu-colon";colon.textContent=":";
    wheels.append(colon,makeWheel("Perc",60,m,n=>{m=n;}));
    const actions=document.createElement("div");
    actions.className="cc-hu-actions";
    const cancel=document.createElement("button");cancel.type="button";
    cancel.className="cc-hu-cancel";cancel.textContent="Mégse";cancel.addEventListener("click",close);
    const apply=document.createElement("button");apply.type="button";
    apply.className="cc-hu-apply";apply.textContent="Beállítás";
    apply.addEventListener("click",()=>commit(TWO(h)+":"+TWO(m)));
    actions.append(cancel,apply);
    wheels.hidden=true;actions.hidden=true;
    custom.addEventListener("click",()=>{
      const precise=wheels.hidden;
      wheels.hidden=!precise;actions.hidden=!precise;quick.hidden=precise;
      custom.textContent=precise?"Félórás gyorsválasztó":"Percenkénti beállítás (00–59)";
    });
    content.append(quick,custom,wheels,actions);
    requestAnimationFrame(()=>{quick.scrollTop=Math.max(0,nearIndex*44-96);});
  }
  function openDate(input) {
    const original=asDate(input.value),today=asDate(localToday());
    const selected=original||today;
    let cursor=new Date(selected.getFullYear(),selected.getMonth(),1,12);
    const content=layerFor(input,"Dátum kiválasztása");
    const header=document.createElement("div");
    header.className="cc-hu-month-head";
    const prev=document.createElement("button");prev.type="button";prev.textContent="‹";
    prev.setAttribute("aria-label","Előző hónap");
    const title=document.createElement("strong");
    const next=document.createElement("button");next.type="button";next.textContent="›";
    next.setAttribute("aria-label","Következő hónap");
    header.append(prev,title,next);
    const weekdays=document.createElement("div");weekdays.className="cc-hu-weekdays";
    for(const day of DAYS){const x=document.createElement("span");x.textContent=day;weekdays.append(x);}
    const grid=document.createElement("div");grid.className="cc-hu-day-grid";
    const footer=document.createElement("div");footer.className="cc-hu-actions";
    const cancel=document.createElement("button");cancel.type="button";
    cancel.className="cc-hu-cancel";cancel.textContent="Mégse";cancel.addEventListener("click",close);
    const todayButton=document.createElement("button");todayButton.type="button";
    todayButton.className="cc-hu-apply";todayButton.textContent="Ma";
    todayButton.addEventListener("click",()=>commit(localToday()));
    footer.append(cancel,todayButton);
    const bounded=key=>(!input.min||key>=input.min)&&(!input.max||key<=input.max);
    function render() {
      title.textContent=localeMonth(cursor);
      grid.replaceChildren();
      const first=new Date(cursor.getFullYear(),cursor.getMonth(),1,12);
      const mondayOffset=(first.getDay()+6)%7;
      const start=new Date(first);start.setDate(start.getDate()-mondayOffset);
      for(let i=0;i<42;i++){
        const d=new Date(start);d.setDate(start.getDate()+i);
        const key=dayKey(d);
        const b=document.createElement("button");
        b.type="button";b.textContent=d.getDate();
        b.className="cc-hu-day"+(d.getMonth()!==cursor.getMonth()?" outside":"")+
          (key===input.value?" selected":"")+(key===localToday()?" today":"");
        b.disabled=!bounded(key);
        b.setAttribute("aria-label",dateText(key));
        b.addEventListener("click",()=>commit(key));
        grid.append(b);
      }
      todayButton.disabled=!bounded(localToday());
    }
    prev.addEventListener("click",()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()-1,1,12);render();});
    next.addEventListener("click",()=>{cursor=new Date(cursor.getFullYear(),cursor.getMonth()+1,1,12);render();});
    content.append(header,weekdays,grid,footer);render();
  }
  function open(input,trigger){
    if(sheet)close();
    currentInput=input;lastTrigger=trigger;
    if(input.type==="date")openDate(input);
    else openTime(input);
  }
  function upgrade(input){
    if(input.dataset.ccHungarianPicker==="1") return;
    if(input.type!=="date" && input.type!=="time")return;
    input.dataset.ccHungarianPicker="1";
    input.classList.add("cc-hu-native-input");
    if(!input.id)input.id="cc-hu-value-"+Math.random().toString(36).slice(2);
    const button=document.createElement("button");
    button.type="button";
    button.className="cc-hu-picker-trigger";
    button.dataset.ccControlFor=input.id;
    button.textContent=input.type==="date"?dateText(input.value):timeText(input.value);
    button.disabled=input.disabled;
    button.setAttribute("aria-label",input.type==="date"?"Dátum kiválasztása":"Időpont kiválasztása, 24 órás formátum");
    const icon=document.createElement("span");icon.className="cc-hu-trigger-icon";
    icon.textContent=input.type==="date"?"▦":"◷";icon.setAttribute("aria-hidden","true");
    button.append(icon);
    input.insertAdjacentElement("afterend",button);
    button.addEventListener("click",()=>open(input,button));
    input.addEventListener("input",()=>{button.firstChild.textContent=input.type==="date"?dateText(input.value):timeText(input.value);});
    input.addEventListener("change",()=>{button.firstChild.textContent=input.type==="date"?dateText(input.value):timeText(input.value);});
    const watch=new MutationObserver(()=>{
      if(!input.isConnected){watch.disconnect();return;}
      button.disabled=input.disabled;
      button.firstChild.textContent=input.type==="date"?dateText(input.value):timeText(input.value);
    });
    watch.observe(input,{attributes:true,attributeFilter:["disabled","value","min","max"]});
  }
  let pending=false;
  function scan(){
    pending=false;
    document.querySelectorAll('input[type="time"],input[type="date"]').forEach(upgrade);
  }
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(scan);
  }
  document.addEventListener("keydown",e=>{
    if(e.key==="Escape" && sheet){e.preventDefault();e.stopPropagation();close();}
  },true);
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",schedule,{once:true});
  else schedule();
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  // Expose read-only formatting to automated QA; not an app runtime API.
  Object.defineProperty(window,"__ccHungarianPickerQA",{value:Object.freeze({
    asDate,dayKey,dateText,timeText,mondayOffset:iso=>(asDate(iso).getDay()+6)%7
  }),configurable:false});
})();
