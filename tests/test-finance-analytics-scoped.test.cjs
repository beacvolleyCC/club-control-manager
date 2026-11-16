'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {execFileSync}=require('node:child_process');
const files=['app.js','finance-analytics.js','sw.js'];
test('TEST finance code is syntactically valid JavaScript',()=>{
 for(const path of files)assert.doesNotThrow(()=>execFileSync(process.execPath,['--check',path],{stdio:'pipe'}),path);
});
test('TEST is isolated from LIVE project and has a visible separate PWA identity',()=>{
 const config=fs.readFileSync('config.js','utf8'),index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8'),manifest=JSON.parse(fs.readFileSync('manifest.webmanifest','utf8'));
 assert.match(config,/STAGING_REF:'szzoubvhlwnojtzqjebc'/);
 assert.match(config,/TEST_ONLY:true/);
 assert.match(config,/sb_publishable_/);
 assert.doesNotMatch(config,/snqsxlyhontaepembaic|service_role|sb_secret_/i);
 assert.match(index,/cc-test-finance-mode/);
 assert.match(index,/finance-analytics\.js/);
 assert.match(index,/finance-analytics\.css/);
 assert.match(sw,/cc-manager-TEST-/);
 assert.equal(manifest.short_name,'MGR TEST');
});
const src=fs.readFileSync('finance-analytics.js','utf8'),ctx={window:{},console};
vm.createContext(ctx);
vm.runInContext(src,ctx);
const A=ctx.window.CCFinanceAnalytics;
function sample(scopes){
 return {
 permissions:[],financeScopes:scopes,financeAnalyticsDemo:false,
 financeInsightsSource:'finance',financeInsightsGroup:'team',financeInsightsMetric:'amount',
 financeInsightsTeam:'',financeInsightsFee:'',financeInsightsMonth:'',financeSavedViews:[],
 financeAnalytics:{
   finance:[
     {teamId:'t1',teamName:'Női I.',playerName:'ALLOW_COACH',playerId:'p1',feeType:'coach_fee',period:'2026-11',status:'paid',amountHuf:7000},
     {teamId:'t1',teamName:'Női I.',playerName:'HIDE_OTHER_TYPE',playerId:'p2',feeType:'beac_pass',period:'2026-11',status:'paid',amountHuf:4000},
     {teamId:'t2',teamName:'Női II.',playerName:'HIDE_OTHER_TEAM',playerId:'p3',feeType:'coach_fee',period:'2026-11',status:'paid',amountHuf:9000}
   ],passes:[{level:'HIDE_PASS_STATS',amountHuf:1000}],trainings:[{level:'HIDE_TRAINING_STATS',capacity:20,attended:20}]
 }
 };
}
const viewOnly=[{category:'coach_fee',teamId:'t1',teamName:'Női I.',canView:true,canEdit:false}];
test('scopes filter other teams and other fee categories, including reports and exports',()=>{
 const s=sample(viewOnly),html=A.render(s);
 assert.equal(A.financeGlobal(s),false);
 assert.equal(A.financeVisible(s),true);
 assert.match(html,/ALLOW_COACH/);
 assert.doesNotMatch(html,/HIDE_OTHER_TYPE|HIDE_OTHER_TEAM|HIDE_PASS_STATS|HIDE_TRAINING_STATS/);
 assert.match(html,/Csak olvasás/);
 assert.doesNotMatch(html,/data-cc-fi-edit=/);
 assert.match(html,/Kimutatásépítő és mentett nézetek/);
});
test('edit controls are shown only with matching team-category write permission',()=>{
 const s=sample([{...viewOnly[0],canEdit:true}]);
 assert.match(A.render(s),/data-cc-fi-edit="0"/);
 s.financeAnalyticsDemo=true;
 const demoHtml=A.render(s);
 assert.match(demoHtml,/MINDEN ÖSSZEG ÉS NÉV KITALÁLT/);
 assert.doesNotMatch(demoHtml,/data-cc-fi-edit/);
});
test('finance-only scopes do not grant mass pass or training access',()=>{
 const s=sample(viewOnly);
 s.financeInsightsSource='passes';
 assert.doesNotMatch(A.render(s),/HIDE_PASS_STATS/);
 s.financeInsightsSource='trainings';
 assert.doesNotMatch(A.render(s),/HIDE_TRAINING_STATS/);
});
test('no rights means no analytics view',()=>{
 const s=sample([]);
 assert.equal(A.financeVisible(s),false);
 assert.match(A.render(s),/nincs pénzügyi jogosultságod/i);
});
test('scoped backend endpoints are routed through app and test SQL',()=>{
 const app=fs.readFileSync('app.js','utf8');
 const sql=fs.readFileSync('sql/20261116_test_finance_analytics_scoped_feed.sql','utf8');
 const writer=fs.readFileSync('sql/20261116_test_finance_scoped_override.sql','utf8');
 assert.match(app,/cc_manager_finance_analytics_v1/);
 assert.match(app,/cc_manager_finance_scopes_v1/);
 assert.match(app,/financeTabsHtml_/);
 assert.match(app,/CCFinanceAnalytics\.bindAdmin/);
 assert.match(src,/cc_manager_finance_override_scoped_v1/);
 assert.match(sql,/private\.cc_finance_allowed_v1\(m\.fee_type,um\.team_id,'view'\)/);
 assert.match(sql,/HAVING count\(DISTINCT tm\.team_id\)=1/);
 assert.match(sql,/notRealPurchase/);
 assert.match(writer,/private\.cc_finance_allowed_v1\(p_fee_type,v_team,'edit'\)/);
 assert.match(writer,/FINANCE_AMBIGUOUS_OR_MISSING_TEAM/);
});
