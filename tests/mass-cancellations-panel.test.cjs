/* Mass cancellation disclosure contract: read-only, under waitlist, independent of attendance. */
'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path');
const app=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
const css=fs.readFileSync(path.join(__dirname,'..','styles.css'),'utf8');
const sql=fs.readFileSync(path.join(__dirname,'..','supabase/migrations/20261015173000_cc_manager_mass_cancellations_read_v1.sql'),'utf8');
const start=app.indexOf('  function massCancellationStatus_(');
const end=app.indexOf('  function massWaitlistCard_(',start);
assert.ok(start>=0&&end>start,'renderer extracted from actual Manager source');
const encode=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const api=new Function('text','esc','safeDate','fmtDate','fmtTime',app.slice(start,end)+';return{massCancellationStatus_,massCancellationPanelHtml_}')(
 x=>String(x??'').trim(),encode,x=>{const d=x?new Date(x):null;return d&&!Number.isNaN(d.getTime())?d:null},
 d=>d.toISOString().slice(0,10),d=>d.toISOString().slice(11,16));
const cancelled=[
 {id:'1',name:'Késői játékos',email:'late@example.test',bookingStatus:'KÉSŐN LEMONDVA',cancellationType:'KÉSŐI',cancelledAt:'2026-10-15T12:00:00Z'},
 {id:'2',name:'Admin levette',email:'admin@example.test',bookingStatus:'LEMONDVA',cancellationType:'ADMIN TÖRLÉS',cancelledAt:'2026-10-15T13:00:00Z'},
 {id:'3',name:'<script>alert(1)</script>',email:'normal@example.test',bookingStatus:'LEMONDVA',cancellationType:'IDŐBEN',cancelledAt:'2026-10-15T11:00:00Z'}
];
test('Accordion is closed by default, counts records and sorts by cancellation time',()=>{
 const html=api.massCancellationPanelHtml_(cancelled);
 assert.match(html,/<details class="mass-cancellations-panel" id="massCancelledPanel" >/);
 assert.match(html,/Lemondások és törlések<\/span><b>3<\/b>/);
 assert.ok(html.indexOf('Admin levette')<html.indexOf('Késői játékos'));
 assert.ok(html.indexOf('Késői játékos')<html.indexOf('&lt;script&gt;'));
 assert.ok(!html.includes('<script>'));
});
test('Cancellation type distinguishes late player cancellation from administrator removal',()=>{
 assert.equal(api.massCancellationStatus_(cancelled[0]),'Késői lemondás');
 assert.equal(api.massCancellationStatus_(cancelled[1]),'Adminisztrátori törlés');
 assert.equal(api.massCancellationStatus_(cancelled[2]),'Időben lemondva');
});
test('Compact inline disclosure excludes email and full detail preserves user state',()=>{
 const inline=api.massCancellationPanelHtml_(cancelled,{compact:true}),open=api.massCancellationPanelHtml_(cancelled,{open:true});
 assert.ok(inline.includes('massInlineCancelledPanel'));
 assert.ok(!inline.includes('@example.test'));
 assert.ok(open.includes('id="massCancelledPanel" open>'));
 assert.ok(app.includes("const cancelled=root.querySelector('#massCancelledPanel');if(cancelled)ui.cancelledOpen=cancelled.open"));
});
test('Empty and unavailable histories have different states',()=>{
 const empty=api.massCancellationPanelHtml_([]),unavailable=api.massCancellationPanelHtml_([],{unavailable:true});
 assert.ok(empty.includes('Nincs lemondás'));
 assert.ok(unavailable.includes('nem érhetők el'));
 assert.ok(unavailable.includes('<b>–</b>'));
 assert.ok(!unavailable.includes('Nincs lemondás'));
});
test('Detail and inline UI include accordion after waitlist and active attendance remains separate',()=>{
 const inlineStart=app.indexOf('  async function toggleMassInlineRoster_(');
 const inlineEnd=app.indexOf('  function bindMassLegacyRows()',inlineStart);
 const detailStart=app.indexOf('  async function openMassEventDetail(');
 const detailEnd=app.indexOf('  async function toggleMassRegistrationGate(',detailStart);
 const inline=app.slice(inlineStart,inlineEnd),detail=app.slice(detailStart,detailEnd);
 assert.ok(inline.includes('massCancellationPanelHtml_(data?.cancelled,{compact:true'));
 assert.ok(inline.indexOf('wait.map(')<inline.indexOf('massCancellationPanelHtml_'));
 assert.ok(detail.indexOf('wait.map(massWaitlistCard_)')<detail.indexOf('massCancellationPanelHtml_(cancelled'));
 assert.ok(detail.includes('bookings.map(r=>'));
 assert.ok(!detail.includes('cancelled.map(massBookingCard_'));
});
test('Optional cancellation RPC failure cannot take down active event roster',()=>{
 const load=app.slice(app.indexOf('  async function loadMassEventDetail('),app.indexOf('  function matrixRange()'));
 assert.ok(load.includes("rpc('cc_manager_mass_cancellations_v1'"));
 assert.ok(load.includes('.catch(err=>'));
 assert.ok(load.includes('data.cancelledUnavailable=cancelledResult.unavailable'));
 assert.ok(load.includes("rpc('cc_manager_mass_attendance_snapshot_r1_v1'"));
});
test('SQL is readonly, permission guarded, exact-event scoped and least-privileged',()=>{
 assert.match(sql,/private\.cc_manager_require_any_v1\('mass\.trainings','view'\)/);
 assert.match(sql,/e\.id=btrim\(coalesce\(p_event_id,''\)\)/);
 assert.match(sql,/b\.source_workbook_id=v_event\.source_workbook_id/);
 assert.match(sql,/b\.event_id=v_event\.id/);
 assert.match(sql,/b\.booking_status in \('LEMONDVA','KÉSŐN LEMONDVA'\)/);
 assert.match(sql,/revoke all on function .* from public, anon/i);
 assert.match(sql,/grant execute on function .* to authenticated/i);
 assert.ok(!/\b(?:insert|update|delete|truncate)\s+(?:into|public\.)/i.test(sql),'no write to bookings or event rows');
 assert.ok(!sql.includes('cancellation_token'),'never leak cancel token');
});
test('Mobile disclosure is styled and uses native details/summary',()=>{
 assert.ok(css.includes('.mass-cancellations-panel summary'));
 assert.ok(css.includes('.mass-cancellation-person'));
 assert.ok(css.includes('@media(max-width:520px)'));
});

