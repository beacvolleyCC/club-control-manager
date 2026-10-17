'use strict';
// Read-only screening of historical source candidates. NO DB access, no league rating.
// Conservative exact normalized string matching is only a hint, not an identity merge.
const fs=require('node:fs');
const path=require('node:path');

function normalizedName(value){
  return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLocaleLowerCase('hu').replace(/[–—-]/g,' ').replace(/[^a-z0-9 ]/g,' ')
    .replace(/\s+/g,' ').trim();
}
function seasonDateValid(season,date){
  const match=/^(20\d\d)\/(\d\d)$/.exec(season);
  if(!match||!/^\d{4}-\d\d-\d\d$/.test(date))return false;
  const start=Number(match[1]),end=start+1;
  if(Number(match[2])!==end%100)return false;
  const d=new Date(date+'T00:00:00Z');
  if(Number.isNaN(d.valueOf())||d.toISOString().slice(0,10)!==date)return false;
  return date>=start+'-07-01'&&date<=end+'-06-30';
}
function resultValid(m){
  const h=m.homeSets,a=m.awaySets;
  return Number.isInteger(h)&&Number.isInteger(a)&&
    ((h===3&&a>=0&&a<=2)||(a===3&&h>=0&&h<=2));
}
function audit(data){
  const errors=[], seen=new Set(), historical=new Map(), sources={club_site:0,third_party:0};
  const matches=Array.isArray(data.matches)?data.matches:[];
  if(data.schemaVersion!==1)errors.push('Unsupported schemaVersion');
  if(data.sport!=='volleyball')errors.push('Invalid sport');
  if(data.sampleIsComplete!==false)errors.push('Sample cannot be presented as full league data');
  if(data.officialResultsVerified!==false)errors.push('Official verification flag must be false for candidate sample');
  for(let i=0;i<matches.length;i++){
    const m=matches[i],loc='matches['+i+']';
    if(!seasonDateValid(data.season,m.date))errors.push(loc+': invalid/out-of-season date');
    if(!m.home||!m.away||normalizedName(m.home)===normalizedName(m.away))errors.push(loc+': invalid opponents');
    if(!resultValid(m))errors.push(loc+': invalid best-of-five match result');
    if(!Object.hasOwn(sources,m.sourceType))errors.push(loc+': unknown sourceType');
    else sources[m.sourceType]++;
    if(!/^https:\/\/[^\s]+$/.test(String(m.sourceUrl||'')))errors.push(loc+': no HTTPS source URL');
    if(m.verifiedOfficial!==false)errors.push(loc+': source result is NOT federation verified');
    const key=[m.date,normalizedName(m.home),normalizedName(m.away)].join('|');
    if(seen.has(key))errors.push(loc+': duplicate candidate match');
    seen.add(key);
    for(const name of [m.home,m.away]){
      const id=normalizedName(name);if(id&&!historical.has(id))historical.set(id,new Set());
      if(id)historical.get(id).add(name);
    }
  }
  for(const [i,p] of (data.officialProtocolExamples||[]).entries()){
    if(!seasonDateValid(data.season,p.date)||!/^\d+$/.test(String(p.matchCode||'')))errors.push('officialProtocolExamples['+i+']: invalid match reference');
    if(p.playerIdExtracted!==false||p.hasNamedRosterVerified!==false)errors.push('officialProtocolExamples['+i+']: do not invent roster coverage');
  }
  const teams=Array.isArray(data.current2026Teams)?data.current2026Teams:[];
  const seenCurrent=new Set();
  const currentHits=[],currentMissing=[];
  for(const name of teams){
    const id=normalizedName(name);
    if(seenCurrent.has(id))errors.push('duplicate current team name: '+name);
    seenCurrent.add(id);
    if(historical.has(id))currentHits.push(name);else currentMissing.push(name);
  }
  return {
    ok:errors.length===0,errors,
    season:data.season,competition:data.competition,
    candidateResults:matches.length,
    sourceKinds:sources,officiallyVerifiedResults:0,
    officialProtocolIndexExamples:(data.officialProtocolExamples||[]).length,
    namedPlayersWithVerifiedId:0,
    distinctHistoricalNames:historical.size,
    currentTeamsChecked:teams.length,
    exactNameCandidateMatches:currentHits,
    notExactlyNameMatched:currentMissing,
    completeLeagueResultCoverage:null,
    finalStrengthRatingsAllowed:false,
    notes:[
      'Historical current-team name correspondence is not a confirmed federation identity match.',
      'Never treat candidate result counts as official played match coverage.',
      'Player strength, roster continuity and match odds require verified player IDs and season coverage.'
    ]
  };
}
if(require.main===module){
  const file=process.argv[2]||path.join(__dirname,'../../data/competition-history/women1_2025_26_evidence_sample.json');
  const result=audit(JSON.parse(fs.readFileSync(file,'utf8')));
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(!result.ok)process.exitCode=1;
}
module.exports={normalizedName,seasonDateValid,resultValid,audit};
