/* Club Control TEST finance analytics v1. TEST-only; server RPC enforces all access. */
(function(){
'use strict';
const FEE={coach_fee:'Edzői díj',beac_pass:'Bérlet / tagdíj',permission_fee:'Versenyengedély',mass_pass:'Bérletek',mass_training:'Edzésanalitika',audit:'Pénzügyi napló',settings:'Díjbeállítások'};
const DATA=[
 {source:'finance',name:'Pénzügyi befizetések',groups:['team','month','type','method','recipient'],metrics:['count','paid','due','amount']},
 {source:'passes',name:'Bérletértékesítés',groups:['level','month'],metrics:['count','amount']},
 {source:'trainings',name:'Edzéskihasználtság',groups:['level','slot','month'],metrics:['count','attendance','capacity','occupancy']}
];
const LABEL={team:'Csapat',month:'Hónap',type:'Díjtípus',method:'Fizetési mód',recipient:'Kedvezményezett',level:'Szint',slot:'Nap és időpont',count:'Darabszám',paid:'Fizetett tételek',due:'Fizetendő tételek',amount:'Ismert összeg (Ft)',attendance:'Jelenlétek',capacity:'Férőhelyek',occupancy:'Kihasználtság (%)'};
const hu=new Intl.NumberFormat('hu-HU');
function clean(v){return String(v===null||v===undefined?'':v)}
function esc(v){return clean(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function money(v){return v==null?'Nincs ár':hu.format(Number(v)||0)+' Ft'}
function scoped(state,category,teamId){
 return (state.financeScopes||[]).some(p=>p.category===category&&(!teamId||clean(p.teamId)===clean(teamId))&&(p.canView||p.canEdit));
}
function financeGlobal(state){
 return (state.permissions||[]).some(p=>p==='*'||(p&&p.moduleKey==='competition.fees'&&!p.teamId&&(p.canView||p.canEdit)));
}
function financeVisible(state){return financeGlobal(state)||(state.financeScopes||[]).some(p=>p.canView||p.canEdit)}
function demo(){
 const names=['Teszt Anna','Teszt Bence','Teszt Csilla','Teszt Dóra','Teszt Emese','Teszt Ferenc'];
 const teams=[['Női I.','t-w1'],['Női II.','t-w2'],['Férfi','t-men']];
 const finance=[];
 teams.forEach((t,j)=>names.forEach((name,i)=>['coach_fee','beac_pass','permission_fee'].forEach((ft,k)=>{
   const paid=(i+j+k)%4!==0,amount=ft==='permission_fee'?12000:ft==='coach_fee'?7000:7000;
   finance.push({playerId:'demo-'+j+'-'+i,playerName:name,teamName:t[0],teamId:t[1],feeType:ft,period:ft==='permission_fee'?'':'2026-'+(i%2?'10':'11'),status:paid?'paid':'due',amountHuf:amount,paidAt:paid?'2026-11-04':null,paymentMethod:i%3===0?'cash':i%3===1?'revolut':'transfer',paidTo:i%3===0?'Csapatpénztár':i%3===1?'Edző':'BEAC',source:'DEMO'});
 })));
 const levels=['Kezdő','Középhaladó','Haladó','Versenyzői'];
 const passes=levels.flatMap((level,j)=>Array.from({length:5+j*3},(_,i)=>({level,validMonth:'2026-'+(i%2?'10':'11'),amountHuf:7000+(j%2)*1000,product:'Minta bérlet',purchaseDate:'2026-11-01'})));
 const trainings=levels.flatMap((level,j)=>Array.from({length:7},(_,i)=>({level,eventDate:'2026-11-'+String(2+i*2).padStart(2,'0'),startTime:(j===0?'17:30':j===1?'18:30':j===2?'19:00':'20:00'),court:'BEAC',capacity:j===2?18:24,booked:10+j*3+(i%3)*2,attended:8+j*3+(i%3),cancelled:i%3,unknownAttendance:0})));
 return {finance,passes,trainings};
}
function authorizedData(state){
 const raw=state.financeAnalytics||{finance:[],passes:[],trainings:[]};
 const demoMode=!!state.financeAnalyticsDemo;
 const d=demoMode?demo():raw;
 const getAllowedTeam=name=> (state.financeScopes||[]).some(s=>s.teamName===name&&s.canView);
 return {
  finance:(d.finance||[]).filter(x=>demoMode?getAllowedTeam(x.teamName)&&scoped(state,x.feeType):scoped(state,x.feeType,x.teamId)),
  passes:scoped(state,'mass_pass')?(d.passes||[]):[],
  trainings:scoped(state,'mass_training')?(d.trainings||[]):[]
 };
}
function dateMonth(v){return clean(v).slice(0,7)||'Nincs hónap'}
function slot(v){
 const d=new Date(clean(v.eventDate).slice(0,10)+'T12:00:00');
 return (Number.isNaN(d.getTime())?'?':new Intl.DateTimeFormat('hu-HU',{weekday:'long'}).format(d))+' '+clean(v.startTime).slice(0,5)
}
function groupKey(row,source,group){
 if(group==='team')return clean(row.teamName)||'Nincs csapat';
 if(group==='type')return FEE[row.feeType]||row.feeType||'Egyéb';
 if(group==='month')return dateMonth(source==='finance'?row.period:source==='passes'?row.validMonth:row.eventDate);
 if(group==='method')return ({cash:'Készpénz',revolut:'Revolut',transfer:'Átutalás',online:'Online'})[row.paymentMethod]||row.paymentMethod||'Ismeretlen';
 if(group==='recipient')return row.paidTo||'Nincs rögzítve';
 if(group==='level')return row.level||'Ismeretlen';
 if(group==='slot')return slot(row);
 return 'Összesen';
}
function calc(rows,source,metric){
 if(metric==='count')return rows.length;
 if(metric==='paid')return rows.filter(x=>['paid','prior_paid'].includes(x.status)).length;
 if(metric==='due')return rows.filter(x=>x.status==='due').length;
 if(metric==='amount')return rows.reduce((n,x)=>n+((source!=='finance'||['paid','prior_paid'].includes(x.status))&&x.amountHuf!=null?Number(x.amountHuf)||0:0),0);
 if(metric==='attendance')return rows.reduce((n,x)=>n+Number(x.attended||0),0);
 if(metric==='capacity')return rows.reduce((n,x)=>n+Number(x.capacity||0),0);
 if(metric==='occupancy'){const cap=calc(rows,source,'capacity');return cap?Math.round(calc(rows,source,'attendance')/cap*100):0}
 return 0;
}
function grouped(rows,source,group,metric){
 const m=new Map();rows.forEach(r=>{const k=groupKey(r,source,group);m.set(k,(m.get(k)||[]).concat(r))});
 return Array.from(m.entries()).map(([label,items])=>({label,items,value:calc(items,source,metric)})).sort((a,b)=>b.value-a.value||a.label.localeCompare(b.label,'hu'));
}
function demoAllowed(state){return (state.financeScopes||[]).some(s=>s.canView||s.canEdit)}
function render(state){
 const raw=state.financeAnalytics||{finance:[],passes:[],trainings:[]};
 const specs=DATA.filter(d=>d.source==='finance'?(state.financeScopes||[]).some(s=>['coach_fee','beac_pass','permission_fee'].includes(s.category)&&s.canView):d.source==='passes'?scoped(state,'mass_pass'):scoped(state,'mass_training'));
 if(!specs.length)return '<article class="panel"><div class="inline-error">Ehhez a kimutatáshoz nincs pénzügyi jogosultságod.</div></article>';
 if(state.financeAnalyticsError)return '<article class="panel"><div class="inline-error">'+esc(state.financeAnalyticsError)+'</div></article>';
 if(state.financeAnalyticsLoading||!state.financeAnalytics)return '<article class="panel"><div class="loading-inline">Az elemzések betöltése…</div></article>';
 const source=specs.some(x=>x.source===state.financeInsightsSource)?state.financeInsightsSource:specs[0].source;
 const spec=specs.find(x=>x.source===source),group=spec.groups.includes(state.financeInsightsGroup)?state.financeInsightsGroup:spec.groups[0],metric=spec.metrics.includes(state.financeInsightsMetric)?state.financeInsightsMetric:spec.metrics[0];
 const d=authorizedData(state),teams=(state.financeScopes||[]).filter(p=>p.teamId&&p.canView).reduce((a,x)=>(a.find(y=>y.id===x.teamId)||a.push({id:x.teamId,name:x.teamName}),a),[]);
 const teamId=state.financeInsightsTeam||'',feeType=state.financeInsightsFee||'',month=state.financeInsightsMonth||'';
 const rows=(d[source]||[]).filter(r=>(source!=='finance'||(!teamId||r.teamId===teamId)&&(!feeType||r.feeType===feeType))
   &&(!month||dateMonth(source==='finance'?r.period:source==='passes'?r.validMonth:r.eventDate)===month));
 const groups=grouped(rows,source,group,metric),maximum=Math.max(1,...groups.map(x=>x.value));
 const example=!!state.financeAnalyticsDemo,actual=(raw.finance||[]).length+(raw.passes||[]).length+(raw.trainings||[]).length;
 const selector=(id,value,options)=>'<select id="'+id+'">'+options.map(o=>'<option value="'+esc(o[0])+'" '+(clean(value)===clean(o[0])?'selected':'')+'>'+esc(o[1])+'</option>').join('')+'</select>';
 const viewSelector=selector('ccFinanceInsightsSource',source,specs.map(x=>[x.source,x.name]));
 const groupSelector=selector('ccFinanceInsightsGroup',group,spec.groups.map(x=>[x,LABEL[x]]));
 const metricSelector=selector('ccFinanceInsightsMetric',metric,spec.metrics.map(x=>[x,LABEL[x]]));
 const teamSelector=selector('ccFinanceInsightsTeam',teamId,[['','Minden elérhető csapat'],...teams.map(x=>[x.id,x.name])]);
 const feeSelector=selector('ccFinanceInsightsFee',feeType,[['','Minden engedélyezett díj'],...['coach_fee','beac_pass','permission_fee'].filter(x=>(state.financeScopes||[]).some(p=>p.category===x&&p.canView)).map(x=>[x,FEE[x]])]);
 const monthSelector=selector('ccFinanceInsightsMonth',month,[['','Minden hónap'],...Array.from(new Set((d[source]||[]).map(x=>dateMonth(source==='finance'?x.period:source==='passes'?x.validMonth:x.eventDate)))).filter(x=>x!=='Nincs hónap').sort().reverse().map(x=>[x,x])]);
 const metricSum=calc(rows,source,metric);
 const cards=source==='finance'?[
   ['Fizetett (ismert összeg)',money(calc(rows,'finance','amount'))],
   ['Fizetett tételek',hu.format(calc(rows,'finance','paid'))],
   ['Fizetendő tételek',hu.format(calc(rows,'finance','due'))],
   ['Hiányos összegek',hu.format(rows.filter(x=>['paid','prior_paid'].includes(x.status)&&x.amountHuf==null).length)]
 ]:source==='passes'?[
   ['Bérletek száma',hu.format(rows.length)],['Ismert bevétel',money(calc(rows,'passes','amount'))],
   ['Ár nélküli tételek',hu.format(rows.filter(x=>x.amountHuf==null).length)]
 ]:[
   ['Edzések száma',hu.format(rows.length)],['Foglalások',hu.format(rows.reduce((n,x)=>n+Number(x.booked||0),0))],
   ['Jelenlétek',hu.format(calc(rows,'trainings','attendance'))],
   ['Kihasználtság',calc(rows,'trainings','occupancy')+'%']
 ];
 const graph=groups.map(g=>'<div class="cc-fi-bar-row"><div class="cc-fi-bar-label">'+esc(g.label)+'</div><div class="cc-fi-bar-bg"><span style="width:'+Math.max(g.value>0?2:0,Math.round(g.value/maximum*100))+'%"></span></div><b>'+esc(metric==='amount'?money(g.value):metric==='occupancy'?g.value+'%':hu.format(g.value))+'</b></div>').join('')||'<p>Nincs adat ehhez a szűréshez.</p>';
 const table=groups.map(g=>'<tr><th>'+esc(g.label)+'</th><td>'+hu.format(g.items.length)+'</td><td>'+esc(metric==='amount'?money(g.value):metric==='occupancy'?g.value+'%':hu.format(g.value))+'</td></tr>').join('');
 const details=source==='finance'?'<div class="cc-fi-table-scroll"><table class="finance-matrix"><thead><tr><th>Csapat</th><th>Játékos</th><th>Díjtípus</th><th>Hónap</th><th>Állapot</th><th>Összeg</th><th>Fizetés módja</th><th>Kedvezményezett</th></tr></thead><tbody>'+rows.slice(0,300).map(r=>'<tr><td>'+esc(r.teamName)+'</td><td>'+esc(r.playerName)+'</td><td>'+esc(FEE[r.feeType]||r.feeType)+'</td><td>'+esc(r.period||'–')+'</td><td>'+esc(r.status==='paid'?'Fizetve':r.status==='prior_paid'?'Korábban fizetve':r.status==='waived'?'Elengedve':'Fizetendő')+'</td><td>'+esc(money(r.amountHuf))+'</td><td>'+esc(r.paymentMethod||'–')+'</td><td>'+esc(r.paidTo||'–')+'</td></tr>').join('')+'</tbody></table></div>':'';
 const saved=state.financeSavedViews||[];
 const savedList='<select id="ccFiSaved"><option value="">Mentett kimutatások</option>'+saved.map(r=>'<option value="'+esc(r.id)+'">'+esc(r.title)+'</option>').join('')+'</select>';
 return '<section class="cc-fi-analytics">'+
   '<div class="cc-fi-heading"><div><h2>Pénzügyi és edzésanalitika</h2><p>Csak a jogosultságodhoz tartozó adatok. A bevétel nem azonos az előírt díjjal.</p></div>'+
   '<div class="cc-fi-mode"><label><input id="ccFiDemo" type="checkbox" '+(example?'checked':'')+'> <b>TEST mintaadatok</b></label></div></div>'+
   (example?'<div class="cc-fi-demo-banner">TEST BEMUTATÓ · MINDEN ÖSSZEG ÉS NÉV KITALÁLT · NEM VALÓDI BEVÉTEL</div>':
     '<div class="cc-fi-source-banner">Valós TEST adatok · '+actual+' rendelkezésre álló adatpont. Hiányos vagy nulla ár nem számít ismert bevételnek.</div>')+
   '<div class="cc-fi-filters"><label>Elemzés'+viewSelector+'</label><label>Csoportosítás'+groupSelector+'</label><label>Mutató'+metricSelector+'</label>'+
   (source==='finance'?'<label>Csapat'+teamSelector+'</label><label>Díjtípus'+feeSelector+'</label>':'')+'<label>Hónap'+monthSelector+'</label></div>'+
   '<div class="cc-fi-kpis">'+cards.map(c=>'<div><small>'+esc(c[0])+'</small><b>'+esc(c[1])+'</b></div>').join('')+'</div>'+
   '<div class="cc-fi-panel-grid"><article class="panel"><h3>'+esc(LABEL[metric])+' – '+esc(LABEL[group])+'</h3><div class="cc-fi-chart">'+graph+'</div></article>'+
   '<article class="panel"><h3>Összesítés</h3><table class="cc-fi-table"><thead><tr><th>'+esc(LABEL[group])+'</th><th>Tételek</th><th>'+esc(LABEL[metric])+'</th></tr></thead><tbody>'+table+'</tbody></table><p class="cc-fi-total">Összesen: '+esc(metric==='amount'?money(metricSum):metric==='occupancy'?metricSum+'%':hu.format(metricSum))+'</p></article></div>'+
   (details?'<article class="panel cc-fi-details"><h3>Tételes adatok</h3>'+details+'</article>':'')+
   '<article class="panel cc-fi-saved"><h3>Kimutatásépítő és mentett nézetek</h3><p>Az aktuális szűrők, csoportosítás és mutató névvel elmenthetők. Az export csak az engedélyezett adatokat tartalmazza.</p>'+
   '<div class="cc-fi-save-controls"><input id="ccFiViewName" maxlength="100" placeholder="Kimutatás neve…">'+
   '<button type="button" class="button primary small" id="ccFiSave">Nézet mentése</button>'+savedList+
   '<button type="button" class="button quiet small" id="ccFiLoad">Megnyitás</button><button type="button" class="button quiet small" id="ccFiDelete">Törlés</button>'+
   '<button type="button" class="button quiet small" id="ccFiCSV">CSV export</button></div></article>'+
   (source==='trainings'?'<p class="cc-fi-warning">Az időpontjavaslatokhoz több hét azonos szintű, ellenőrzött jelenléti adata szükséges. A foglalás nem egyenlő a részvétellel.</p>':'')+
   '</section>';
}
function csvCell(v){let s=clean(v);if(/^[=+\-@\t\r]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"'}
function exportCSV(state){
 const spec=DATA.find(x=>x.source===state.financeInsightsSource)||DATA[0],source=spec.source,data=authorizedData(state),rows=data[source]||[];
 const fields=source==='finance'?['teamName','playerName','feeType','period','status','amountHuf','paymentMethod','paidTo']:source==='passes'?['level','product','validMonth','amountHuf']:['eventDate','startTime','level','capacity','booked','attended','cancelled'];
 const filtered=rows.filter(x=>(source!=='finance'||(!state.financeInsightsTeam||x.teamId===state.financeInsightsTeam)&&(!state.financeInsightsFee||x.feeType===state.financeInsightsFee))&&(!state.financeInsightsMonth||dateMonth(source==='finance'?x.period:source==='passes'?x.validMonth:x.eventDate)===state.financeInsightsMonth));
 const csv='\ufeff'+fields.map(csvCell).join(';')+'\n'+filtered.map(r=>fields.map(k=>csvCell(r[k])).join(';')).join('\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download='club-control-'+source+(state.financeAnalyticsDemo?'-MINTA':'')+'.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function currentConfig(state){
 const source=state.financeInsightsSource||'finance',spec=DATA.find(x=>x.source===source)||DATA[0];
 return {source,groupBy:spec.groups.includes(state.financeInsightsGroup)?state.financeInsightsGroup:spec.groups[0],
 metric:spec.metrics.includes(state.financeInsightsMetric)?state.financeInsightsMetric:spec.metrics[0],
 teamId:state.financeInsightsTeam||'',feeType:state.financeInsightsFee||'',month:state.financeInsightsMonth||''};
}
function bind({state,rpc,rerender,toast}){
 const field=(id,key)=>{const e=document.getElementById(id);if(e)e.addEventListener('change',()=>{state[key]=e.value;rerender()})};
 field('ccFinanceInsightsSource','financeInsightsSource');
 field('ccFinanceInsightsGroup','financeInsightsGroup');
 field('ccFinanceInsightsMetric','financeInsightsMetric');
 field('ccFinanceInsightsTeam','financeInsightsTeam');
 field('ccFinanceInsightsFee','financeInsightsFee');
 field('ccFinanceInsightsMonth','financeInsightsMonth');
 const demo=document.getElementById('ccFiDemo');if(demo)demo.addEventListener('change',()=>{state.financeAnalyticsDemo=demo.checked;rerender()});
 const save=document.getElementById('ccFiSave');if(save)save.onclick=async()=>{
   const title=document.getElementById('ccFiViewName').value.trim();if(!title){toast('Adj nevet a kimutatásnak.','error');return}
   try{await rpc('cc_manager_finance_saved_views_v1',{p_action:'save',p_id:null,p_title:title,p_config:currentConfig(state)});
    state.financeSavedViews=await rpc('cc_manager_finance_saved_views_v1',{p_action:'list'});toast('Kimutatás mentve.','success');rerender()}
   catch(e){toast(e.message||'Mentés sikertelen','error')}
 };
 const load=document.getElementById('ccFiLoad');if(load)load.onclick=()=>{
   const id=document.getElementById('ccFiSaved').value,x=(state.financeSavedViews||[]).find(v=>v.id===id);
   if(!x)return;const c=x.config||{},spec=DATA.find(s=>s.source===c.source);
   if(!spec){toast('Ismeretlen kimutatás.','error');return}
   state.financeInsightsSource=c.source;state.financeInsightsGroup=c.groupBy;state.financeInsightsMetric=c.metric;
   state.financeInsightsTeam=c.teamId||'';state.financeInsightsFee=c.feeType||'';state.financeInsightsMonth=c.month||'';rerender()
 };
 const del=document.getElementById('ccFiDelete');if(del)del.onclick=async()=>{
   const id=document.getElementById('ccFiSaved').value;if(!id)return;
   try{await rpc('cc_manager_finance_saved_views_v1',{p_action:'delete',p_id:id,p_title:null,p_config:null});
    state.financeSavedViews=await rpc('cc_manager_finance_saved_views_v1',{p_action:'list'});rerender();toast('Mentett nézet törölve.','success')}
   catch(e){toast(e.message||'Törlés sikertelen.','error')}
 };
 const csv=document.getElementById('ccFiCSV');if(csv)csv.onclick=()=>exportCSV(state);
}
function adminPanelHtml({admin,state}){
 if(!admin||!admin.id)return '';
 const raw=(state.adminFinanceRights||{})[admin.id];
 if(!raw)return '<article class="cc-fi-admin-permissions"><h4>Pénzügyi részjogosultságok</h4><p>Betöltés…</p></article>';
 const teams=(state.adminTeams.length?state.adminTeams:state.teams).filter(x=>x.active!==false);
 const controls=[];
 function row(category,team){
   const existing=raw.find(x=>x.category===category&&clean(x.teamId)===clean(team?.id)),inherited=!!existing?.inherited;
   const label=(team?team.name+' · ':'')+FEE[category];
   controls.push('<div class="cc-fi-permission-row" data-fi-grant="'+esc(category)+'" data-fi-team="'+esc(team?.id||'')+'" data-fi-inherited="'+(inherited?'1':'0')+'">'+
    '<span>'+esc(label)+(inherited?'<small> Örökölt klubjog</small>':'')+'</span>'+
    '<label><input type="checkbox" data-fi-view '+(existing?.canView?'checked':'')+(inherited?' disabled':'')+'> Láthatja</label>'+
    '<label><input type="checkbox" data-fi-edit '+(existing?.canEdit?'checked':'')+(inherited?' disabled':'')+'> Szerkesztheti</label></div>');
 }
 teams.forEach(t=>['beac_pass','coach_fee','permission_fee'].forEach(c=>row(c,t)));
 ['mass_pass','mass_training','audit','settings'].forEach(c=>row(c,null));
 return '<section class="cc-fi-admin-permissions"><h4>Pénzügyi részjogosultságok</h4>'+
 '<p>Csapat × díjtípus. A csak-megtekintés külön engedély. A régi, teljes Pénzügyek-jog minden részjogot felülír.</p>'+
 controls.join('')+
 '<button type="button" class="button quiet small" id="ccFiGrantSave" data-fi-admin="'+esc(admin.id)+'">Részjogosultságok mentése</button></section>';
}
function bindAdmin({state,rpc,toast,rerender}){
 const btn=document.getElementById('ccFiGrantSave');if(!btn)return;
 btn.onclick=async()=>{
  const rows=Array.from(document.querySelectorAll('[data-fi-grant]')).filter(x=>x.dataset.fiInherited!=='1');
  const data=rows.map(x=>({category:x.dataset.fiGrant,teamId:x.dataset.fiTeam||null,
    canView:x.querySelector('[data-fi-view]').checked,canEdit:x.querySelector('[data-fi-edit]').checked}))
    .filter(x=>x.canView||x.canEdit).map(x=>({...x,canView:x.canView||x.canEdit}));
  btn.disabled=true;
  try{await rpc('cc_manager_finance_acl_save_v1',{p_manager_id:btn.dataset.fiAdmin,p_scopes:data});
   state.adminFinanceRights[btn.dataset.fiAdmin]=await rpc('cc_manager_finance_scopes_v1',{p_manager_id:btn.dataset.fiAdmin});
   toast('Pénzügyi részjogosultságok mentve.','success');rerender()}
  catch(e){btn.disabled=false;toast(e.message||'Pénzügyi jog mentése sikertelen.','error')}
 };
 document.querySelectorAll('[data-fi-grant]').forEach(row=>{
  const v=row.querySelector('[data-fi-view]'),e=row.querySelector('[data-fi-edit]');
  if(v&&e){v.addEventListener('change',()=>{if(!v.checked)e.checked=false});e.addEventListener('change',()=>{if(e.checked)v.checked=true})}
 });
}
window.CCFinanceAnalytics=Object.freeze({render,bind,adminPanelHtml,bindAdmin,financeVisible,financeGlobal,scoped,demo});
})();