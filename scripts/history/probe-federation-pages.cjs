'use strict';
// Read-only, low-rate compatibility probe for historic competition pages.
// It NEVER modifies the production DB and NEVER treats page headers as verified results or rosters.
// Run: node scripts/history/probe-federation-pages.cjs --network
const https=require('node:https');
const {TextDecoder}=require('node:util');
const {parseOfficialWomen1Protocol}=require('./parse-official-women1-protocol.cjs');

const SOURCES=Object.freeze([
  {id:'mrsz_2025_women1_m6161',host:'www.hunvolley.info',url:'https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=6161&p_verseny_al_kod=93',expected:['Mozdulj','EMERICUS']},
  {id:'mrsz_2025_women1_m2446',host:'www.hunvolley.info',url:'https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=2446&p_verseny_al_kod=93',expected:['BEAC']},
  {id:'brsz_mobile_adult_tables',host:'brsz.hu',url:'https://brsz.hu/m/tabellak.php?sorozat_id=1',expected:['Tabell']},
  {id:'brsz_mobile_adult_leagues',host:'brsz.hu',url:'https://brsz.hu/m/bajnoksagok.php?sorozat_id=1',expected:['bajnoks']},
]);
const ALLOWED=new Set(['www.hunvolley.info','hunvolley.info','brsz.hu','www.brsz.hu']);
const MAX_BYTES=1_200_000;

function detectEncoding(headers,buffer){
 const ascii=buffer.subarray(0,8192).toString('latin1');
 const header=String(headers['content-type']||'').match(/charset\s*=\s*["']?([\w-]+)/i)?.[1];
 const meta=ascii.match(/<meta[^>]*charset\s*=\s*["']?([\w-]+)/i)?.[1]
  ||ascii.match(/<meta[^>]*content\s*=\s*["'][^"']*charset=([\w-]+)/i)?.[1];
 const proposed=String(header||meta||'windows-1250').toLowerCase();
 const aliases={'iso-8859-2':'iso-8859-2','windows-1250':'windows-1250','utf-8':'utf-8','iso-8859-1':'windows-1250','cp1250':'windows-1250'};
 const charset=aliases[proposed]||'windows-1250';
 return{charset,declared:header||meta||null};
}
function summarizePage(entry,status,headers,buffer){
 const {charset,declared}=detectEncoding(headers,buffer);
 const html=new TextDecoder(charset,{fatal:false}).decode(buffer);
 const text=html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
  .replace(/\s+/g,' ').trim();
 const title=html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]*>/g,' ').trim()||null;
 const expectedCode=entry.id.match(/_m(\d+)$/)?.[1]||null;
 const parsed=expectedCode&&status===200?parseOfficialWomen1Protocol(html,expectedCode):null;
 const protocolMarker=text.toLowerCase().indexOf('versenyjegyzőkönyv');
 const start=protocolMarker>=0?protocolMarker:0;
 const excerpt=(status===200?text.slice(start,start+2250):'').trim();
 const candidates=[...html.matchAll(/href\s*=\s*["']([^"']{1,300})["']/gi)]
  .map(m=>m[1]).filter(s=>/verseny|bajnoksag|tabella|p_\d\d\d\.asp/i.test(s)).slice(0,8);
 return{
   id:entry.id,status,charset,declaredCharset:declared,contentBytes:buffer.length,
   htmlTitle:title?.slice(0,120)||null,decodedCharacters:html.length,
   appearsHtml:/<html|<!doctype|<table|<body/i.test(html.slice(0,4096)),
   officialProtocolLayoutRecognized:status===200&&protocolMarker>=0,
   firstProtocolTextExcerpt:excerpt,
   expectedTokensFound:entry.expected.filter(token=>text.toLowerCase().includes(token.toLowerCase())),
   expectedTokensRequired:entry.expected.length,
   possibleCompetitionLinks:candidates,
   // DO NOT claim roster or result completeness from a decoded document.
   officialPlayerRowsVerified:parsed?.status==='verified_official_score'?parsed.validRosterRows:0,
   officialResultsVerified:parsed?.status==='verified_official_score'?1:0,
   parsedMatch:parsed?{status:parsed.status,matchCode:parsed.matchCode,
     home:parsed.home||null,away:parsed.away||null,
     score:parsed.homeSets!=null?parsed.homeSets+'–'+parsed.awaySets:null,
     setScores:parsed.setScores||null,
     playerRowCounts:parsed.teams?.map(t=>t.players.length)||[]} : null,
   warning:'Page loaded only. Historical records, player IDs and match results NOT verified.'
 };
}
function fetchOnce(url,redirects=0){
 return new Promise((resolve,reject)=>{
   const u=new URL(url);
   if(u.protocol!=='https:'||!ALLOWED.has(u.hostname))return reject(new Error('Host not allowlisted'));
   const req=https.get(u,{timeout:10000,headers:{'User-Agent':'ClubControl-ResearchAudit/1.0 (low-volume archival compatibility check)','Accept':'text/html,application/xhtml+xml','Accept-Encoding':'identity'}},res=>{
     if(res.statusCode>=300&&res.statusCode<400&&res.headers.location){
       res.resume();
       if(redirects>=1)return reject(new Error('Too many redirects'));
       return resolve(fetchOnce(new URL(res.headers.location,u).toString(),redirects+1));
     }
     const chunks=[];let n=0;
     res.on('data',chunk=>{
       n+=chunk.length;
       if(n>MAX_BYTES){res.destroy(new Error('Response exceeds safety size cap'));return}
       chunks.push(chunk);
     });
     res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
     res.on('error',reject);
   });
   req.on('timeout',()=>req.destroy(new Error('HTTP timeout')));
   req.on('error',reject);
 });
}
async function probe(){
 const out=[];
 for(const entry of SOURCES){
   try{
     const r=await fetchOnce(entry.url);
     out.push(summarizePage(entry,r.status,r.headers,r.body));
   }catch(error){
     out.push({id:entry.id,retrievable:false,error:String(error.message||error).slice(0,180),
       officialPlayerRowsVerified:0,officialResultsVerified:0});
   }
 }
 return out;
}
if(require.main===module){
 if(process.argv[2]!=='--network'){
   process.stderr.write('Refusing live probe without explicit --network switch.\n');
   process.exitCode=2;
 }else{
   probe().then(rows=>process.stdout.write(JSON.stringify(rows,null,2)+'\n'))
     .catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1});
 }
}
module.exports={SOURCES,detectEncoding,summarizePage,probe};
