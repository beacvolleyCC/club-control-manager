const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const sql=fs.readFileSync('supabase/migrations/20261014153502_cc_manager_competition_change_audit_readonly_v1.sql','utf8');
const start=js.indexOf('  function ccCompetitionAuditLabel_(');
const end=js.indexOf('  const CC_BRSZ_COMPETITION_HTML_V1=',start);
assert.ok(start>0&&end>start);
const ctx={
 text:x=>String(x??'').trim(),
 esc:x=>String(x??'').replace(/[&<>'"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch])),
 fmtDate:x=>String(x).slice(0,10),fmtTime:x=>String(x).slice(11,16),num:x=>String(x)
};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end)+'\nthis.qa={rows:ccCompetitionAuditRowsHtml_};',ctx);
const entries=[
 {eventId:'match-one',eventExists:true,changeType:'opponent',detectedAt:'2026-10-02T10:00:00Z',
  before:{title:'BEAC II – BDTSE Taksony',startsAt:'2026-11-17T18:30:00Z'},
  after:{title:'BEAC II – MTK kék',startsAt:'2026-11-17T18:30:00Z'},
  responses:{total:4,going:3,notGoing:1,unknown:0}},
 {eventId:'match-new',eventExists:true,changeType:'created',detectedAt:'2026-10-02T10:01:00Z',
  before:{},after:{title:'BEAC – MAFC',startsAt:'2026-10-22T17:30:00Z'},
  responses:{total:0,going:0,notGoing:0,unknown:0}}
];
test('opponent changes are visible with old/new values and CURRENT RSVP count',()=>{
 const html=ctx.qa.rows(entries,'updated');
 assert.ok(html.includes('BDTSE Taksony'));
 assert.ok(html.includes('MTK kék'));
 assert.ok(html.includes('Jelenlegi válaszok: <b>4</b> · Jövök: 3 · Nem jövök: 1'));
 assert.ok(html.includes('data-cc-audit-event="match-one"'));
 assert.ok(!html.includes('BEAC – MAFC'));
});
test('created entries have a dedicated scope and missing events have no open action',()=>{
 const html=ctx.qa.rows([{...entries[1],eventExists:false}],'created');
 assert.ok(html.includes('BEAC – MAFC'));
 assert.ok(!html.includes('data-cc-audit-event='));
 assert.ok(html.includes('Nem található kapcsolt meccs'));
 assert.ok(!html.includes('<s>'));
});
test('audit HTML escapes untrusted source data',()=>{
 const html=ctx.qa.rows([{...entries[1],after:{title:'<img src=x onerror=alert(1)>'}}]);
 assert.ok(html.includes('&lt;img'));
 assert.ok(!html.includes('<img'));
});
test('authenticated read-only RPC is used exclusively by Manager changes view',()=>{
 assert.ok(sql.includes("private.cc_manager_require_any_v1('competition.matches','view')"));
 assert.ok(sql.includes('public.competition_source_changes c'));
 assert.ok(sql.includes('public.availability a'));
 assert.ok(sql.includes('grant execute on function public.cc_manager_competition_change_audit_v1(integer) to authenticated'));
 assert.ok(!/\b(update|delete|insert into)\s+public\.(events|availability|competition_source_changes)/i.test(sql));
 assert.ok(js.includes("rpc('cc_manager_competition_change_audit_v1',{p_limit:100})"));
 assert.ok(js.includes('id="ccCompetitionChangeAudit"'));
 assert.ok(js.includes("$('#ccCompetitionChangeAudit')?.addEventListener('click',ccOpenCompetitionChangeAudit_)"));
 assert.ok(js.includes('ccCompetitionAuditRowsHtml_(items,text(e.target.value))'));
 assert.ok(css.includes('.cc-audit-item'));
});
