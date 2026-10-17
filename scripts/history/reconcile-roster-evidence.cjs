'use strict';
// Read-only comparator. Never equate same-name people to official identities.
// Output deliberately omits personal details beyond supplied names and MRSZ match codes.
const fs=require('node:fs');
const path=require('node:path');

const normalizedNameTokens=value=>String(value||'')
 .normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('hu')
 .replace(/[-–—]/g,' ').replace(/[^a-z0-9 ]/g,' ')
 .trim().split(/\s+/).filter(Boolean).sort().join(' ');

function compareRosters(previousCommunityRoster,currentProtocolPlayers){
 if(!Array.isArray(previousCommunityRoster)||!Array.isArray(currentProtocolPlayers))
   throw new TypeError('Two arrays expected');
 const candidates=new Map(),previousDuplicates=new Set();
 for(const p of previousCommunityRoster){
   const k=normalizedNameTokens(p.name);
   if(!k)continue;
   if(candidates.has(k))previousDuplicates.add(k);
   else candidates.set(k,p);
 }
 const currentCodes=new Set(),currentNames=new Set(),pairs=[],notMatched=[],collisions=[];
 for(const p of currentProtocolPlayers){
   const k=normalizedNameTokens(p.name),id=String(p.code||'').trim();
   if(!k||!id){
     collisions.push({name:String(p.name||''),reason:'missing current player code/name'});continue;
   }
   if(currentCodes.has(id)||currentNames.has(k)||previousDuplicates.has(k)){
     collisions.push({name:p.name,reason:'duplicate or ambiguous match'});continue;
   }
   currentCodes.add(id);currentNames.add(k);
   const community=candidates.get(k);
   if(!community){notMatched.push(p.name);continue}
   pairs.push({
     currentProtocolName:p.name,previousCommunityName:community.name,
     currentProtocolCode:id,previousCommunityProfileId:community.communityProfileId||null,
     status:'name_hint_only', // no official historical player identity/playing time verified
     playedSets:null
   });
 }
 return{
   oldListed:previousCommunityRoster.length,currentProtocolListed:currentProtocolPlayers.length,
   nameHints:pairs,unmatchedCurrentNames:notMatched,collisions,
   confirmedOfficialCrossSeasonIds:0,
   // Neither the prior community list nor a single current match is a full official roster.
   retentionPercentage:null,
   playerRatingAllowed:false
 };
}

function fromEvidence(evidence,protocol){
 if(evidence.schemaVersion!==1)throw new Error('Unsupported evidence schema');
 const old=evidence.seasons.find(x=>x.season==='2025/26');
 if(!old||old.rosterComplete!==false)throw new Error('Prior roster must remain declared partial');
 const teams=protocol?.teams;
 if(!Array.isArray(teams))throw new Error('Protocol teams[] required');
 const name=protocol.teamName;
 const matching=teams.filter(t=>t.name===name);
 if(matching.length!==1)throw new Error('A single explicit official team name required');
 return compareRosters(old.roster,matching[0].players||[]);
}
if(require.main===module){
 if(process.argv.length!==4){
   process.stderr.write('Usage: node scripts/history/reconcile-roster-evidence.cjs <community-evidence.json> <protocol.json>\n');
   process.exitCode=2;
 }else{
   const evidence=JSON.parse(fs.readFileSync(path.resolve(process.argv[2]),'utf8'));
   const protocol=JSON.parse(fs.readFileSync(path.resolve(process.argv[3]),'utf8'));
   process.stdout.write(JSON.stringify(fromEvidence(evidence,protocol),null,2)+'\n');
 }
}
module.exports={compareRosters,fromEvidence,normalizedNameTokens};
