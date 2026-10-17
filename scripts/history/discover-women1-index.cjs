'use strict';
/**
 * Read-only index discovery for a specifically named MRSZ adult women's league.
 * Fetches ONLY the season selector page and one known official match sheet.
 * No range/ID guessing, cookies, credentials, or DB writes.
 * Usage: node scripts/history/discover-women1-index.cjs --network
 */
const https=require('node:https');
const {TextDecoder}=require('node:util');
const MAX_BYTES=8_000_000;
const ENDPOINTS=Object.freeze([
 {id:'competition_index_2025',url:'https://www.hunvolley.info/pr_a/010/001/p_001.asp?p_evad_kod=2025'},
 {id:'verified_2446_sheet',url:'https://www.hunvolley.info/pr_a/010/009/p_009.asp?p_evad_kod=2025&p_merkozes_kod=2446&p_verseny_al_kod=93'}
]);
function decodePage(buf,headers){
 const ascii=buf.subarray(0,10000).toString('latin1');
 const charset=String(headers['content-type']||'').match(/charset\s*=\s*['"]?([\w-]+)/i)?.[1]
   ||ascii.match(/<meta[^>]*charset\s*=\s*['"]?([\w-]+)/i)?.[1]||'windows-1250';
 const safe=['utf-8','windows-1250','iso-8859-2'].includes(charset.toLowerCase())?charset.toLowerCase():'windows-1250';
 return{charset:safe,html:new TextDecoder(safe).decode(buf)};
}
function extractIndexEvidence(html,id){
 const raw=String(html||'');
 const clean=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
   .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
   .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/gi,' ')
   .replace(/\s+/g,' ').trim();
 const needles=['Női Budapest I. osztály','Női Budapest-bajnokság','2025/2026','2025-2026','p_verseny_al_kod=93'];
 const excerpts=[];
 for(const needle of needles){
   const pos=clean.toLowerCase().indexOf(needle.toLowerCase());
   if(pos>=0)excerpts.push({needle,context:clean.slice(Math.max(0,pos-180),pos+300)});
 }
 const links=[...raw.matchAll(/(?:href|action)\s*=\s*["']([^"'<>]{1,700})["']/gi)]
   .map(x=>x[1].replace(/&amp;/g,'&'))
   .filter(x=>/p_verseny_al_kod|p_evad_kod|p_merkozes_kod|010\/\d\d\d\/p_\d\d\d\.asp/i.test(x));
 const onclick=[...raw.matchAll(/(?:onclick|onchange)\s*=\s*["']([^"']{1,300})["']/gi)]
   .map(x=>x[1]).filter(x=>/p_verseny|p_evad|p_merkozes|p_0\d\d/i.test(x));
 const codes=[...new Set([...links,...onclick].flatMap(x=>[...x.matchAll(/p_merkozes_kod\s*[=:'"\s]+\s*(\d+)/gi)].map(y=>y[1])))];
 const knownLeagueLinks=links.filter(x=>/p_verseny_al_kod=93(?:&|$)/.test(x));
 const seasonSelects=[...raw.matchAll(/<select[^>]{0,700}>[\s\S]{0,6000}?<\/select>/gi)]
   .map(x=>x[0]).filter(x=>/2025/.test(x)).slice(0,2).map(x=>x.slice(0,750));
 const compactLinks=[...new Set(links)].slice(0,35);
 return{
   id,hasWomen1:excerpts.some(x=>x.needle==='Női Budapest I. osztály'),
   excerptSamples:excerpts,
   samplePageLinks:compactLinks,
   directKnownLeagueLinks:knownLeagueLinks.slice(0,25),
   rawMatchCodes:codes.slice(0,60),
   seasonSelectSamples:seasonSelects,
   onclickSamples:[...new Set(onclick)].slice(0,15),
   evidenceType:'index-discovery-only',
   confirmedCompleteLeagueFixtureList:false
 };
}
function fetchAllowed(url){
 return new Promise((resolve,reject)=>{
  const u=new URL(url);
  if(u.protocol!=='https:'||u.hostname!=='www.hunvolley.info')throw Error('Blocked non-official host');
  const req=https.get(u,{timeout:10000,headers:{
    'User-Agent':'ClubControl-ArchiveCheck/1.0 (limited source discovery)',
    Accept:'text/html','Accept-Encoding':'identity'
  }},res=>{
    if(res.statusCode>=300&&res.statusCode<400){
      res.resume();return reject(new Error('Redirect not followed: '+res.statusCode));
    }
    const chunks=[];let bytes=0;
    res.on('data',b=>{
      bytes+=b.length;
      if(bytes>MAX_BYTES){res.destroy(new Error('Response too large'));return}
      chunks.push(b)
    });
    res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,buffer:Buffer.concat(chunks)}));
    res.on('error',reject)
  });
  req.on('timeout',()=>req.destroy(new Error('Timeout')));
  req.on('error',reject)
 });
}
async function probe(){
 const out=[];
 for(const e of ENDPOINTS){
  try{
    const r=await fetchAllowed(e.url);
    const x=decodePage(r.buffer,r.headers);
    out.push({source:e.url,http:r.status,bytes:r.buffer.length,charset:x.charset,
      ...extractIndexEvidence(x.html,e.id)});
  }catch(error){
    out.push({source:e.url,id:e.id,error:String(error?.message||error),http:null});
  }
 }
 return out;
}
if(require.main===module){
 if(process.argv[2]!=='--network'){
  process.stderr.write('Missing explicit --network flag\n');process.exitCode=2;
 }else{probe().then(x=>process.stdout.write(JSON.stringify(x,null,2)+'\n'),
    e=>{process.stderr.write(String(e)+'\n');process.exitCode=1})}
}
module.exports={ENDPOINTS,decodePage,extractIndexEvidence,probe};
