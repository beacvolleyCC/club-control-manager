'use strict';
// Deterministic parser for public MRSZ 2025/26 Női Budapest I. score sheets.
// No network, no database writes. Inputs are decoded HTML documents.
// Fail closed: blank templates are never interpreted as scored matches.

function visibleText(html){
 return String(html||'')
   .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,' ')
   .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi,' ')
   .replace(/<[^>]*>/g,' ')
   .replace(/&nbsp;|&#160;/gi,' ')
   .replace(/&amp;/gi,'&')
   .replace(/\s+/g,' ').trim();
}
function parsePlayers(section){
 const players=[];
 const regex=/\b(\d{1,3})\s+([\p{Lu}]+(?:[\s-]+[\p{Lu}]+){1,6})\s+(K|CS)(?:\s+(C))?(?:\s+(L[12]))?\s+(\d{1,3})\s+(\d{3})\b/gu;
 let m;
 while((m=regex.exec(section))!==null){
   players.push({shirt:Number(m[1]),name:m[2].trim(),designation:m[3],
     captain:m[4]==='C',libero:m[5]||null,code:m[6]+m[7]});
 }
 const codes=players.map(p=>p.code),shirts=players.map(p=>p.shirt);
 if(new Set(codes).size!==codes.length||new Set(shirts).size!==shirts.length)
   return{players:[],reason:'Duplicate MRSZ ID or shirt number'};
 return{players,reason:null};
}
function parseFromVisibleText(fullText,expectedMatchCode){
 const p=fullText.indexOf('VERSENYJEGYZŐKÖNYV');
 if(p<0)return{status:'no_protocol',matchCode:expectedMatchCode};
 const next=fullText.indexOf('TEREMRÖPLABDA VERSENYJEGYZŐKÖNYV',p+20);
 const text=fullText.slice(p,next>p?next:undefined);
 const header=text.match(/^VERSENYJEGYZŐKÖNYV\s+(.+?)\s+-\s+(.+?)\s+Női Budapest-bajnokság\s*\/\s*Női Budapest I\. osztály/);
 if(!header)return{status:'wrong_league_or_header',matchCode:expectedMatchCode};
 const home=header[1].trim(),away=header[2].trim();
 const dateMatch=text.match(/(\d{4})\.(\d{2})\.(\d{2})\s+-\s+[^ ]+\s+(\d{2}:\d{2}).*?2025\/2026\s+([\d\s]{1,10})\s+helyszín/);
 const observedCode=dateMatch?.[5]?.replace(/\s+/g,'')||null;
 if(!dateMatch||observedCode!==String(expectedMatchCode))
   return{status:'match_code_or_season_mismatch',matchCode:expectedMatchCode,observedCode};
 const date=dateMatch[1]+'-'+dateMatch[2]+'-'+dateMatch[3];
 const time=dateMatch[4];
 const scoreStart=text.indexOf('játszmák eredményei');
 const scoreEnd=text.indexOf('játékvezetők',scoreStart);
 if(scoreStart<0||scoreEnd<=scoreStart)return{status:'missing_score_section',matchCode:expectedMatchCode,home,away,date,time};
 const region=text.slice(scoreStart,scoreEnd);
 const hm=region.match(/\bhazai\s+([\d\sX]+?)\s+vendég\s+([\d\sX]+)/);
 if(!hm)return{status:'empty_official_sheet',matchCode:expectedMatchCode,home,away,date,time,homeSets:null,awaySets:null,teams:[]};
 const hn=(hm[1].match(/\d+/g)||[]).map(Number),an=(hm[2].match(/\d+/g)||[]).map(Number);
 const hs=hn[0],as=an[0],n=hs+as;
 if(!Number.isInteger(hs)||!Number.isInteger(as)||!(hs===3&&as<=2||as===3&&hs<=2)||
    n<3||n>5||hn.length<n+1||an.length<n+1)
   return{status:'unverified_score',matchCode:expectedMatchCode,home,away,date,time};
 const setScores=Array.from({length:n},(_,i)=>[hn[i+1],an[i+1]]);
 // In this competition each set winner must lead by at least 2, to 25 or 15 in fifth.
 if(!setScores.every(([a,b],i)=>Number.isInteger(a)&&Number.isInteger(b)&&a>=0&&b>=0&&
     Math.max(a,b)>=(i===4?15:25)&&Math.abs(a-b)>=2))
   return{status:'unverified_set_points',matchCode:expectedMatchCode,home,away,date,time};
 const homeWins=setScores.filter(([a,b])=>a>b).length,awayWins=n-homeWins;
 if(homeWins!==hs||awayWins!==as)return{status:'score_mismatch',matchCode:expectedMatchCode,home,away,date,time};
 const teams=[];
 for(const name of [home,away]){
   const marker=name+' mez játékosok neve';
   const from=text.indexOf(marker,scoreEnd);
   if(from<0)return{status:'missing_roster_section',matchCode:expectedMatchCode,home,away,date,time};
   const start=text.indexOf('kizár',from);
   const end=text.indexOf('hivatalos személyek neve',start);
   if(start<0||end<=start)return{status:'missing_roster_table',matchCode:expectedMatchCode,home,away,date,time};
   const roster=parsePlayers(text.slice(start+5,end));
   if(roster.reason)return{status:'duplicate_or_ambiguous_player',matchCode:expectedMatchCode};
   teams.push({name,players:roster.players});
 }
 // A completed score line is official even if roster names are absent;
 // player-row verification requires complete, non-colliding entries.
 return{status:'verified_official_score',matchCode:expectedMatchCode,
   season:'2025/26',competition:'Női Budapest I. osztály',home,away,date,time,
   homeSets:hs,awaySets:as,setScores,teams,
   validRosterRows:teams.reduce((n,t)=>n+t.players.length,0),
   observedFrom:'MRSZ historical match sheet'};
}
function parseOfficialWomen1Protocol(html,expectedMatchCode){
 return parseFromVisibleText(visibleText(html),expectedMatchCode);
}
module.exports={visibleText,parsePlayers,parseFromVisibleText,parseOfficialWomen1Protocol};
