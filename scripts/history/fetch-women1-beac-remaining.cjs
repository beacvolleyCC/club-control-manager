'use strict';
// Bounded and read-only retrieval of 17 source-index-listed BEAC match protocols.
// Does not query unknown match IDs, persist sessions, alter production, or publish ratings.
const fs=require('node:fs'),path=require('node:path');
const {TextDecoder}=require('node:util');
const {fetchOfficial,selectBeacPilot}=require('./probe-women1-beac-protocols.cjs');
const {parseOfficialWomen1Protocol}=require('./parse-official-women1-protocol.cjs');
const SNAPSHOT=path.join(__dirname,'../../data/competition-history/women1_2025_26_official_league_snapshot.json');
const MIN_DELAY_MS=650;
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));

function selectRemaining(data){
 const pilot=new Set(selectBeacPilot(data).map(x=>x.code));
 const all=data.matches.filter(x=>x.home==='BEAC'||x.away==='BEAC')
   .sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
 if(all.length!==22||pilot.size!==5)throw Error('Expected 22 BEAC games and five pilot fixtures');
 const missing=all.filter(x=>!pilot.has(x.code));
 if(missing.length!==17||missing.some(x=>x.status!=='scored'))throw Error('Invalid remaining source fixtures');
 return missing.map(m=>{
   const u=new URL(m.sourcePath,'https://www.hunvolley.info');
   if(u.protocol!=='https:'||u.hostname!=='www.hunvolley.info'
     ||u.pathname!=='/pr_a/010/009/p_009.asp'
     ||u.searchParams.get('p_evad_kod')!=='2025'
     ||u.searchParams.get('p_verseny_al_kod')!=='93'
     ||u.searchParams.get('p_merkozes_kod')!==m.code)throw Error('Invalid source link '+m.code);
   return{...m,url:u.toString()};
 });
}
function assess(match,parsed){
 const observed=parsed.status==='verified_official_score';
 const scoreMatches=observed&&parsed.homeSets===match.homeSets&&parsed.awaySets===match.awaySets;
 const dateMatches=observed&&parsed.date===match.date;
 const beacIsHome=match.home==='BEAC';
 const teamBySide=observed?parsed.teams[beacIsHome?0:1]:null;
 const beacName=teamBySide?.name;
 const beacTeamMatches=!!beacName&&['BEAC','Budapesti Egyetemi Atlétikai Club'].includes(beacName);
 const ids=teamBySide?.players||[];
 const codeUnique=ids.every(p=>/^\d{4,6}$/.test(String(p.code||'')))&&new Set(ids.map(p=>p.code)).size===ids.length;
 const hasRoster=scoreMatches&&dateMatches&&beacTeamMatches&&ids.length>0&&codeUnique;
 return{
  code:match.code,date:match.date,time:match.time,
  home:match.home,away:match.away,homeSets:match.homeSets,awaySets:match.awaySets,
  sourceUrl:match.url,
  parserStatus:parsed.status,
  scoreMatchesOfficialList:scoreMatches,dateMatchesOfficialList:dateMatches,
  beacPositionVerified:beacTeamMatches,officialRosterAccepted:hasRoster,
  officialHomeName:observed?parsed.home:null,
  officialAwayName:observed?parsed.away:null,
  beacPlayers:hasRoster?ids.map(p=>({code:String(p.code),name:p.name,designation:p.designation,libero:p.libero||null})):[],
  allTeamPlayerRows:observed?parsed.validRosterRows:0,
  rejectionReasons:[
   ...(!scoreMatches?['score_mismatch_or_unverified']:[]),
   ...(!dateMatches?['date_mismatch_or_unverified']:[]),
   ...(!beacTeamMatches?['beac_team_side_not_verified']:[]),
   ...(!ids.length?['no_beac_player_rows']:[]),
   ...(!codeUnique?['duplicate_or_invalid_codes']:[])
  ]
 };
}
function summary(results){
 const accepted=results.filter(x=>x.officialRosterAccepted);
 const ids=new Set(accepted.flatMap(x=>x.beacPlayers.map(p=>p.code)));
 const alerts=results.filter(x=>!x.officialRosterAccepted).map(x=>({code:x.code,status:x.parserStatus,reasons:x.rejectionReasons}));
 return{
  scope:'17 remaining source-index-linked BEAC 2025/26 official protocol documents',
  requested:results.length,
  acceptedProtocols:accepted.length,
  rejectedProtocols:alerts.length,
  uniqueBeacPlayerCodes:ids.size,
  totalBeacNominations:accepted.reduce((n,x)=>n+x.beacPlayers.length,0),
  rejected:alerts,
  // Nominations are not minutes played or a full official registered roster.
  fullSeasonRegistrationListVerified:false,
  playedSetsVerified:false,
  suitableForIndividualStrength:false,
  results
 };
}
async function main(){
 const data=JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));
 const fixtures=selectRemaining(data),rows=[];
 for(let i=0;i<fixtures.length;i++){
   const m=fixtures[i];
   if(i>0)await delay(MIN_DELAY_MS);
   try{
    const resp=await fetchOfficial(m.url);
    if(resp.status!==200||!resp.body){
      rows.push({...assess(m,{status:'fetch_failed'}),http:resp.status});continue;
    }
    const declared=String(resp.headers['content-type']||'').match(/charset=([\w-]+)/i)?.[1]?.toLowerCase();
    const charset=['utf-8','windows-1250','iso-8859-2'].includes(declared)?declared:'windows-1250';
    const html=new TextDecoder(charset).decode(resp.body);
    rows.push({...assess(m,parseOfficialWomen1Protocol(html,m.code)),http:resp.status});
   }catch(error){
    rows.push({...assess(m,{status:'fetch_error'}),http:null,error:String(error?.message||error).slice(0,160)});
   }
 }
 process.stdout.write(JSON.stringify(summary(rows),null,2)+'\n');
}
if(require.main===module){
 if(process.argv[2]!=='--network'){
  process.stderr.write('Refusing network access without explicit --network\n');process.exitCode=2;
 }else main().catch(error=>{process.stderr.write(String(error)+'\n');process.exitCode=1});
}
module.exports={selectRemaining,assess,summary};
