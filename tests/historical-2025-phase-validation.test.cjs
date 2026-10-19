const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const {validateArchivedCompetition}=require('../scripts/history/validate-official-competition.cjs');
const ARCHIVE='data/competition-history/2025_26_men_womenII_source_manifest.json';
const clone=v=>JSON.parse(JSON.stringify(v));
const URL='https://www.hunvolley.info/pr_a/010/002/p_002.asp?p_evad_kod=2025';
function phase(key,sub,score){
 const teams=['Alpha','Beta'];
 const m={matchCode:'mrsz:'+sub,date:'2026-01-20',home:teams[0],away:teams[1],
 status:'scored',homeSets:score[0],awaySets:score[1]};
 const homeWin=score[0]>score[1];
 return {phaseKey:key,competitionSubId:sub,sourceURL:URL,sourceVerified:true,
 fullFixtureList:true,standingsMode:'phase_only',matches:[m],
 standings:[
 {team:'Alpha',played:1,wins:+homeWin,losses:+!homeWin,setsFor:score[0],setsAgainst:score[1]},
 {team:'Beta',played:1,wins:+!homeWin,losses:+homeWin,setsFor:score[1],setsAgainst:score[0]}
 ]};
}
function archive(){
 const a=phase('group-A',97,[3,1]),b=phase('playoffs',350,[1,3]);
 return {schemaVersion:1,season:'2025/26',scope:'womenII',teamIdentityAudited:true,
 requiredPhaseKeys:['group-A','playoffs'],phases:[a,b]};
}
test('verified phases require complete fixtures and exactly reproduce all standings',()=>{
 const result=validateArchivedCompetition(archive());
 assert.equal(result.status,'verified_for_research');
 assert.equal(result.scored,2);
 assert.equal(result.phaseCount,2);
 assert.equal(result.modelReady,false);
 assert.ok(result.phases.every(p=>p.officialStandingsReproduced));
});
test('playoff table carrying results from preliminary is not silently accepted',()=>{
 const d=archive();d.phases[1].standingsMode='carry_forward';
 assert.throws(()=>validateArchivedCompetition(d),/Unreconciled carry-over standings/);
});
test('missing, changed, or duplicated phase fails closed',()=>{
 const d=archive();d.phases.pop();
 assert.throws(()=>validateArchivedCompetition(d),/Missing required competition phase/);
 const e=archive();e.phases[1].matchCode=e.phases[0].matchCode;
 assert.throws(()=>validateArchivedCompetition(e),/Same match reused|Repeated match code/);
 const f=archive();f.phases[1].phaseKey='group-A';
 assert.throws(()=>validateArchivedCompetition(f),/Unexpected or duplicate phase/);
});
test('unverified archive and partial fixture list reject completion claims',()=>{
 const d=archive();d.phases[0].sourceVerified=false;
 assert.throws(()=>validateArchivedCompetition(d),/not verified/);
 const e=archive();e.phases[1].fullFixtureList=false;
 assert.throws(()=>validateArchivedCompetition(e),/Not all official fixtures/);
 const f=archive();f.teamIdentityAudited=false;
 assert.throws(()=>validateArchivedCompetition(f),/Team identities not reviewed/);
});
test('partial result, broken score, and standings mismatches fail without importing',()=>{
 const d=archive();d.phases[0].matches[0].homeSets=2;
 assert.throws(()=>validateArchivedCompetition(d),/Impossible set score/);
 const e=archive();e.phases[1].standings[0].wins=2;
 assert.throws(()=>validateArchivedCompetition(e),/Official standing math mismatch/);
 const f=archive();f.phases[0].matches[0].home='Unknown';
 assert.throws(()=>validateArchivedCompetition(f),/Unknown or self-facing teams/);
});
test('discovery manifest has no results disguised as confirmed 2025/26 season data',()=>{
 const m=JSON.parse(fs.readFileSync(ARCHIVE,'utf8'));
 assert.equal(m.officialResultsComplete,false);
 assert.equal(m.metricsPermitted,false);
 assert.ok(m.competitions.every(c=>c.phases.every(p=>p.fullStandingsVerified===false)));
 const women=m.competitions.find(x=>x.scope==='womenII');
 const ids=women.phases.map(x=>x.competitionSubId).filter(Boolean).sort((a,b)=>a-b);
 assert.deepEqual(ids,[97,350,351]);
 assert.equal(women.phases.some(x=>x.competitionSubId===null),true);
 const men=m.competitions.find(x=>x.scope==='menI');
 assert.equal(men.phases[0].competitionSubId,null);
});
