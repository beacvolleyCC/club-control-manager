'use strict';
// A separate tolerant reader: DOES NOT change the established 2025 strict parser.
// Federation ID uniquely anchors each player. Missing K/CS or a duplicated shirt
// is reported, never inferred. Nomination never implies court participation.
const {visibleText}=require('./parse-official-women1-protocol.cjs');

function parsePlayerRows(section){
 const matches=[...String(section||'').matchAll(/\b(\d{1,3})\s+(\d{3})\b/g)];
 const players=[],warnings=[],errors=[];
 let prev=0;
 for(const match of matches){
  const code=match[1]+match[2];
  const prefix=section.slice(prev,match.index).trim().replace(/\s+/g,' ');
  prev=match.index+match[0].length;
  const tokens=prefix.split(' ').filter(Boolean);
  let shirt=null,designation=null,captain=false,libero=null,title=null;
  if(/^\d{1,3}$/.test(tokens[0]||''))shirt=Number(tokens.shift());
  if(/^(L1|L2)$/.test(tokens.at(-1)||''))libero=tokens.pop();
  if(tokens.at(-1)==='C'){captain=true;tokens.pop()}
  if(['K','CS'].includes(tokens.at(-1))){designation=tokens.pop()}
  if(tokens.at(-1)==='C'&&!captain){captain=true;tokens.pop()}
  if(tokens.at(-1)==='DR.'||tokens.at(-1)==='DR'){title=tokens.pop()}
  // Some match sheets print the degree before K/CS and the captain marker.
  if(tokens.at(-1)==='DR.'||tokens.at(-1)==='DR'){title=tokens.pop()}
  const name=tokens.join(' ');
  if(tokens.length<2||tokens.length>9||
   !tokens.every(t=>/^[\p{Lu}\p{M}]+(?:[-–][\p{Lu}\p{M}]+)*\.?$/u.test(t))){
    errors.push({code,reason:'unrecognized_name_or_row_prefix',rowPrefix:prefix.slice(0,120)});
    continue;
  }
  if(!shirt)warnings.push({code,reason:'no_shirt_number'});
  if(designation===null)warnings.push({code,reason:'no_K_or_CS_marker'});
  players.push({code,name,shirt,designation,captain,libero,title});
 }
 const remainder=section.slice(prev).trim();
 if(remainder&&!/^(?:-|–|—)$/.test(remainder))errors.push({reason:'unparsed_trailing_text',text:remainder.slice(0,100)});
 const codes=players.map(p=>p.code);
 if(new Set(codes).size!==codes.length)errors.push({reason:'duplicate_MRSZ_player_code'});
 const shirtCounts=new Map();
 for(const p of players)if(p.shirt!=null)shirtCounts.set(p.shirt,(shirtCounts.get(p.shirt)||0)+1);
 for(const [shirt,count] of shirtCounts)if(count>1)warnings.push({reason:'duplicate_shirt_number',shirt,count});
 return{
  players,warnings,errors,valid:errors.length===0&&players.length===matches.length,
  sourcePlayerCodeMatches:matches.length
 };
}

function parseFlexibleProtocol(html,expectedCode,seasonStart){
 if(!['2024','2025'].includes(String(seasonStart)))throw Error('Only source-verified 2024/25 or 2025/26');
 if(!/^\d{3,6}$/.test(String(expectedCode)))throw Error('Invalid official match code');
 const visible=visibleText(html);
 const marker=visible.indexOf('VERSENYJEGYZŐKÖNYV');
 if(marker<0)return{status:'no_protocol'};
 const text=visible.slice(marker);
 const header=text.match(/^VERSENYJEGYZŐKÖNYV\s+(.+?)\s+-\s+(.+?)\s+Női Budapest-bajnokság\s*\/\s*Női Budapest I\. osztály/);
 if(!header)return{status:'wrong_league_or_header'};
 const home=header[1].trim(),away=header[2].trim();
 const yearLabel=seasonStart+'/'+(Number(seasonStart)+1);
 const datePattern=new RegExp('(\\d{4})\\.(\\d{2})\\.(\\d{2})\\s+-\\s+[^ ]+\\s+(\\d{2}:\\d{2}).*?'+yearLabel.replace('/','\\/')+'\\s+([\\d\\s]{1,10})\\s+helyszín');
 const dm=text.match(datePattern);
 const observedCode=dm?.[5]?.replace(/\s/g,'')||null;
 if(!dm||observedCode!==String(expectedCode))return{
  status:'match_code_or_season_mismatch',observedCode,expectedCode
 };
 const date=dm[1]+'-'+dm[2]+'-'+dm[3],time=dm[4];
 const teams=[],warnings=[],errors=[];
 for(const name of [home,away]){
  const at=text.indexOf(name+' mez játékosok neve');
  if(at<0)return{status:'missing_roster_section',home,away,date,time};
  const start=text.indexOf('kizár',at),end=text.indexOf('hivatalos személyek neve',start);
  if(start<0||end<=start)return{status:'missing_roster_table',home,away,date,time};
  const roster=parsePlayerRows(text.slice(start+5,end));
  teams.push({name,players:roster.players,rosterComplete:roster.valid&&roster.players.length>0,
   count:roster.sourcePlayerCodeMatches});
  for(const x of roster.warnings)warnings.push({team:name,...x});
  for(const x of roster.errors)errors.push({team:name,...x});
 }
 const scoreStart=text.indexOf('játszmák eredményei'),scoreEnd=text.indexOf('játékvezetők',scoreStart);
 let homeSets=null,awaySets=null,setScores=null,scoreVerified=false;
 if(scoreStart>=0&&scoreEnd>scoreStart){
  const sr=text.slice(scoreStart,scoreEnd);
  const m=sr.match(/\bhazai\s+([\d\sX]+?)\s+vendég\s+([\d\sX]+)/);
  if(m){
   const hn=(m[1].match(/\d+/g)||[]).map(Number),an=(m[2].match(/\d+/g)||[]).map(Number);
   const h=hn[0],a=an[0],n=h+a;
   if(((h===3&&a>=0&&a<=2)||(a===3&&h>=0&&h<=2))&&hn.length>=n+1&&an.length>=n+1){
    const points=Array.from({length:n},(_,i)=>[hn[i+1],an[i+1]]);
    if(points.every(([x,y],i)=>Math.max(x,y)>=(i===4?15:25)&&Math.abs(x-y)>=2)&&
      points.filter(([x,y])=>x>y).length===h){
      homeSets=h;awaySets=a;setScores=points;scoreVerified=true;
    }
   }
  }
 }
 return{
  status:scoreVerified?'verified_official_score':'no_verified_protocol_score',
  expectedCode,season:seasonStart+'/'+(Number(seasonStart)+1),
  home,away,date,time,homeSets,awaySets,setScores,scoreVerified,
  teams,warnings,errors,
  twoRosterListsVerified:teams.length===2&&teams.every(t=>t.rosterComplete)&&errors.length===0,
  sourcePlayerRows:teams.reduce((n,t)=>n+t.count,0)
 };
}
module.exports={parsePlayerRows,parseFlexibleProtocol};
