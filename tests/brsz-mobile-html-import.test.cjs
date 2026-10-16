const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const js=fs.readFileSync('app.js','utf8');
const start=js.indexOf('  const CC_BRSZ_COMPETITION_HTML_V1=');
const end=js.indexOf('  const CC_BRSZ_HELPER_PAGE_SOURCE=',start);
assert.ok(start>0&&end>start);
const ctx={TextDecoder,Uint8Array,btoa:s=>Buffer.from(s,'binary').toString('base64'),text:x=>String(x||''),esc:x=>String(x||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))};
vm.createContext(ctx);
vm.runInContext(js.slice(start,end)+'\nthis.qa={prepare:ccPrepareBrszHtmlDocuments_,detect:ccBRSZCompetitionIdFromHtml_,preview:ccBrszImportPreviewHtml_};',ctx);
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
 assert.ok(html.includes('app.js?v=20261016-mrsz-validation-v30'));
 assert.ok(sw.includes('cc-manager-20261016-mrsz-validation-v30'));
 assert.ok(html.includes('competition-context-catalog.js?v=20261015-lc1'));
 assert.ok(css.includes('.cc-brsz-sync-chooser>.button{min-height:44px'));
});
test('mobile BRSZ import asks for approval after recognizing all three leagues',async()=>{
 const docs=await ctx.qa.prepare(['1121','1146','1137'].map(input));
 const markup=ctx.qa.preview(docs);
 for(const id of ['1121','1146','1137'])assert.ok(markup.includes('brsz-'+id+'.html'));
 assert.ok(markup.includes('ccBrszImportConfirm'));
 assert.ok(markup.includes('ccBrszImportAbort'));
 assert.ok(markup.includes('még'), 'preview includes pre-write warning');
 const run=js.slice(js.indexOf('  async function runCompetitionSourceSync_('),js.indexOf('  // Competition schedule snapshot.'));
 const before=run.indexOf('ccConfirmBrszHtmlImport_(documents)');
 const after=run.indexOf("functions.invoke('cc-competition-sync'");
 assert.ok(before>0&&after>before,'require approval before any server mutation');
 assert.ok(run.includes('if(!await ccConfirmBrszHtmlImport_(documents))'));
});
test('mobile preview escapes potentially malicious HTML file names',()=>{
 const markup=ctx.qa.preview([{competitionId:'1121',name:'<img src=x onerror=alert(1)>'}]);
 assert.ok(!markup.includes('<img'));
 assert.ok(markup.includes('&lt;img'));
});
test('cancel, Escape and close button all resolve without syncing',()=>{
 const body=js.slice(js.indexOf('  function ccConfirmBrszHtmlImport_('),js.indexOf('  async function runCompetitionSourceSync_('));
 assert.ok(body.includes("d.addEventListener('close',onClose)"));
 assert.ok(body.includes('const onClose=()=>finish(false)'));
 assert.ok(body.includes("$('#ccBrszImportAbort')?.addEventListener('click',()=>finish(false)"));
 assert.ok(body.includes("$('#ccBrszImportConfirm')?.addEventListener('click',()=>finish(true)"));
});
