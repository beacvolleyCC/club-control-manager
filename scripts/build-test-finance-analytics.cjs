'use strict';
/* Club Control Manager TEST-only static bundle.
   Cloudflare Pages: build via node scripts/build-test-finance-analytics.cjs; output dist-test.
   Never configure this test branch as the LIVE project's production branch.
*/
const fs=require('node:fs');
const path=require('node:path');
const root=path.resolve(__dirname,'..'),dest=path.join(root,'dist-test');
const files=[
 'index.html','config.js','app.js','sw.js','manifest.webmanifest',
 'styles.css','finance-analytics.js','finance-analytics.css',
 'scoreboard.js','scoreboard.css','rotations.js','rotations.css',
 'match-rotations.js','match-rotations.css','volleyball-core.js','volleyball.css',
 'volleyball-ui.js','competition-context-catalog.js'
];
const allowedExt=new Set(['.svg','.png','.jpg','.jpeg','.webp','.ico','.avif','.gif']);
function assert(v,m){if(!v)throw Error('TEST build blocked: '+m)}
const config=fs.readFileSync(path.join(root,'config.js'),'utf8');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const sw=fs.readFileSync(path.join(root,'sw.js'),'utf8');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'manifest.webmanifest'),'utf8'));
assert(config.includes("TEST_ONLY:true"),'missing TEST_ONLY marker');
assert(config.includes("STAGING_REF:'szzoubvhlwnojtzqjebc'"),'wrong Supabase project');
assert(config.includes("SUPABASE_URL:'https://szzoubvhlwnojtzqjebc.supabase.co'"),'missing TEST endpoint');
assert(!/snqsxlyhontaepembaic|service_role|sb_secret_/i.test(config),'production reference or secret key');
assert(/sb_publishable_/.test(config),'TEST publishable key missing');
assert(/cc-test-finance-mode/.test(index),'visible TEST header missing');
assert(/finance-analytics.js/.test(index),'analytic frontend missing');
assert(/finance-analytics.css/.test(index),'analytic styles missing');
assert(/szzoubvhlwnojtzqjebc.supabase.co/.test(index),'CSP must be TEST-only');
assert(!/snqsxlyhontaepembaic/.test(index),'production origin in TEST CSP');
assert(manifest.short_name==='MGR TEST','manifest missing TEST identity');
assert(/cc-manager-20261116-test-finance-analytics-v1/.test(sw),'missing distinct TEST PWA cache version');
fs.rmSync(dest,{recursive:true,force:true});
fs.mkdirSync(dest,{recursive:true});
let n=0;
function cp(rel){
 const a=path.join(root,rel),b=path.join(dest,rel);
 const st=fs.lstatSync(a);
 assert(st.isFile()&&!st.isSymbolicLink(),'non-file '+rel);
 assert(st.size<25*1024*1024,'file too large '+rel);
 fs.mkdirSync(path.dirname(b),{recursive:true});
 fs.copyFileSync(a,b);n++;
}
for(const name of Array.from(new Set(files)))cp(name);
function walk(dir){
 for(const entry of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){
  const rel=dir+'/'+entry.name;
  assert(!entry.isSymbolicLink(),'unsafe symlink '+rel);
  if(entry.isDirectory())walk(rel);
  else{assert(entry.isFile()&&allowedExt.has(path.extname(entry.name).toLowerCase()),'unexpected image '+rel);cp(rel)}
 }
}
for(const dir of ['assets','icons'])walk(dir);
for(const match of index.matchAll(/(?:src|href)="\.\/([A-Za-z0-9._/?=&%-]+)"/g)){
 const rel=match[1].split('?')[0].split('#')[0];
 assert(fs.existsSync(path.join(dest,rel)),'missing file '+rel);
}
const deployedJs=fs.readFileSync(path.join(dest,'app.js'),'utf8');
assert(!/https:\/\/snqsxlyhontaepembaic\.supabase\.co/i.test(deployedJs),'LIVE database fallback in JS');
assert(!/shouldCreateUser:true/.test(deployedJs),'TEST must not create unknown users');
fs.writeFileSync(path.join(dest,'robots.txt'),'User-agent: *\nDisallow: /\n');
fs.writeFileSync(path.join(dest,'_headers'),'/*\n  X-Robots-Tag: noindex, nofollow, noarchive\n  X-Content-Type-Options: nosniff\n');
assert(!fs.existsSync(path.join(dest,'sql'))&&!fs.existsSync(path.join(dest,'tests'))&&!fs.existsSync(path.join(dest,'data')),'private data copied');
console.log('PASS TEST-only Manager Finance Analytics build ('+n+' files) -> dist-test');
