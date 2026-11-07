'use strict';
/*
 * Real Chromium layout QA using *actual* Manager #76 + Player #28 CSS and
 * official canonical protocol JSON exported by the disposable PostgreSQL
 * 17 migration. Chromium mobile emulation is NOT a real iPhone Safari test.
 * No live credentials or API calls.
 */
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {chromium}=require('playwright-core');
const filename=process.env.CC_PROTOCOL_CANONICAL_JSON_FILE;
assert.ok(filename && fs.existsSync(filename),'Missing PG17 official protocol JSON');
const fixtures=JSON.parse(fs.readFileSync(filename,'utf8'));
const report=fixtures.find(x=>String(x.matchCode)==='2700');
assert.ok(report && report.protocol.teams.reduce((n,x)=>n+x.players.length,0)===19);
const configs=[
 {kind:'player',directory:'qa-player',id:'playerProtocolDialog',
  content:'playerProtocolContent',sheet:'.player-protocol-dialog-card',
  close:'#closePlayerProtocolDialog',scroll:'.player-protocol-scroll',
  table:'.player-protocol-team table'},
 {kind:'manager',directory:'qa-manager',id:'entityDialog',
  content:'entityDialogBody',sheet:'.entity-dialog-card',
  close:'.dialog-head .dialog-close',scroll:'.cc-protocol-table-scroll',
  table:'.cc-protocol-team table'}
];
function extract(s,a,b){const i=s.indexOf(a),j=s.indexOf(b,i+a.length);
 assert.ok(i>=0&&j>i,'Missing renderer '+a);
 return s.slice(i,j);}
function markup(c){
 const js=fs.readFileSync(c.directory+'/app.js','utf8');
 const html=fs.readFileSync(c.directory+'/index.html','utf8');
 const context={
  // Player protocol renderer excerpt binds its close button at module scope.
  document:{getElementById:()=>null},
  text:v=>String(v??'').trim(),
  esc:v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  URL,
  escapeHtml_:v=>String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;'),
  ccMrszLocalKickoff_:v=>({date:String(v||'').slice(0,10),
    time:String(v||'').slice(11,16)}),
  ccMrszPlayerLocalKickoff_:v=>({date:String(v||'').slice(0,10),
    time:String(v||'').slice(11,16)})
 };
 vm.createContext(context);
 if(c.kind==='manager'){
  vm.runInContext(extract(js,'  function ccMrszProfileUrl_(',
    '  function ccOpenMrszProtocol_(')+'\nthis.render=ccMrszProtocolHtml_;',context);
 }else{
  vm.runInContext(extract(js,'function ccPlayerProtocolProfileUrl_(',
   '// Two official match records supplied')+'\nthis.render=ccPlayerProtocolDetailHtml_;',context);
 }
 const dialog=/\<dialog\b[^>]*\bid="(?:playerProtocolDialog|entityDialog)"[^>]*>[\s\S]*?<\/dialog>/i.exec(html);
 assert.ok(dialog,'Real application dialog markup not found: '+c.kind);
 const styles=fs.readFileSync(c.directory+'/styles.css','utf8');
 return {dialog:dialog[0],report:context.render(report),styles};
}
const info=Object.fromEntries(configs.map(c=>[c.kind,markup(c)]));
const chromePaths=['/usr/bin/google-chrome','/usr/bin/google-chrome-stable',
  '/opt/google/chrome/chrome','/usr/bin/chromium'];
const executablePath=chromePaths.find(p=>fs.existsSync(p));
const launchArgs={headless:true,args:['--no-sandbox','--disable-dev-shm-usage']};
if(executablePath)launchArgs.executablePath=executablePath;
else launchArgs.channel='chrome';
let browserPromise;
test.after(async()=>{if(browserPromise)await (await browserPromise).close()});
for(const c of configs)for(const width of [320,390,768]){
 test(c.kind+' '+width+'px: real official roster sheet scroll, close, swipe and Escape',async()=>{
  browserPromise??=chromium.launch(launchArgs);
  const browser=await browserPromise;
  const page=await browser.newPage({viewport:{width,height:640},
    deviceScaleFactor:2,isMobile:true,hasTouch:true});
  try{
   const data=info[c.kind];
   await page.setContent('<!doctype html><html lang="hu"><head>'+
    '<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">'+
    '<style>'+data.styles+'</style></head><body>'+data.dialog+'</body></html>',{
    waitUntil:'domcontentloaded'});
   await page.evaluate(({id,content,html})=>{
    const dialog=document.getElementById(id);
    document.getElementById(content).innerHTML=html;
    dialog.classList.toggle('cc-protocol-dialog',id==='entityDialog');
    dialog.showModal();
   },{id:c.id,content:c.content,html:data.report});
   const initial=await page.evaluate(({sheet,scroll,table,id})=>{
    const root=document.getElementById(id);
    const panel=root.querySelector(sheet);
    const list=root.querySelector(scroll);
    const tab=list?.querySelector('table');
    return {dialogOpen:root.open,hasSheet:!!panel,hasRoster:!!tab,
      scrollHeight:panel.scrollHeight,clientHeight:panel.clientHeight,
      tableWidth:tab?.getBoundingClientRect().width,
      tableParentWidth:list?.clientWidth,
      viewportWidth:document.documentElement.clientWidth};
   },{id:c.id,sheet:c.sheet,scroll:c.scroll,table:c.table});
   assert.ok(initial.dialogOpen && initial.hasSheet && initial.hasRoster,
     c.kind+' missing real dialog/table');
   assert.ok(initial.scrollHeight>initial.clientHeight+70,
     c.kind+' protocol should be vertically scrollable');
   const measured=await page.evaluate(({id,sheet,close,scroll})=>{
    const root=document.getElementById(id);
    const panel=root.querySelector(sheet);
    const closeButton=root.querySelector(close);
    const list=root.querySelector(scroll);
    panel.scrollTop=panel.scrollHeight;
    list.scrollLeft=100;
    const bound=root.getBoundingClientRect();
    const closeRect=closeButton.getBoundingClientRect();
    return {viewport:document.documentElement.clientWidth,
      right:bound.right,left:bound.left,top:bound.top,bottom:bound.bottom,
      closeTop:closeRect.top,closeBottom:closeRect.bottom,
      rosterScrollLeft:list.scrollLeft,scrollLeftMax:list.scrollWidth-list.clientWidth,
      scrollY:panel.scrollTop};
   },{id:c.id,sheet:c.sheet,close:c.close,scroll:c.scroll});
   assert.ok(measured.left>=-3 && measured.right<=width+3,
    c.kind+' dialog exceeds viewport horizontally: '+JSON.stringify(measured));
   assert.ok(measured.scrollY>70,'vertical scroll failed');
   assert.ok(measured.closeTop>=measured.top-3
    && measured.closeBottom<=measured.bottom+3,
    c.kind+' close button scrolled out of view: '+JSON.stringify(measured));
   if(width===320)assert.ok(measured.scrollLeftMax>30
    && measured.rosterScrollLeft>0,
    c.kind+' 320px roster lacks horizontal swipe: '+JSON.stringify(measured));
   await page.keyboard.press('Escape');
   assert.equal(await page.locator('#'+c.id).evaluate(el=>el.open),false,
    c.kind+' Escape must close native modal');
  }finally{await page.close()}
 });
}
