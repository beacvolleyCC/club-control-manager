'use strict';
// Source investigation only: eight official MRSZ 2025/26 sheet exceptions
// plus the published 2024/25 federation season index.
// No ID iteration, browser automation, credentials, DB writes or ratings.
const fs=require('node:fs'),path=require('node:path'),https=require('node:https');
const {TextDecoder}=require('node:util');
const {visibleText,parseOfficialWomen1Protocol,parsePlayers}=require('./parse-official-women1-protocol.cjs');
const {decodePage}=require('./discover-women1-index.cjs');
const ARCHIVE=path.join(__dirname,'../../data/competition-history');
const exceptionIds=new Set(['2443','2667','3053','4071','7354','7777','7822','7803']);
const sleep=ms=>new Promise(ok=>setTimeout(ok,650));
const INDEX_2024='https://www.hunvolley.info/pr_a/010/001/p_001.asp?p_evad_kod=2024';

function selectExceptions(opponent,beac){
 const all=[...(opponent.results||[]).filter(m=>exceptionIds.has(String(m.code))).map(m=>({code:String(m.code),url:m.officialSource})),
  ...(beac.results||[]).filter(m=>exceptionIds.has(String(m.matchCode))).map(m=>({code:String(m.matchCode),url:m.sourceUrl}))];
 if(all.length!==8||new Set(all.map(x=>x.code)).size!==8)throw Error('Exactly eight official source exceptions expected');
 for(const m of all){
  const u=new URL(m.url);
  if(u.protocol!=='https:'||u.hostname!=='www.hunvolley.info'||u.pathname!=='/pr_a/010/009/p_009.asp'
   ||u.searchParams.get('p_evad_kod')!=='2025'||u.searchParams.get('p_verseny_al_kod')!=='93'
   ||u.searchParams.get('p_merkozes_kod')!==m.code)throw Error('Unsafe source URL '+m.code);
 }
 return all.sort((a,b)=>Number(a.code)-Number(b.code));
}
function fetchKnown(url,sizeCap=2_000_000){
 return new Promise((resolve,reject)=>{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.hostname!=='www.hunvolley.info')return reject(Error('Non-allowlisted host'));
  const req=https.get(u,{timeout:10000,headers:{'User-Agent':'ClubControl-HistoryReadOnly/1.0','Accept':'text/html','Accept-Encoding':'identity'}},res=>{
   if(res.statusCode!==200){res.resume();return resolve({status:res.statusCode,headers:res.headers,buffer:null})}
   let bytes=0;const chunks=[];
   res.on('data',b=>{bytes+=b.length;if(bytes>sizeCap)return res.destroy(Error('Safety byte cap exceeded'));chunks.push(b)});
   res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,buffer:Buffer.concat(chunks)}));
   res.on('error',reject);
  });
  req.on('timeout',()=>req.destroy(Error('HTTP timeout')));req.on('error',reject);
 });
}
function rosterContext(text,name){
 const marker=name+' mez játékosok neve',idx=text.indexOf(marker);
 if(idx<0)return{found:false};
 const start=text.indexOf('kizár',idx),end=text.indexOf('hivatalos személyek neve',start);
 const section=start>=0&&end>start?text.slice(start+5,end):'';
 const parsed=parsePlayers(section);
 const shirtNames=[...section.matchAll(/\b\d{1,3}\s+[\p{Lu}][\p{Lu}\s-]{4,70}\b/gu)].slice(0,5).map(m=>m[0].slice(0,100));
 return{found:true,chars:section.length,parsedCount:parsed.players.length,parseReason:parsed.reason,
  excerpt:section.slice(0,820),looksLikePlayers:shirtNames};
}
function sheetDiagnostic(html,code){
 const text=visibleText(html);
 const parsed=parseOfficialWomen1Protocol(html,code);
 const header=text.match(/VERSENYJEGYZŐKÖNYV\s+(.+?)\s+-\s+(.+?)\s+Női Budapest-bajnokság/);
 const home=header?.[1],away=header?.[2];
 return{code,status:parsed.status,
  home:home||null,away:away||null,
  homeRoster:home?rosterContext(text,home):null,
  awayRoster:away?rosterContext(text,away):null,
  scorePresent:/hazai\s+3\s+\d{2}/.test(text)||/vendég\s+3\s+\d{2}/.test(text),
  relevantHeader:text.slice(Math.max(0,text.indexOf('VERSENYJEGYZŐKÖNYV')),Math.max(0,text.indexOf('VERSENYJEGYZŐKÖNYV'))+320)};
}
function seasonEvidence(html){
 const raw=String(html),matches=[...raw.matchAll(/Női Budapest I\. osztály/gi)].slice(0,9);
 const samples=matches.map(m=>{
  const window=raw.slice(Math.max(0,m.index-1800),m.index+900);
  const links=[...window.matchAll(/(?:href|OnClick)\s*=\s*["']([^"']{1,550})["']/gi)].map(x=>x[1]);
  return{context:window.slice(-1700),links:links.slice(-10)};
 });
 return{
  title:raw.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]||null,
  seasonMarkers: [...new Set([...raw.matchAll(/p_evad_kod=2024/gi)].slice(0,7).map(x=>x[0]))],
  women1HeaderOccurrences:matches.length,
  samples,
  candidateLeagueLinks:[...new Set([...raw.matchAll(/\/pr_a\/010\/002\/p_002\.asp\?[^"'<> ]{1,450}/gi)]
    .map(m=>m[0].replaceAll('&amp;','&')))].filter(s=>/p_evad_kod=2024/.test(s)&&/NoiBudapestI|BudapestI\.osztaly/i.test(s)).slice(0,9)
 };
}
async function main(){
 const o=JSON.parse(fs.readFileSync(path.join(ARCHIVE,'women1_2025_26_opponent_protocols.json'),'utf8'));
 const b=JSON.parse(fs.readFileSync(path.join(ARCHIVE,'women1_2025_26_beac_remaining_protocols.json'),'utf8'));
 const items=selectExceptions(o,b),out=[];
 for(let i=0;i<items.length;i++){
  if(i)await sleep(650);
  const x=items[i];
  try{
    const r=await fetchKnown(x.url);
    const doc=r.buffer?decodePage(r.buffer,r.headers):null;
    out.push({code:x.code,http:r.status,charset:doc?.charset||null,
      ...(doc?sheetDiagnostic(doc.html,x.code):{error:'No body'})});
  }catch(e){out.push({code:x.code,error:String(e.message||e).slice(0,170)})}
 }
 await sleep(650);
 let past;
 try{
   const res=await fetchKnown(INDEX_2024,8_000_000);
   const html=res.buffer?decodePage(res.buffer,res.headers):null;
   past={url:INDEX_2024,http:res.status,charset:html?.charset||null,
     ...(html?seasonEvidence(html.html):{error:'Index inaccessible'})};
 }catch(e){past={url:INDEX_2024,error:String(e.message||e).slice(0,170)}}
 process.stdout.write('<<<CC_STAGE8_START>>>\n'+JSON.stringify({source:'official_MRSZ_read_only',exceptions:out,season2024:past})+'\n<<<CC_STAGE8_END>>>\n');
}
if(require.main===module){
 if(process.argv[2]!=='--network'){process.stderr.write('Explicit --network required\n');process.exitCode=2}
 else main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1});
}
module.exports={selectExceptions,rosterContext,sheetDiagnostic,seasonEvidence};
