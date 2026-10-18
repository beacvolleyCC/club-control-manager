'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const js=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');

test('all league card edit buttons get working click handlers, not only one element',()=>{
 const start=js.indexOf('  function ccBindSourceMatchEdit_()');
 const end=js.indexOf('  function ccMrszMergedLeagueMatches_(',start);
 assert.ok(start>0&&end>start);
 const found=['row1','row2'].map(key=>({
   dataset:{matchSystem:'snapshot',matchSeason:'2026/27',matchEdit:key},
   addEventListener(type,cb){assert.equal(type,'click');this.click=cb;}
 }));
 const opened=[];
 const bind=new Function('$$','text','ccMatchSourceFind_','ccOpenSourceMatchEditor_','status',
   js.slice(start,end)+';return ccBindSourceMatchEdit_;')(
    selector=>{assert.equal(selector,'#viewContent [data-match-edit]');return found;},
    x=>String(x??'').trim(),id=>({...id}),match=>opened.push(match.key),()=>{});
 bind();
 for(const button of found){
   assert.equal(typeof button.click,'function','the edit control must be interactive');
   button.click({preventDefault(){},stopPropagation(){}});
 }
 assert.deepEqual(opened,['row1','row2']);
});
test('the edit action is inside each competition match card, not below its border',()=>{
 const scoreboard=js.slice(js.indexOf('  function ccMatchScoreboardHtml_('),js.indexOf('  // Source-verified record links only'));
 assert.ok(scoreboard.includes("+(options.editHtml||'')"));
 const fixture=js.slice(js.indexOf('  function ccMrszLeagueFixturePanelHtml_('),
   js.indexOf('  // Read-only cross-league audit.',js.indexOf('  function ccMrszLeagueFixturePanelHtml_(')));
 assert.ok(fixture.includes('editHtml:ccMatchEditAction_(m)'));
 assert.ok(!fixture.includes("ccMatchEditAction_(m)+'</div>'"));
 assert.ok(css.includes('.cc-scoreboard-bottom .cc-league-manual-edit'));
});
test('overview table row selection changes detailed stats while preserving all league rows',()=>{
 const index=js.indexOf('  function renderManagerStandings_()');
 const end=js.indexOf('  function eventPlace(',index);
 const code=js.slice(index,end);
 assert.ok(code.includes('const selected=msSelectedRow_(rows)'));
 assert.ok(code.includes('const displayRows=rows'));
 assert.ok(js.includes('bindOverviewStandings_();'));
 assert.ok(js.includes("state.managerStandingsTeam=text(sourceId)||'all'"));
});
test('financial passes expose an always-visible, usable search bar',()=>{
 const start=js.indexOf('  function financePassAnalyticsHtml_()'),
   end=js.indexOf('  function financeSettingsHtml_()',start);
 const code=js.slice(start,end);
 const search=code.indexOf('id="financePassSearch"');
 const filters=code.indexOf('id="financePassFiltersPanel"');
 assert.ok(search>=0&&filters>search,'search must be outside the collapsible filters');
 assert.equal((code.match(/id="financePassSearch"/g)||[]).length,1);
 const b=js.slice(js.indexOf('  function bindFinance_()'),js.indexOf('  function renderFinance()'));
 assert.ok(b.includes("next.focus({preventScroll:true})"));
 assert.ok(js.includes('financeNorm_(state.financePassSearch)'));
 assert.ok(css.includes('.finance-pass-quick-search'));
});
test('desktop filters have flow-based alignment without moving between unrelated panels',()=>{
 assert.ok(css.includes('@media(min-width:900px)'));
 assert.ok(css.includes('#viewContent>.filter-panel'));
 assert.ok(css.includes('#viewContent>.finance-filter-panel:not([hidden])'));
 assert.ok(css.includes('position:static!important'));
 assert.ok(css.includes('grid-template-columns:repeat(4,minmax(0,1fr))'));
});
