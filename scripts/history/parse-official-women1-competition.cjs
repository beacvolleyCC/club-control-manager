'use strict';
// Read-only source-specific extractor for the official MRSZ 2025/26 women I fixture page.
// It never infers an unplayed match score and never merges team names automatically.
const {visibleText}=require('./parse-official-women1-protocol.cjs');
const MONTHS=Object.freeze({'január':'01','február':'02','március':'03','április':'04','május':'05','június':'06',
 'július':'07','augusztus':'08','szeptember':'09','október':'10','november':'11','december':'12'});
function dayMarkers(html){
 const re=/<strong>\s*(20\d{2})\.\s*(január|február|március|április|május|június|július|augusztus|szeptember|október|november|december)\s+(\d{1,2})\.\s*[^<]{0,32}<\/strong>/gi;
 return[...html.matchAll(re)].map(m=>({offset:m.index,date:m[1]+'-'+MONTHS[m[2].toLowerCase()]+'-'+m[3].padStart(2,'0')}));
}
function parseRows(html){
 const raw=String(html||'');
 const dates=dayMarkers(raw);
 const pat=/\bOnClick="oldal_submit_publikus\('([^']*p_merkozes_kod=\d+[^']*)'\)\s*;?\s*"/gi;
 let dateCursor=0,lastDate=null;
 const matches=[],ids=new Map(),errors=[];
 let repeatedResponsiveCards=0;
 for(const m of raw.matchAll(pat)){
   const path=m[1].replace(/&amp;/g,'&');
   if(!/p_verseny_al_kod=93(?:&|$)/.test(path)||!/p_evad_kod=2025(?:&|$)/.test(path))continue;
   while(dateCursor<dates.length&&dates[dateCursor].offset<m.index){
     lastDate=dates[dateCursor++].date;
   }
   const matchCode=path.match(/p_merkozes_kod=(\d+)/)?.[1];
   if(!matchCode)continue;
   if(ids.has(matchCode)){
     if(ids.get(matchCode)!==path)errors.push('Conflicting match link '+matchCode);
     else repeatedResponsiveCards++;
     continue;
   }
   ids.set(matchCode,path);
   const end=raw.indexOf('</div>',m.index);
   if(end<0){errors.push('Unclosed match card '+matchCode);continue}
   const card=raw.slice(m.index,end+6);
   const teamCells=[...card.matchAll(/<td\s+class="vw_black_(?:cr|cl)_\d\d"[^>]*>([\s\S]*?)<\/td>/gi)]
    .map(x=>visibleText(x[1])).filter(Boolean);
   const time=card.match(/<td\s+class="vw_black_cc_\d\d"[^>]*>\s*(\d{2}:\d{2})\s*<\/td>/i)?.[1]||null;
   const score=card.match(/<strong>\s*(\d)\s*-\s*(\d)\s*<\/strong>/i);
   const homeSets=score?Number(score[1]):null,awaySets=score?Number(score[2]):null;
   const validScore=score!==null&&((homeSets===3&&awaySets<=2)||(awaySets===3&&homeSets<=2));
   const resultInvalid=score!==null&&!validScore;
   if(resultInvalid)errors.push('Invalid match result '+matchCode);
   if(teamCells.length!==2)errors.push('Missing/ambiguous official teams '+matchCode+': '+teamCells.length);
   if(!time||!lastDate)errors.push('Missing kickoff '+matchCode);
   matches.push({code:matchCode,date:lastDate,time,home:teamCells[0]||null,away:teamCells[1]||null,
     homeSets:validScore?homeSets:null,awaySets:validScore?awaySets:null,
     status:validScore?'scored':score?'invalid_score':'unscored',
     sourcePath:path});
 }
 return{rows:matches,errors,repeatedResponsiveCards};
}
function parseStandings(html){
 const full=visibleText(html);
 const begin=full.indexOf('TABELLA'),end=full.indexOf('MŰSOR, EREDMÉNY',begin);
 if(begin<0||end<begin)return{rows:[],valid:false,error:'Standings boundary missing'};
 const region=full.slice(begin,end),rows=[];
 const re=/\b(\d{1,2})\.\s+(.+?)\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,2})\s+(\d{1,3})\s+(\d{1,3})\s+(\d+,\d+)\s+(\d{1,5})\s+(\d{1,5})\s+(\d+,\d+)/g;
 for(const m of region.matchAll(re)){
  const rank=Number(m[1]),played=Number(m[3]),wins=Number(m[4]),losses=Number(m[5]);
  rows.push({rank,name:m[2].trim(),played,wins,losses,leaguePoints:Number(m[6]),
   setsFor:Number(m[7]),setsAgainst:Number(m[8]),setRatio:m[9],
   pointsFor:Number(m[10]),pointsAgainst:Number(m[11]),pointRatio:m[12]});
 }
 const completeRanks=rows.length===12&&rows.every((r,i)=>r.rank===i+1);
 const valid=completeRanks&&rows.every(r=>r.wins+r.losses===r.played);
 return{rows,valid,error:valid?null:'Incomplete or inconsistent standings'};
}
function auditLeaguePage(html){
 const fixtures=parseRows(html),table=parseStandings(html);
 const scored=fixtures.rows.filter(m=>m.status==='scored');
 const unscored=fixtures.rows.filter(m=>m.status==='unscored');
 const invalid=fixtures.rows.filter(m=>m.status==='invalid_score');
 const uniqueTeams=[...new Set(fixtures.rows.flatMap(m=>[m.home,m.away]).filter(Boolean))];
 const scoredAppearances=new Map();
 for(const m of scored){for(const team of [m.home,m.away])scoredAppearances.set(team,(scoredAppearances.get(team)||0)+1)}
 return{
   season:'2025/26',competition:'Női Budapest I. osztály',subcompetitionCode:'93',
   matchCount:fixtures.rows.length,scoredCount:scored.length,unscoredCount:unscored.length,
   invalidScoreCount:invalid.length,uniqueFixtureTeamNames:uniqueTeams.length,
   repeatedResponsiveCards:fixtures.repeatedResponsiveCards,
   standingsTeams:table.rows.length,standingsValid:table.valid,
   playedMatchesPerStandings:table.valid?table.rows.reduce((s,t)=>s+t.played,0)/2:null,
   scoreCountAgreesWithStandings:table.valid?scored.length===table.rows.reduce((s,t)=>s+t.played,0)/2:null,
   issues:[...fixtures.errors,...(table.error?[table.error]:[])],
   standings:table.rows,
   matches:fixtures.rows,
   // Validates result availability, not full MRSZ protocol/roster participation coverage.
   totalProtocolRostersVerified:0,
   readyForHistoricalStrengthModel:false
 };
}
module.exports={dayMarkers,parseRows,parseStandings,auditLeaguePage};
