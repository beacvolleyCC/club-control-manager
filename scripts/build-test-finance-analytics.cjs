'use strict';
// Build an isolated Manager TEST bundle from environment-neutral LIVE source.
// This script never deploys or accesses production data.
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
const dest=path.join(root,'dist-test');
const liveRef='snqsxlyhontaepembaic';
const testRef='szzoubvhlwnojtzqjebc';
const testKey='sb_publishable_1iOpBTxKteHCgJdNyzXQCA_5gxcFWZB';
const version='cc-manager-20261121-finance-TEST-v1';
const files=['index.html','config.js','app.js','sw.js','manifest.webmanifest',
 'styles.css','finance-analytics.js','finance-analytics.css',
 'scoreboard.js','scoreboard.css','rotations.js','rotations.css',
 'match-rotations.js','match-rotations.css','volleyball-core.js',
 'volleyball-ui.js','volleyball.css','competition-context-catalog.js'];
const imageExtensions=new Set(['.png','.jpg','.jpeg','.webp','.svg','.gif','.ico','.avif']);
function check(ok,msg){if(!ok)throw Error('FINANCE TEST BUILD REJECTED: '+msg)}
const read=rel=>fs.readFileSync(path.join(root,rel),'utf8');
const sourceConfig=read('config.js');
const sourceHtml=read('index.html');
const sourceSw=read('sw.js');
const sourceManifest=JSON.parse(read('manifest.webmanifest'));
check(sourceConfig.includes('https://'+liveRef+'.supabase.co'),'Manager source must use known LIVE project');
check(!sourceConfig.includes(testRef),'TEST config must not be committed to LIVE source');
check(!/service_role|sb_secret_/i.test(sourceConfig),'privileged credentials in source');
check(sourceManifest.short_name==='CC Manager','source PWA must keep LIVE identity');
check(sourceHtml.includes('./finance-analytics.js'),'finance script not wired');
check(sourceHtml.includes('./finance-analytics.css'),'finance styles not wired');
check(!sourceHtml.includes('cc-test-finance-mode'),'source must not carry TEST badge');
check(sourceSw.includes('cc-manager-20261121-finance-v1'),'source cache mismatch');
check(sourceSw.includes('./finance-analytics.js'),'finance asset missing from PWA cache');
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
let total=0;
function copy(rel){
 const origin=path.join(root,rel),target=path.join(dest,rel),st=fs.lstatSync(origin);
 check(st.isFile()&&!st.isSymbolicLink(),'unsafe file '+rel);
 check(st.size<25*1024*1024,'oversized file '+rel);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.copyFileSync(origin,target);total++;
}
for(const f of files)copy(f);
function walk(dir){
 for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const rel=dir+'/'+e.name;
  check(!e.isSymbolicLink(),'symlink: '+rel);
  if(e.isDirectory())walk(rel);
  else{check(e.isFile()&&imageExtensions.has(path.extname(e.name).toLowerCase()),'asset type '+rel);copy(rel)}
 }
}
for(const dir of ['assets','icons'])walk(dir);
let html=sourceHtml.replace('<body>','<body class="cc-test-finance-mode">');
check(html!==sourceHtml,'TEST body banner insertion failed');
const originalCsp="connect-src 'self' https://*.supabase.co wss://*.supabase.co;";
const testCsp="connect-src 'self' https://"+testRef+".supabase.co wss://"+testRef+".supabase.co;";
check(html.includes(originalCsp),'missing source CSP');
html=html.replace(originalCsp,testCsp).replace('<title>Club Control – Manager</title>','<title>Club Control – Manager TEST · Pénzügyi Analytics</title>');
fs.writeFileSync(path.join(dest,'index.html'),html);
const testConfig=[
 '/* Manager TEST – isolated TEST database; browser publishable key only. */',
 'window.CC_MANAGER_CONFIG=Object.freeze({',
 "  BUILD:'20261121-finance-TEST',",
 '  TEST_ONLY:true,',
 "  STAGING_REF:'"+testRef+"',",
 "  DATA_MODE:'supabase',",
 "  SUPABASE_URL:'https://"+testRef+".supabase.co',",
 "  SUPABASE_PUBLISHABLE_KEY:'"+testKey+"',",
 "  DEFAULT_SEASON:'2026/27',",
 "  DEFAULT_AREA:'competition'",
 '});',''
].join('\n');
fs.writeFileSync(path.join(dest,'config.js'),testConfig);
const testManifest={...sourceManifest,name:'Club Control Manager TEST – Pénzügyi Analytics',short_name:'MGR TEST',
 description:'Isolated Club Control TEST only',id:'./manager-finance-test'};
fs.writeFileSync(path.join(dest,'manifest.webmanifest'),JSON.stringify(testManifest,null,2)+'\n');
const sw=sourceSw.replace("const CACHE='cc-manager-20261121-finance-v1';","const CACHE='"+version+"';");
check(sw!==sourceSw,'TEST SW version not changed');
fs.writeFileSync(path.join(dest,'sw.js'),sw);
for(const match of html.matchAll(/(?:src|href)="\.\/([A-Za-z0-9._/?=&%-]+)"/g)){
 const rel=match[1].split('?')[0].split('#')[0];
 check(fs.existsSync(path.join(dest,rel)),'missing dependency '+rel);
}
const all=html+testConfig+sw+read('app.js');
check(!all.includes('https://'+liveRef+'.supabase.co'),'LIVE database endpoint leaked into TEST runtime');
check(!all.includes('shouldCreateUser:true'),'TEST must not auto-enroll auth users');
check(!/sb_secret_|service_role/i.test(all),'privileged key detected');
for(const dir of ['data','sql','docs','tests','supabase'])check(!fs.existsSync(path.join(dest,dir)),'private folder deployed '+dir);
fs.writeFileSync(path.join(dest,'robots.txt'),'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(dest,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n');
console.log('PASS Manager finance TEST isolated bundle: '+total+' files -> dist-test');
