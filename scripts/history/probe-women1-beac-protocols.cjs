'use strict';
// Five known MRSZ league-index-linked BEAC fixtures: a bounded, read-only pilot.
// No guessed match codes, no persistent session, no writes, no public-player rating.
const fs=require('node:fs'),path=require('node:path'),https=require('node:https');
const {TextDecoder}=require('node:util');
const {parseOfficialWomen1Protocol}=require('./parse-official-women1-protocol.cjs');
const SNAPSHOT=path.join(__dirname,'../../data/competition-history/women1_2025_26_official_league_snapshot.json');
const MAX_BYTES=1_200_000;
const PILOT_INDEX=[0,5,10,15,21];

function selectBeacPilot(data){
 if(data.schemaVersion!==1||data.sourceSeason!=='2025/26'||data.competitionSubId!=='93')
   throw Error('Only verified source-index snapshot accepted');
 const all=data.matches.filter(x=>x.home==='BEAC'||x.away==='BEAC')
  .sort((a,b)=>a.date.localeCompare(b.date)||a.time.localeCompare(b.time));
 if(all.length!==22||all.some(x=>x.status!=='scored'))throw Error('Expected 22 scored BEAC fixtures');
 return PILOT_INDEX.map(i=>{
  const m=all[i];
  const url=new URL(m.sourcePath,'https://www.hunvolley.info');
  if(url.hostname!=='www.hunvolley.info'||url.pathname!=='/pr_a/010/009/p_009.asp'||
     url.searchParams.get('p_merkozes_kod')!==m.code||
     url.searchParams.get('p_evad_kod')!=='2025'||url.searchParams.get('p_verseny_al_kod')!=='93')
    throw Error('Invalid MRSZ source link');
  return{code:m.code,date:m.date,home:m.home,away:m.away,
    homeSets:m.homeSets,awaySets:m.awaySets,url:url.toString()};
 });
}
function fetchOfficial(url){
 return new Promise((resolve,reject)=>{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.hostname!=='www.hunvolley.info'||u.pathname!=='/pr_a/010/009/p_009.asp')
    return reject(Error('Non-allowlisted source URL'));
  const req=https.get(u,{timeout:10000,headers:{
    'User-Agent':'ClubControl-ArchiveCheck/1.0 (five known BEAC protocols)',
    Accept:'text/html','Accept-Encoding':'identity'
  }},res=>{
    if(res.statusCode!==200){res.resume();return resolve({status:res.statusCode,body:null,headers:res.headers})}
    const chunks=[];let bytes=0;
    res.on('data',chunk=>{
      bytes+=chunk.length;
      if(bytes>MAX_BYTES){res.destroy(Error('Page exceeds size limit'));return}
      chunks.push(chunk)
    });
    res.on('end',()=>resolve({status:res.statusCode,body:Buffer.concat(chunks),headers:res.headers}));
    res.on('error',reject);
  });
  req.on('timeout',()=>req.destroy(Error('Timeout')));
  req.on('error',reject);
 });
}
function classify(m,status,decoded){
 if(status!==200||!decoded)return{
   code:m.code,date:m.date,http:status,matchStatus:'fetch_failed',resultMatchesIndex:false,
   beacPlayerCount:0,beacCodes:[],totalOfficialPlayerRows:0};
 const p=parseOfficialWomen1Protocol(decoded,m.code);
 const resultMatches=p.status==='verified_official_score'&&
   p.homeSets===m.homeSets&&p.awaySets===m.awaySets;
 const beac=(p.teams||[]).find(t=>t.name==='Budapesti Egyetemi Atlétikai Club'||t.name==='BEAC');
 const beacCodes=beac?.players?.map(x=>String(x.code))||[];
 return{
  code:m.code,date:m.date,http:status,matchStatus:p.status,resultMatchesIndex:resultMatches,
  beacPlayerCount:beacCodes.length,
  beacCodes, // Federation IDs from a public match sheet, not guaranteed minutes/sets.
  totalOfficialPlayerRows:p.validRosterRows||0
 };
}
async function main(){
 const data=JSON.parse(fs.readFileSync(SNAPSHOT,'utf8'));
 const out=[];
 for(const m of selectBeacPilot(data)){
  try{
    const r=await fetchOfficial(m.url);
    if(!r.body){out.push(classify(m,r.status,null));continue}
    const ct=String(r.headers['content-type']||'');
    const charset=ct.match(/charset=([\w-]+)/i)?.[1]?.toLowerCase();
    const decoded=new TextDecoder(['windows-1250','iso-8859-2','utf-8'].includes(charset)?charset:'windows-1250').decode(r.body);
    out.push(classify(m,r.status,decoded));
  }catch(e){
    out.push({...classify(m,null,null),error:String(e?.message||e).slice(0,150)});
  }
 }
 process.stdout.write(JSON.stringify({
   sourceType:'five-known-official-index-linked-protocols',
   pilotMatches:out.length,resultMatched:out.filter(x=>x.resultMatchesIndex).length,
   withBeacPlayerIds:out.filter(x=>x.beacPlayerCount>0).length,
   uniqueBeacPlayerIds:new Set(out.flatMap(x=>x.beacCodes)).size,
   results:out
 },null,2)+'\n');
}
if(require.main===module){
 if(process.argv[2]!=='--network'){process.stderr.write('Requires explicit --network\n');process.exitCode=2}
 else main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1});
}
module.exports={selectBeacPilot,classify};
