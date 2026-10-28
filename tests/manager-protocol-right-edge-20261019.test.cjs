'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const app=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const html=fs.readFileSync('index.html','utf8');
const sw=fs.readFileSync('sw.js','utf8');
const a=app.indexOf('function ccMrszProtocolBadgesHtml_(');
const b=app.indexOf('function ccMrszProtocolTeamHtml_(',a);
assert.ok(a>=0&&b>a);
const ctx=vm.createContext({text:x=>String(x??'').trim(),esc:x=>String(x??'')});
vm.runInContext(app.slice(a,b),ctx);
test('captain and libero precede substitute and substitute is rightmost',()=>{
 const markup=ctx.ccMrszProtocolBadgesHtml_({designation:'CS',captain:true,libero:'L2'});
 assert.ok(markup.indexOf('is-captain')<markup.indexOf('is-libero'));
 assert.ok(markup.indexOf('is-libero')<markup.indexOf('is-subs'));
 assert.ok(markup.includes('aria-label="Csere"'));
 assert.ok(css.includes('.cc-protocol-markers .cc-protocol-marker.is-subs{margin-left:3px;order:99}'));
 assert.ok(css.includes('display:flex;width:100%;gap:5px;align-items:center;justify-content:flex-end;min-height:21px'));
});
test('starting player retains bold marker and no-entry is not wrongly labelled as substitute',()=>{
 const b=ctx.ccMrszProtocolBadgesHtml_({designation:'K',captain:true});
 assert.ok(b.includes('is-captain'));
 assert.ok(!b.includes('is-subs'));
 const missing=ctx.ccMrszProtocolBadgesHtml_({designation:null});
 assert.ok(missing.includes('is-no-entry'));
 assert.ok(!missing.includes('is-subs'));
});
test('PWA index has versioned app and service worker caches all match scripts',()=>{
 const jsVersion=html.match(/<script\s+src="\.\/app\.js\?v=([^"]+)"\s*><\/script>/);
 assert.ok(jsVersion,'Manager index must load versioned app.js');
 assert.match(sw,/^const CACHE='cc-manager-[^']+';/m,'Service worker needs a versioned cache name');
 assert.ok(sw.includes("'./app.js'"),'Service worker must include app.js');
 assert.ok(html.includes('match-rotations.js?v='),'Match mode must load versioned JS');
 assert.ok(sw.includes("'./match-rotations.js'"),'Service worker must cache match mode');
});
