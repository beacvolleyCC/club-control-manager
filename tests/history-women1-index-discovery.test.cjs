'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {ENDPOINTS,extractIndexEvidence,decodePage}=require('../scripts/history/discover-women1-index.cjs');
test('source discovery is strictly limited to official index and known score sheet',()=>{
 assert.equal(ENDPOINTS.length,2);
 assert.ok(ENDPOINTS.every(x=>new URL(x.url).hostname==='www.hunvolley.info'));
 assert.ok(ENDPOINTS[0].url.includes('p_evad_kod=2025'));
 assert.ok(ENDPOINTS[1].url.includes('p_merkozes_kod=2446'));
});
test('MRSZ index anchors expose only explicit source match IDs, never invented ranges',()=>{
 const html='<html><body>Női Budapest I. osztály 2025/2026 <a href="p_009.asp?p_evad_kod=2025&amp;p_verseny_al_kod=93&amp;p_merkozes_kod=2446">BEAC–Emericus</a></body></html>';
 const r=extractIndexEvidence(html,'fixture_index');
 assert.equal(r.hasWomen1,true);
 assert.deepEqual(r.rawMatchCodes,['2446']);
 assert.equal(r.directKnownLeagueLinks.length,1);
 assert.equal(r.confirmedCompleteLeagueFixtureList,false);
});
test('headers with Windows-1250 and ISO-8859-2 are decoded explicitly',()=>{
 const buf=Buffer.from('<html><title>Index</title></html>');
 assert.equal(decodePage(buf,{'content-type':'text/html; charset=windows-1250'}).charset,'windows-1250');
 assert.equal(decodePage(buf,{'content-type':'text/html; charset=iso-8859-2'}).charset,'iso-8859-2');
});
test('a linkless, unrelated index does not become a complete fixture list',()=>{
 const r=extractIndexEvidence('<html><body><h1>2026 season</h1></body></html>','index');
 assert.equal(r.hasWomen1,false);
 assert.deepEqual(r.rawMatchCodes,[]);
 assert.equal(r.confirmedCompleteLeagueFixtureList,false);
});
