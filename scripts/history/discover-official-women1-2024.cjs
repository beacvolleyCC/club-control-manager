'use strict';
// One direct public MRSZ 2024/25 women I competition page.
// Source league ID 72 was retrieved from the official 2024 season index.
// No guessing league IDs or match IDs. No live database writes.
const {fetchAllowed,decodePage}=require('./discover-women1-index.cjs');
const {parseStandings}=require('./parse-official-women1-competition.cjs');
const SOURCE='https://www.hunvolley.info/pr_a/010/002/p_002.asp?p_verseny_al_kod=72&p_evad_kod=2024&p_fo_cim=NoiBudapestI.osztaly';
function summarize(html){
 const raw=String(html||'');
 const display=raw.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
  .replace(/<[^>]*>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/\s+/g,' ').trim();
 const sourceTags=[...raw.matchAll(/oldal_submit_publikus\('([^']{5,600})'\)/gi)]
  .map(x=>x[1].replaceAll('&amp;','&'))
  .filter(x=>/p_merkozes_kod=\d+/.test(x)&&/p_evad_kod=2024(?:&|$)/.test(x)
   &&/p_verseny_al_kod=72(?:&|$)/.test(x));
 const ids=[...new Set(sourceTags.map(x=>x.match(/p_merkozes_kod=(\d+)/)?.[1]).filter(Boolean))];
 const hdr=display.slice(0,1200);
 const table=parseStandings(raw);
 const tablePart=display.indexOf('TABELLA'),indexPart=display.indexOf('MŰSOR, EREDMÉNY');
 const teamCells=[...raw.matchAll(/<td\s+class="vw_black_(?:cr|cl)_\d\d"[^>]*>([\s\S]*?)<\/td>/gi)]
  .map(x=>x[1].replace(/<[^>]*>/g,' ').replace(/\s+/g,' ').trim());
 return{
  competitionSource:SOURCE,matchCodeCount:ids.length,uniqueMatchCodes:ids,
  season2004:false,league2024Marker:display.includes('2024/2025')||display.includes('2024/25'),
  headerExcerpt:hdr,
  standingsRows:table.rows,standingsValid:table.valid,standingsError:table.error,
  tableContext:tablePart>=0?display.slice(tablePart,tablePart+1400):null,
  resultsContext:indexPart>=0?display.slice(indexPart,indexPart+650):null,
  teamCellCount:teamCells.length,teamCellSamples:teamCells.slice(0,24),
  sampleMatchURLs:[...new Set(sourceTags)].slice(0,4),
  matchIdsSourceLinked:true,
  // Do not label this a complete season without independent reconciliation.
  completeLeagueVerified:false
 };
}
async function main(){
 const result=await fetchAllowed(SOURCE);
 const {html,charset}=decodePage(result.buffer,result.headers);
 const data=summarize(html);
 process.stdout.write('<<<CC_2024_LEAGUE>>>\n'+JSON.stringify({http:result.status,charset,bytes:result.buffer.length,...data})+'\n<<<CC_2024_END>>>\n');
}
if(require.main===module){
 if(process.argv[2]!=='--network'){process.stderr.write('Requires --network\n');process.exitCode=2}
 else main().catch(e=>{process.stderr.write(String(e)+'\n');process.exitCode=1})
}
module.exports={summarize,SOURCE};
