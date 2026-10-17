'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {SOURCE,summarize}=require('../scripts/history/discover-official-women1-2024.cjs');
test('source official competition code 72 in 2024/25, not 2025/26',()=>{
 const u=new URL(SOURCE);
 assert.equal(u.hostname,'www.hunvolley.info');
 assert.equal(u.searchParams.get('p_verseny_al_kod'),'72');
 assert.equal(u.searchParams.get('p_evad_kod'),'2024');
});
test('extract 2024 match IDs from official JS links only',()=>{
 const raw=[
 '<html><body><h1>2024/2025</h1>',
 '<div OnClick="oldal_submit_publikus(\'/pr_a/010/009/p_009.asp?p_merkozes_kod=409&p_evad_kod=2024&p_verseny_al_kod=72\');">one</div>',
 '<div OnClick="oldal_submit_publikus(\'/pr_a/010/009/p_009.asp?p_merkozes_kod=409&p_evad_kod=2024&p_verseny_al_kod=72\');">duplicate</div>',
 '<div OnClick="oldal_submit_publikus(\'/pr_a/010/009/p_009.asp?p_merkozes_kod=500&p_evad_kod=2025&p_verseny_al_kod=93\');">wrong</div>',
 '</body></html>'
 ].join('');
 const d=summarize(raw);
 assert.deepEqual(d.uniqueMatchCodes,['409']);
 assert.equal(d.matchCodeCount,1);
 assert.equal(d.completeLeagueVerified,false);
});
