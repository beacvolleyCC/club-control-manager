'use strict';
// READ ONLY validated 2025/26 MRSZ roster-data audit.
// Prevents publishing unverified participation, player skills or team ratings.
const fs=require('node:fs'),path=require('node:path');
const DIR=path.join(__dirname,'../../data/competition-history');
const load=name=>JSON.parse(fs.readFileSync(path.join(DIR,name),'utf8'));

function audit(league,opponents,beacPilot,beacRemaining){
 const errors=[],ref=new Map(),ids=new Set();
 if(league.sourceSeason!=='2025/26'||league.competitionSubId!=='93'
   ||opponents.season!=='2025/26'||opponents.officialCompetitionSubId!=='93')
   errors.push('Wrong federation season/competition');
 for(const m of league.matches){
   if(m.status==='scored')ref.set(m.code,m);
 }
 if(ref.size!==129)errors.push('Official scored fixture index is not 129 records');
 const teams=new Map(),names=new Map(),observed=new Map(),duplicates=new Set();
 let rosterDocs=0,confirmedProtocolScores=0,nominations=0;
 for(const m of opponents.results||[]){
   const src=ref.get(m.code);
   if(ids.has(m.code))duplicates.add(m.code);
   ids.add(m.code);
   if(!src||src.home!==m.home||src.away!==m.away||src.date!==m.date||
      src.homeSets!==m.homeSets||src.awaySets!==m.awaySets)
     errors.push('Fixture mismatch for '+m.code);
   if(!m.officialSource?.includes('p_merkozes_kod='+m.code)
     ||!m.officialSource.includes('p_evad_kod=2025')
     ||!m.officialSource.includes('p_verseny_al_kod=93'))
     errors.push('Not linked from official competition: '+m.code);
   if(m.officialScoreVerified)confirmedProtocolScores++;
   if(!m.officialFullMatchRosterVerified){
     if(m.rosterTeams?.length)errors.push('Unverified roster leaked into data '+m.code);
     continue;
   }
   rosterDocs++;
   if(!m.officialScoreVerified||!m.officialTeamNamesVerified||m.rosterTeams.length!==2)
     errors.push('Unsupported official roster claim '+m.code);
   for(const t of m.rosterTeams){
     if(!Array.isArray(t.players)||!t.players.length)errors.push('Empty declared roster '+m.code);
     const local=new Set();
     const tt=teams.get(t.officialName)||{team:t.officialName,matchCodes:new Set(),codes:new Set(),nominations:0};
     tt.matchCodes.add(m.code);
     for(const p of t.players||[]){
       if(!/^\d{4,6}$/.test(String(p.code))||local.has(String(p.code)))
         errors.push('Invalid/duplicate player code '+m.code);
       local.add(String(p.code));tt.codes.add(String(p.code));tt.nominations++;nominations++;
       const k=t.officialName+'::'+p.code;
       if(names.has(k)&&names.get(k)!==p.name)errors.push('Inconsistent identity name for '+k);
       names.set(k,p.name);
       const player=observed.get(String(p.code))||{name:p.name,teams:new Set()};
       if(player.name!==p.name)errors.push('Inconsistent MRSZ code name '+p.code);
       player.teams.add(t.officialName);
       observed.set(String(p.code),player);
     }
     teams.set(t.officialName,tt);
   }
 }
 if(duplicates.size)errors.push('Duplicate match IDs: '+[...duplicates].join(','));
 if(opponents.results.length!==107||ids.size!==107||rosterDocs!==100||confirmedProtocolScores!==104
  ||nominations!==1885||teams.size!==11||observed.size!==166)
   errors.push('Unexpected opponents coverage');
 for(const t of opponents.teamSummaries||[]){
   const derived=teams.get(t.team);
   if(!derived||derived.matchCodes.size!==t.verifiedProtocols||derived.nominations!==t.nominations
     ||derived.codes.size!==t.uniquePlayerCodes)errors.push('Team coverage mismatch '+t.team);
 }
 if((opponents.teamSummaries||[]).length!==11)errors.push('11 team summaries required');
 const beacIds=new Set(),beacNominees=[];
 for(const m of beacPilot.results||[])for(const id of m.beacPlayerCodes||[]){beacIds.add(String(id));beacNominees.push(String(id))}
 for(const m of beacRemaining.results||[])if(m.officialBeacRosterVerified)for(const p of m.beacPlayers||[]){
   beacIds.add(String(p.code));beacNominees.push(String(p.code));
 }
 const beacDocs=beacPilot.results.length+beacRemaining.results.filter(m=>m.officialBeacRosterVerified).length;
 if(beacDocs!==21||beacIds.size!==15||beacNominees.length!==213)
   errors.push('BEAC 2025/26 source coverage mismatch');
 const beacOverlap=[...beacIds].filter(id=>observed.has(id));
 const allAthletes=new Set([...beacIds,...observed.keys()]);
 const noRosters=opponents.results.filter(x=>!x.officialFullMatchRosterVerified)
   .map(m=>({code:m.code,date:m.date,reason:m.reasons}));
 const crossClubIds=[...observed.entries()].filter(([,p])=>p.teams.size>1)
   .map(([id,p])=>({code:id,teams:[...p.teams]}));
 return{
  ok:errors.length===0,errors,
  fixturesWithOfficialResults:ref.size,
  opponentsChecked:ids.size,opponentOfficialProtocolScores:confirmedProtocolScores,
  opponentsFullRosters:rosterDocs,opponentMissingRosters:noRosters,
  officialBeacMatches:22,beacMatchSheetsWithRoster:beacDocs,
  beacMatchWithoutRoster:'7803',
  matchesWithSomeVerifiedRoster:rosterDocs+beacDocs,
  leagueMatchesWithoutVerifiedRoster:129-rosterDocs-beacDocs,
  officialPlayerCodesObserved:allAthletes.size,
  opponentPlayerCodesObserved:observed.size,beacPlayerCodesObserved:beacIds.size,
  beacAndOpponentCodeOverlap:beacOverlap,
  multiClubCodeCandidates:crossClubIds,
  officialNominationEntriesObserved:nominations+beacNominees.length,
  opponentTeamCounts:[...teams.values()].map(x=>({team:x.team,verifiedMatches:x.matchCodes.size,
    nominations:x.nominations,uniqueCodes:x.codes.size})),
  completenessIsOfficialSeasonRegistration:false,
  participationIsActualCourtTime:false,
  publishedStrengthRatingAllowed:false,
  modelCalibrationAllowed:false
 };
}
if(require.main===module){
 const output=audit(load('women1_2025_26_official_league_snapshot.json'),
  load('women1_2025_26_opponent_protocols.json'),
  load('women1_2025_26_beac_roster_pilot.json'),
  load('women1_2025_26_beac_remaining_protocols.json'));
 process.stdout.write(JSON.stringify(output,null,2)+'\n');
 if(!output.ok)process.exitCode=1;
}
module.exports={audit};
