'use strict';
/* Offline historical team-strength study. Not a match predictor and not official ranking.
 * Input: official archived MRSZ snapshots, no live network calls.
 * 2024/25 and 2025/26 use independent 1500 point initial ratings. */
const fs = require('node:fs');
const path = require('node:path');
const ROOT=path.resolve(__dirname,'../..');
const SOURCES=[
  {file:'data/competition-history/women1_2024_25_official_league_snapshot.json',
   aliases:{'Vasas Tartalék':'Vasas Sport Club Tartalék','Közgáz SC':'Közgáz női',
    'DKLSN':'DUNAKANYAR LSN','Vasas SC Fehér Tartalék':'Vasas Sport Club Fehér Tartalék'}},
  {file:'data/competition-history/women1_2025_26_official_league_snapshot.json',
   aliases:{'BEAC':'Budapesti Egyetemi Atlétikai Club','Közgáz SC':'Közgáz női',
    'Vasas SC Tartalék':'Vasas Sport Club Tartalék','RSZSE':'Ráckeve',
    'KRE SC':'Károli Gáspár Református Egyetem Sport Club',
    'DKLSN':'DUNAKANYAR Labdasport Nonprofit Közhasznú Kft'}}
];
function assert(ok,msg){if(!ok)throw Error(msg)}
function season(snapshot,config){
  const pairs=new Map(snapshot.standings.map(o=>[o.name,{o,elo:1500,w:0,l:0,sf:0,sa:0,sequence:[]}]));
  const scored=snapshot.matches.filter(m=>m.status==='scored')
    .sort((a,b)=>(a.date+'T'+a.time).localeCompare(b.date+'T'+b.time)||Number(a.code)-Number(b.code));
  const codes=new Set();
  for(const m of scored){
    assert(!codes.has(m.code),'Duplicate MRSZ code '+m.code);codes.add(m.code);
    assert(Number.isInteger(m.homeSets)&&Number.isInteger(m.awaySets)
      &&Math.max(m.homeSets,m.awaySets)===3&&Math.min(m.homeSets,m.awaySets)<=2,
      'Invalid set score '+m.code);
    const home=config.aliases[m.home]||m.home,away=config.aliases[m.away]||m.away;
    const a=pairs.get(home),b=pairs.get(away);
    assert(a&&b&&home!==away,'Unknown/ambiguous MRSZ team '+m.code);
    const homeWin=m.homeSets>m.awaySets?1:0;
    const expectation=1/(1+Math.pow(10,(b.elo-a.elo)/400));
    const change=24*(homeWin-expectation);
    a.elo+=change;b.elo-=change;
    a.w+=homeWin;a.l+=1-homeWin;b.w+=1-homeWin;b.l+=homeWin;
    a.sf+=m.homeSets;a.sa+=m.awaySets;b.sf+=m.awaySets;b.sa+=m.homeSets;
    a.sequence.push({date:m.date,code:m.code,won:!!homeWin});
    b.sequence.push({date:m.date,code:m.code,won:!homeWin});
  }
  for(const [name,r]of pairs){
    const o=r.o;
    assert(r.w===o.wins&&r.l===o.losses&&r.sf===o.setsFor&&r.sa===o.setsAgainst
      &&r.sequence.length===o.played,'Official standings mismatch: '+name);
  }
  assert(Math.abs([...pairs.values()].reduce((n,r)=>n+r.elo,0)-pairs.size*1500)<0.00001,'Elo conservation error');
  const rankings=[...pairs].map(([name,r])=>({
    team:name,rating:Number(r.elo.toFixed(1)),played:r.o.played,wins:r.w,losses:r.l,
    winRate:Number((100*r.w/r.o.played).toFixed(1)),setDiff:r.sf-r.sa,
    formLast5Wins:r.sequence.slice(-5).filter(x=>x.won).length,
    officialPlace:r.o.rank,officialLeaguePoints:r.o.leaguePoints
  })).sort((a,b)=>b.rating-a.rating);
  rankings.forEach((r,i)=>{r.modelOrder=i+1});
  return {
    sourceFile:config.file,sourceURL:snapshot.sourceURL,
    competitionSubId:snapshot.competitionSubId,
    officialRecordedMatches:scored.length,
    excludedUnscoredFixtures:snapshot.matches.length-scored.length,
    teamCount:snapshot.standings.length,aliases:config.aliases,rankings
  };
}
function buildAll(){
  const result={schemaVersion:1,generatedOn:'2026-10-19',
    model:'historical isolated-season Elo',initialRating:1500,kFactor:24,
    neutralHomeAdvantage:true,league:'Női Budapest I. osztály',
    currentSeasonStrength:false,officialRanking:false,predictiveCalibration:false,
    limits:[
      'Each season starts from Elo 1500; the resulting ratings are not directly comparable between seasons.',
      'Unofficial method based on match W/L, not a federation-certified ranking.',
      'No player lineups or roster strength adjustment; do not use it for match probability.',
      'Name aliases are accepted only when scores and statistics exactly reproduce every official standings entry.'
    ],seasons:{}};
  for(const config of SOURCES){
    const snap=JSON.parse(fs.readFileSync(path.join(ROOT,config.file),'utf8'));
    result.seasons[snap.sourceSeason]=season(snap,config);
  }
  return result;
}
if(require.main===module){
  const output=path.join(ROOT,'data/competition-strength/women1_2024_2026_elo_experimental.json');
  fs.mkdirSync(path.dirname(output),{recursive:true});
  fs.writeFileSync(output,JSON.stringify(buildAll(),null,2)+'\n');
  console.log('Validated historical strength data:',output);
}
module.exports={season,buildAll,SOURCES};
