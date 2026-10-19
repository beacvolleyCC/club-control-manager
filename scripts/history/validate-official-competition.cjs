'use strict';
/*
 * CC 2025/26 official competition archive validator.
 * Strictly OFFLINE, READ-ONLY: no Supabase, no fetch, no Player event writes.
 * Each phase must have a reliable source, full fixture coverage, a separately
 * reconciled table, and unambiguous MRSZ/BRSZ match and team identities.
 * IMPORTANT: a women II playoff may carry prior match points: never infer
 * that its ranking table represents only that playoff's new matches.
 */
const fs=require('node:fs');
const path=require('node:path');
const assert=(ok,message)=>{if(!ok)throw new Error(message);};
const SCORE=/^202[56]-\d\d-\d\d$/;
const VALID_SCOPES=new Set(['womenII','menI']);
function matchStatsForPhase(phase){
 const byName=new Map(phase.standings.map(r=>[r.team,{played:0,wins:0,losses:0,setsFor:0,setsAgainst:0}]));
 const ids=new Set();let played=0;
 for(const m of phase.matches){
   assert(typeof m.matchCode==='string'&&/^[a-z0-9:-]+$/i.test(m.matchCode),'Invalid match identity');
   assert(!ids.has(m.matchCode),'Repeated match code '+m.matchCode);ids.add(m.matchCode);
   assert(SCORE.test(m.date)&&!Number.isNaN(Date.parse(m.date)),'Invalid result date '+m.matchCode);
   assert(byName.has(m.home)&&byName.has(m.away)&&m.home!==m.away,'Unknown or self-facing teams '+m.matchCode);
   assert(['scored','unscored'].includes(m.status),'Unknown result status '+m.matchCode);
   if(m.status==='unscored'){
     assert(m.homeSets==null&&m.awaySets==null,'Unscored fixture contains score '+m.matchCode);
     continue;
   }
   assert(Number.isInteger(m.homeSets)&&Number.isInteger(m.awaySets)
     &&Math.max(m.homeSets,m.awaySets)===3&&Math.min(m.homeSets,m.awaySets)>=0
     &&Math.min(m.homeSets,m.awaySets)<=2,'Impossible set score '+m.matchCode);
   const home=byName.get(m.home),away=byName.get(m.away),homeWin=m.homeSets>m.awaySets;
   for(const r of [home,away])r.played++;
   home.wins+=+homeWin;home.losses+=+!homeWin;
   away.wins+=+!homeWin;away.losses+=+homeWin;
   home.setsFor+=m.homeSets;home.setsAgainst+=m.awaySets;
   away.setsFor+=m.awaySets;away.setsAgainst+=m.homeSets;
   played++;
 }
 return{byName,played,unscored:phase.matches.length-played};
}
function validateArchivedCompetition(doc){
 assert(doc&&doc.schemaVersion===1,'Unsupported historical schema');
 assert(doc.season==='2025/26','Unexpected historical season');
 assert(VALID_SCOPES.has(doc.scope),'Unrecognized competition scope');
 assert(Array.isArray(doc.phases)&&doc.phases.length>0,'At least one official phase required');
 assert(Array.isArray(doc.requiredPhaseKeys)&&doc.requiredPhaseKeys.length===doc.phases.length,
   'Phase coverage must be explicitly complete');
 const required=new Set(doc.requiredPhaseKeys),keys=new Set(),globallySeen=new Set();
 const reports=[];let matchCount=0;
 for(const phase of doc.phases){
   assert(phase&&typeof phase.phaseKey==='string'&&required.has(phase.phaseKey)
     &&!keys.has(phase.phaseKey),'Unexpected or duplicate phase');
   keys.add(phase.phaseKey);
   assert(Number.isInteger(phase.competitionSubId)&&phase.competitionSubId>0,'Missing official competition code for '+phase.phaseKey);
   assert(typeof phase.sourceURL==='string'&&phase.sourceURL.startsWith('https://www.hunvolley.info/'),
     'Phase source must link to official MRSZ archive '+phase.phaseKey);
   assert(phase.sourceVerified===true,'Official archive not verified for '+phase.phaseKey);
   assert(phase.fullFixtureList===true,'Not all official fixtures verified for '+phase.phaseKey);
   assert(phase.standingsMode==='phase_only','Unreconciled carry-over standings: '+phase.phaseKey);
   assert(Array.isArray(phase.standings)&&phase.standings.length>=2,'Missing official standings '+phase.phaseKey);
   assert(Array.isArray(phase.matches)&&phase.matches.length>0,'Missing official match rows '+phase.phaseKey);
   const teamIds=new Set();
   for(const r of phase.standings){
     assert(typeof r.team==='string'&&r.team.trim()===r.team&&r.team.length>0,'Invalid team name');
     assert(Number.isInteger(r.played)&&r.played>=0
       &&Number.isInteger(r.wins)&&r.wins>=0&&Number.isInteger(r.losses)&&r.losses>=0
       &&Number.isInteger(r.setsFor)&&r.setsFor>=0&&Number.isInteger(r.setsAgainst)&&r.setsAgainst>=0,
       'Missing or invalid official tally '+r.team);
     assert(r.played===r.wins+r.losses,'Official standing math mismatch '+r.team);
     assert(!teamIds.has(r.team),'Duplicate official team identity '+r.team);
     teamIds.add(r.team);
   }
   const stats=matchStatsForPhase(phase);
   for(const [name,tally] of stats.byName){
     const official=phase.standings.find(t=>t.team===name);
     assert(['played','wins','losses','setsFor','setsAgainst'].every(k=>official[k]===tally[k]),
       'Cannot reproduce MRSZ official standings for '+name+' / '+phase.phaseKey);
   }
   for(const m of phase.matches){
     assert(!globallySeen.has(m.matchCode),'Same match reused in different phases '+m.matchCode);
     globallySeen.add(m.matchCode);
   }
   const fixtureDateRange=phase.matches.map(m=>m.date).sort();
   reports.push({
     phaseKey:phase.phaseKey,competitionSubId:phase.competitionSubId,teamCount:teamIds.size,
     matchesListed:phase.matches.length,scored:stats.played,unscored:stats.unscored,
     firstMatchDate:fixtureDateRange[0],lastMatchDate:fixtureDateRange[fixtureDateRange.length-1],
     officialStandingsReproduced:true
   });
   matchCount+=stats.played;
 }
 assert(keys.size===required.size,'Missing required competition phase(s)');
 assert(doc.teamIdentityAudited===true,'Team identities not reviewed across phases');
 return{status:'verified_for_research',season:doc.season,scope:doc.scope,scored:matchCount,
   phaseCount:reports.length,phases:reports,modelReady:false,
   reason:'Only after complete phase and team identity audit may a historical model be separately approved.'};
}
if(require.main===module){
 const target=process.argv[2];
 assert(target,'Usage: node scripts/history/validate-official-competition.cjs <snapshot.json>');
 const document=JSON.parse(fs.readFileSync(path.resolve(target),'utf8'));
 console.log(JSON.stringify(validateArchivedCompetition(document),null,2));
}
module.exports={validateArchivedCompetition,matchStatsForPhase};
