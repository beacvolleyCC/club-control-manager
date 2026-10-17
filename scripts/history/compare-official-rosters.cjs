'use strict';
// Offline comparator of two explicit MRSZ match sheets. An ID match is an identity
// cross-check for two *match nominations*, not an estimate of season roster retention.
const fs=require('node:fs');
const path=require('node:path');

const normalizeName=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
 .toLocaleLowerCase('hu').replace(/[-–—]/g,' ').replace(/[^a-z0-9 ]/g,' ')
 .trim().split(/\s+/).filter(Boolean).sort().join(' ');

function selectedTeam(doc,name){
 const candidates=(doc.teams||doc.protocol?.teams||[]).filter(t=>t.name===name);
 if(candidates.length!==1)throw Error('Unambiguous explicit team name required: '+name);
 const players=candidates[0].players||[],codes=new Set();
 for(const p of players){
   const code=String(p.code||'');
   if(!/^\d{4,6}$/.test(code)||codes.has(code))throw Error('Missing/duplicate official player code in '+name);
   codes.add(code);
 }
 return players;
}
function compareOfficialMatchLists(oldDoc,newDoc,oldTeam,newTeam){
 const prev=selectedTeam(oldDoc,oldTeam),curr=selectedTeam(newDoc,newTeam);
 const prevById=new Map(prev.map(p=>[String(p.code),p])),codeMatches=[],nameConflicts=[],newIds=[];
 for(const p of curr){
   const q=prevById.get(String(p.code));
   if(!q){newIds.push(String(p.code));continue}
   const item={code:String(p.code),previousName:q.name,currentName:p.name};
   if(normalizeName(q.name)===normalizeName(p.name))codeMatches.push(item);
   else nameConflicts.push(item);
 }
 return{
   previousMatchNominations:prev.length,currentMatchNominations:curr.length,
   verifiedCodeAndNameMatches:codeMatches,
   codeNameConflicts:nameConflicts,
   unmatchedCurrentIds:newIds,
   previousSeasonRosterRetentionPercent:null,
   individualPlayingTimeVerified:false,
   strengthRatingAllowed:false
 };
}
if(require.main===module){
 const [prior,current,priorTeam,currentTeam]=process.argv.slice(2);
 if(!prior||!current||!priorTeam||!currentTeam){
   process.stderr.write('Usage: node scripts/history/compare-official-rosters.cjs prior.json current.json previousTeamName currentTeamName\n');
   process.exitCode=2;
 }else{
   const read=f=>JSON.parse(fs.readFileSync(path.resolve(f),'utf8'));
   try{process.stdout.write(JSON.stringify(compareOfficialMatchLists(read(prior),read(current),priorTeam,currentTeam),null,2)+'\n')}
   catch(e){process.stderr.write(String(e.message||e)+'\n');process.exitCode=1}
 }
}
module.exports={normalizeName,compareOfficialMatchLists};