test('Reopening an inline roster refreshes cancellations and retains open panel state',async()=>{
 const begin=app.indexOf('  async function toggleMassInlineRoster_(');
 const end=app.indexOf('  function bindMassLegacyRows()',begin);
 assert.ok(begin>=0&&end>begin,'inline roster handler exists');
 let calls=0,wasOpen=false;
 const holder={hidden:true,dataset:{loaded:'0'},innerHTML:'',querySelector:()=>wasOpen?{open:true}:null};
 const button={setAttribute(){},classList:{toggle(){}}};
 const func=new Function('document','CSS','loadMassEventDetail','massPersonSort_','massPassInfo_','text','esc','emptyInline','massCancellationPanelHtml_',
   app.slice(begin,end)+';return toggleMassInlineRoster_;')(
   {querySelector:()=>holder},{escape:x=>String(x)},
   async()=>{calls++;return{event:{},bookings:[],waitlist:[],cancelled:[{name:calls===1?'Első lemondás':'Új lemondás'}]}},
   ()=>0,()=>({needsCheck:false}),x=>String(x??''),encode,
   label=>'<p>'+encode(label)+'</p>',(rows,opts)=>'<details data-open="'+opts.open+'">'+rows.map(r=>encode(r.name)).join(',')+'</details>'
 );
 await func('training-1',button);
 assert.equal(calls,1);
 assert.ok(holder.innerHTML.includes('Első lemondás'));
 assert.equal(holder.hidden,false);
 await func('training-1',button);
 assert.equal(holder.hidden,true);
 assert.equal(calls,1,'closing never triggers requests');
 wasOpen=true;
 await func('training-1',button);
 assert.equal(calls,2,'reopening MUST reload fresh cancellation rows');
 assert.ok(holder.innerHTML.includes('Új lemondás'));
 assert.ok(!holder.innerHTML.includes('Első lemondás'));
 assert.ok(holder.innerHTML.includes('data-open="true"'));
});
