/* Club Control — canonical competition context catalog (read-only).
 * Builds selectable season/competition/group contexts from the SAME verified
 * MRSZ snapshot payload already supplied to both Manager and Player.
 * Does not infer unavailable groups, standings or results.
 * Team identity uses source IDs, never arbitrary team-name strings.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.CCCompetitionContextCatalog=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const string=v=>String(v??'').trim();
  const records=v=>Array.isArray(v)?v:[];
  const compare=(a,b)=>a.localeCompare(b,'hu',{sensitivity:'base'});
  const groupFromLabel=label=>{
    const match=string(label).match(/(?:\s*[–-]\s*|\s+)([A-Z])\s+csoport$/i);
    return match?match[1].toUpperCase():null;
  };
  function build(snapshot){
    const input=snapshot||{},contexts=new Map();
    const defaultSeason=string(input.season);
    function entry(record){
      const label=string(record?.competitionLabel);
      const season=string(record?.season)||defaultSeason;
      if(!label||!season)return null;
      const id=season+'|'+label;
      if(!contexts.has(id))contexts.set(id,{
        id,season,competitionLabel:label,group:groupFromLabel(label),
        fixtureCount:0,matchCount:0,standingsRowCount:0,
        standingsStatus:'missing',participants:new Map(),unresolvedNames:new Set()
      });
      return contexts.get(id);
    }
    function addParticipant(context,id,name){
      if(!context)return;
      const sourceTeamId=string(id),teamName=string(name);
      if(!sourceTeamId){
        if(teamName)context.unresolvedNames.add(teamName);
        return;
      }
      if(!context.participants.has(sourceTeamId))context.participants.set(sourceTeamId,{
        sourceTeamId,teamName:teamName||'–',aliases:new Set()
      });
      const team=context.participants.get(sourceTeamId);
      if(teamName){
        team.aliases.add(teamName);
        if(team.teamName==='–')team.teamName=teamName;
      }
    }
    for(const match of records(input.fixtures)){
      const context=entry(match);
      if(!context)continue;
      context.fixtureCount++;
      addParticipant(context,match.homeSourceTeamId,match.homeName);
      addParticipant(context,match.awaySourceTeamId,match.awayName);
    }
    for(const match of records(input.matches)){
      const context=entry(match);
      if(!context)continue;
      context.matchCount++;
      addParticipant(context,match.homeSourceTeamId,match.homeName);
      addParticipant(context,match.awaySourceTeamId,match.awayName);
    }
    for(const table of records(input.tables)){
      const context=entry(table);
      if(!context)continue;
      const rows=records(table.rows);
      context.standingsRowCount=Math.max(context.standingsRowCount,rows.length);
      if(rows.length)context.standingsStatus=table.partial===true?'partial':'snapshot';
      // Snapshot table row names may be aliases and have no source IDs.
      // Do NOT map those rows onto participants unless a source ID is supplied.
      for(const row of rows)addParticipant(context,row.sourceTeamId,row.teamName);
    }
    return [...contexts.values()].sort((a,b)=>compare(a.competitionLabel,b.competitionLabel)||compare(a.season,b.season)).map(context=>Object.freeze({
      id:context.id,season:context.season,competitionLabel:context.competitionLabel,
      group:context.group,source:'mrsz_screenshot',
      fixtureCount:context.fixtureCount,matchCount:context.matchCount,
      standingsRowCount:context.standingsRowCount,standingsStatus:context.standingsStatus,
      participantCount:context.participants.size,
      participants:Object.freeze([...context.participants.values()].sort((a,b)=>compare(a.teamName,b.teamName)).map(t=>Object.freeze({
        sourceTeamId:t.sourceTeamId,teamName:t.teamName,
        aliases:Object.freeze([...t.aliases].sort(compare))
      }))),
      unresolvedNamesCount:context.unresolvedNames.size
    }));
  }
  return Object.freeze({build,groupFromLabel});
});
