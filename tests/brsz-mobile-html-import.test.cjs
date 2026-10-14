const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const start=js.indexOf('  const CC_BRSZ_COMPETITION_HTML_V1=');
const end=js.indexOf('  const CC_BRSZ_HELPER_PAGE_SOURCE=',start);
assert.ok(start>0&&end>start);
const ctx={TextDecoder,Uint8Array,btoa:s=>Buffer.from(s,'binary').toString('base64'),text:x=>String(x||'')};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end)+'\nthis.qa={prepare:ccPrepareBrszHtmlDocuments_,detect:ccBRSZCompetitionIdFromHtml_};',ctx);
const input=id=>{
 const html='<!-- saved from url=(0080)https://www.brsz.hu/bajnoksagok.php?bajnoksag_id='+id+' -->'+'<html><body>bajnoksag_id='+id+'</body></html>';
 const bytes=Buffer.from(html,'utf8');
 return {name:'brsz-'+id+'.html',size:bytes.byteLength,arrayBuffer:async()=>Uint8Array.from(bytes).buffer};
};
test('all three saved BRSZ pages can be selected and encoded on iPhone',async()=>{
 const files=['1121','1137','1146'].map(input);
 const docs=await ctx.qa.prepare(files);
 assert.deepEqual(Array.from(docs,x=>x.competitionId),['1121','1137','1146']);
 for(const doc of docs){
   const html=Buffer.from(doc.contentBase64,'base64').toString('utf8');
   assert.ok(html.includes('bajnoksag_id='+doc.competitionId));
 }
});
test('duplicate or missing BRSZ championship pages fail before any import',async()=>{
 await assert.rejects(ctx.qa.prepare([input('1121'),input('1121'),input('1137')]),/kétszer/);
 await assert.rejects(ctx.qa.prepare([input('1121'),input('1146')]),/Hiányzó BRSZ oldal/);
 await assert.rejects(ctx.qa.prepare([{...input('1121'),size:800000},input('1146'),input('1137')]),/túl nagy/);
});
test('Manager BRSZ menu has functional separate mobile HTML and desktop helper actions',()=>{
 const start=js.indexOf('  function ccOpenBrszSyncOptions_(){'),end=js.indexOf('  async function runCompetitionSourceSync_(',start);
 assert.ok(start>0&&end>start);
 const menu=js.slice(start,end);
 assert.ok(menu.includes('id="ccBrszSyncMobile"'));
 assert.ok(menu.includes('id="ccBrszSyncHelper"'));
 assert.ok(menu.includes("runCompetitionSourceSync_('html_import')"));
 assert.ok(menu.includes("runCompetitionSourceSync_('browser_helper')"));
 assert.ok(js.includes("$('#competitionSourceSync')?.addEventListener('click',ccOpenBrszSyncOptions_)"));
});
test('the two paths use the same existing Edge Function and preserve event links',()=>{
 const start=js.indexOf('  async function runCompetitionSourceSync_(mode=');
 const end=js.indexOf('  // Competition schedule snapshot.',start);
 assert.ok(start>0&&end>start);
 const fn=js.slice(start,end);
 assert.ok(fn.includes('ccPickBrszHtmlFiles_()'));
 assert.ok(fn.includes('ccPrepareBrszHtmlDocuments_(selected)'));
 assert.ok(fn.includes('ccValidateHelperDocuments_(await ccRequestBrszHelperDocuments_())'));
 assert.ok(fn.includes("functions.invoke('cc-competition-sync'"));
 assert.ok(fn.includes('mode,documents'));
 assert.ok(!fn.includes("cc_manager_competition_event_series_create_v1"));
});
test('HTML/JS/PWA cache is updated for touch device rollout',()=>{
 const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),css=fs.readFileSync('styles.css','utf8');
 assert.ok(html.includes('app.js?v=20261014-brsz-mobile-import-v8'));
 assert.ok(sw.includes('cc-manager-20261014-brsz-mobile-import-v8'));
 assert.ok(css.includes('.cc-brsz-sync-chooser>.button{min-height:44px'));
});
