'use strict';
// Source screening only. Community roster membership ≠ official registration or playing time.
// Completely offline and read-only. Output is NOT a team/player rating.
const fs=require('node:fs');
const path=require('node:path');

const isHttps=x=>/^https:\/\/[^\s]+$/.test(String(x||''));
const seasonStart=s=>{
  const m=/^(20\d\d)\/(\d\d)$/.exec(String(s||''));
  return m&&Number(m[2])===(Number(m[1])+1)%100?Number(m[1]):null;
};
const key=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLocaleLowerCase('hu').replace(/[^a-z0-9]/g,'');

function evaluate(src){
 const errors=[],bySeason=new Map(),chronology=[],links=new Map();
 if(src.schemaVersion!==1)errors.push('Invalid schema version');
 if(src.sourceType!=='community_edited')errors.push('Only community-edited roster evidence supported');
 if(!isHttps(src.primarySource))errors.push('Missing main source link');
 if(src.qualityGate?.federationRosterVerified!==false||src.qualityGate?.federationStandingsVerified!==false||
   src.qualityGate?.officialMatchParticipationVerified!==false)errors.push('Unsupported official verification claim');
 if(src.qualityGate?.publishTeamRatings!==false||src.qualityGate?.publishPlayerRatings!==false)
   errors.push('Community samples must never permit ratings');
 for(const [i,s] of (src.seasons||[]).entries()){
   const year=seasonStart(s.season);
   if(year===null||bySeason.has(s.season))errors.push('Invalid/duplicate season: '+s.season);
   if(s.rosterComplete!==false)errors.push('Do not claim full roster: '+s.season);
   if(s.placementVerifiedByFederation!==false)errors.push('Do not claim official placement: '+s.season);
   if(s.reportedPlacement!==null&&(!Number.isInteger(s.reportedPlacement)||s.reportedPlacement<1))
     errors.push('Invalid community placement: '+s.season);
   if(!Array.isArray(s.roster))errors.push('Missing player list: '+s.season);
   const names=new Set(),ids=new Set();
   for(const [j,p] of (s.roster||[]).entries()){
     if(!p.name||!p.role)errors.push('Missing name/role '+s.season+'/'+j);
     const nameKey=key(p.name);
     if(names.has(nameKey))errors.push('Duplicate name entry '+s.season+': '+p.name);
     names.add(nameKey);
     if(p.communityProfileId){
       if(!/^\d+$/.test(String(p.communityProfileId)))errors.push('Invalid community ID '+s.season);
       if(ids.has(p.communityProfileId))errors.push('Duplicate community profile '+s.season);
       ids.add(p.communityProfileId);
     }
     if(Object.hasOwn(p,'mrszPersonId')||Object.hasOwn(p,'playedSets'))
       errors.push('Unverified official player ID / playing time in community roster '+s.season);
   }
   if(year!==null)chronology.push({year,season:s.season,players:s.roster||[]});
   bySeason.set(s.season,s);
 }
 chronology.sort((a,b)=>a.year-b.year);
 for(const p of src.officialProtocolExamples||[]){
   if(!/^\d+$/.test(String(p.matchCode||''))||!isHttps(p.sourceUrl))errors.push('Invalid protocol evidence');
   if(p.rosterExtracted!==false||p.individualPlayedSetsVerified!==false)
     errors.push('Cannot assert official roster or played sets without direct verification');
 }
 for(const p of src.historicalTransferCandidates||[]){
   if(!isHttps(p.sourceUrl)||!isHttps(p.transferListUrl))
     errors.push('Missing candidate transfer source link');
   if(!p.name||!p.fromSeason||!p.toSeason)errors.push('Invalid transfer candidate');
   if(p.officialProfileContentVerified!==false||p.officialMatchParticipationVerified!==false)
     errors.push('Claimed MRSZ person link is NOT official player verification');
   if(p.reportedMrszPersonId&&!/^\d+$/.test(p.reportedMrszPersonId))
     errors.push('Invalid claimed person code');
   const list=bySeason.get(p.toSeason)?.roster||[];
   if(!list.some(q=>q.communityProfileId===p.communityProfileId&&q.name===p.name))
     errors.push('Transfer destination not supported by community roster: '+p.name);
 }
 const l=src.leagueTeamCandidates||{};
 if(l.identityMapVerified!==false||l.source2025OfficiallyVerified!==false||l.source2026OfficiallyVerified!==false)
   errors.push('Team identity evidence must remain unverified pending official IDs');
 const prevTeams=Array.isArray(l.historical2025)?l.historical2025:[];
 const nextTeams=Array.isArray(l.current2026)?l.current2026:[];
 const previousNames=new Set(prevTeams.map(key)),currentNames=new Set(nextTeams.map(key));
 if(prevTeams.length!==previousNames.size||nextTeams.length!==currentNames.size)
   errors.push('Duplicate league team names');
 const exactLeagueNameHints=nextTeams.filter(x=>previousNames.has(key(x)));
 const unmatchedLeagueTeams=nextTeams.filter(x=>!previousNames.has(key(x)));
 for(const p of l.riskExamples||[]){
   if(p.verified!==false)errors.push('Unsafe historical club/team identity merge: '+p.previous);
   if(!prevTeams.includes(p.previous)||!nextTeams.includes(p.current))
     errors.push('Alias review references missing team: '+p.previous);
 }
 const teamIdentity={
   historicalSeason:'2025/26',currentSeason:'2026/27',
   historicalCommunityTeams:prevTeams.length,currentSavedTeams:nextTeams.length,
   sameNormalizedNameHints:exactLeagueNameHints,
   unmatchedCurrentNames:unmatchedLeagueTeams,
   officialTeamIdentityLinks:0,
   automaticAliasMerges:0,
   verifiedTeamRetentionPercent:null
 };
 const comparisons=[];
 for(let i=1;i<chronology.length;i++){
   const a=chronology[i-1],b=chronology[i];
   if(b.year-a.year!==1)continue;
   const left=new Map(a.players.filter(p=>p.communityProfileId).map(p=>[p.communityProfileId,p]));
   const named=new Map(a.players.map(p=>[key(p.name),p]));
   const sameCommunityProfile=b.players.filter(p=>p.communityProfileId&&left.has(p.communityProfileId))
    .map(p=>({name:p.name,communityProfileId:p.communityProfileId}));
   const sameNameOnly=b.players.filter(p=>named.has(key(p.name))&&!sameCommunityProfile.some(q=>q.name===p.name))
    .map(p=>p.name);
   comparisons.push({
     earlier:a.season,later:b.season,
     earlierListed:a.players.length,laterListed:b.players.length,
     matchedCommunityProfiles:sameCommunityProfile,
     sameNameHints:sameNameOnly,
     // These are PARTIAL community entries and do not count as two official rosters.
     rosterRetentionPercent:null,
     officialPlayerMatches:0,
     ratingAllowed:false
   });
 }
 return{
   valid:errors.length===0,errors,
   sourceType:src.sourceType,
   cohorts:chronology.map(x=>({season:x.season,listedPlayers:x.players.length,
     reportedPlacement:bySeason.get(x.season).reportedPlacement,
     officialRosterVerified:false,officialPlacementVerified:false})),
   comparisons,
   teamIdentity,
   candidateTransfers:(src.historicalTransferCandidates||[]).map(p=>({
     name:p.name,fromTeam:p.fromTeam,toTeam:p.toTeam,season:p.toSeason,
     communityProfileId:p.communityProfileId,
     reportedMrszPersonId:p.reportedMrszPersonId||null,
     officialIdVerified:false
   })),
   confirmedOfficialPlayerAppearances:0,
   eligibleForTeamStrength:false,
   eligibleForPlayerRating:false
 };
}
if(require.main===module){
 const file=process.argv[2]||path.join(__dirname,'../../data/competition-history/beac_women1_roster_evidence_2024_2026.json');
 const result=evaluate(JSON.parse(fs.readFileSync(file,'utf8')));
 process.stdout.write(JSON.stringify(result,null,2)+'\n');
 if(!result.valid)process.exitCode=1;
}
module.exports={evaluate,seasonStart,key};
