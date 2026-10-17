'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {SOURCES,detectEncoding,summarizePage}=require('../scripts/history/probe-federation-pages.cjs');

test('network scope is fixed to two federation sites and four low-rate pages',()=>{
 assert.equal(SOURCES.length,4);
 assert.ok(SOURCES.every(x=>['www.hunvolley.info','brsz.hu'].includes(new URL(x.url).hostname)));
 assert.equal(SOURCES.filter(x=>x.id.startsWith('mrsz_')).length,2);
});
test('legacy windows-1250 and ISO-8859-2 charset declarations are recognized',()=>{
 assert.equal(detectEncoding({'content-type':'text/html; charset=windows-1250'},Buffer.from('abc')).charset,'windows-1250');
 assert.equal(detectEncoding({'content-type':'text/html'},Buffer.from('<meta http-equiv="Content-Type" content="text/html; charset=iso-8859-2">')).charset,'iso-8859-2');
 assert.equal(detectEncoding({'content-type':'text/html; charset=utf-8'},Buffer.from('abc')).charset,'utf-8');
});
test('page loading by itself never verifies a historic match result or official roster',()=>{
 const doc=Buffer.from('<html><title>TEREMRÖPLABDA VERSENYJEGYZŐKÖNYV</title><body><h1>Mozdulj EMERICUS</h1><p>játékosok neve K CS kód</p></body></html>');
 const result=summarizePage(SOURCES[0],200,{'content-type':'text/html;charset=utf-8'},doc);
 assert.deepEqual(result.expectedTokensFound,['Mozdulj','EMERICUS']);
 assert.equal(result.officialPlayerRowsVerified,0);
 assert.equal(result.officialResultsVerified,0);
 assert.equal(result.appearsHtml,true);
 assert.equal(result.status,200);
});
test('script content never satisfies source evidence tokens',()=>{
 const doc=Buffer.from('<html><script>Mozdulj EMERICUS</script><p>Más bajnokság</p></html>');
 const result=summarizePage(SOURCES[0],200,{},doc);
 assert.deepEqual(result.expectedTokensFound,[]);
 assert.equal(result.officialResultsVerified,0);
});
