/* Club Control verified legacy/canonical match bridge: opt-in, no data writes.
 * This adapter never promotes a name/time-only match candidate into an alias.
 */
(function(root){
  'use strict';
  const LEAGUES=new Set([
    'Női Budapest I. osztály',
    'Női Budapest II. osztály – B csoport',
    'Férfi Budapest I. osztály – B csoport'
  ]);
  const UUID=/^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;

  function safeUuid(value){
    return typeof value==='string'&&UUID.test(value)?value.toLowerCase():'';
  }
  function isMissingV3(error,expected){
    const code=String(error?.code||'');
    const message=String(error?.message||error||'');
    // An authorization/RLS/network/timeout error is NOT a missing RPC.
    return (code==='PGRST202'||code==='42883')&&message.includes(expected);
  }
  async function loadSnapshot(call,client,enabled){
    if(typeof call!=='function'||!['manager','player'].includes(client))
      throw new TypeError('Invalid snapshot client');
    const prefix='cc_'+client+'_competition_mrsz_snapshot_';
    if(enabled!==true)return call(prefix+'v2');
    const next=prefix+'v3';
    try{return await call(next)}
    catch(error){
      if(!isMissingV3(error,next))throw error;
      return call(prefix+'v2');
    }
  }
  function normalize(raw){
    if(!Array.isArray(raw))return [];
    const candidates=[];
    for(const v of raw){
      if(!v||v.verified!==true||v.verification!=='official_identity_manually_verified')
        continue;
      const legacyMatchId=safeUuid(v.legacyMatchId);
      const canonicalMatchId=safeUuid(v.canonicalMatchId);
      if(!legacyMatchId||!canonicalMatchId||legacyMatchId===canonicalMatchId)continue;
      const season=String(v.season||'');
      const competitionLabel=String(v.competitionLabel||'');
      const canonicalSourceKey=String(v.canonicalSourceKey||'');
      if(season!=='2026/27'||!LEAGUES.has(competitionLabel)
        ||!canonicalSourceKey||canonicalSourceKey.length>240)continue;
      candidates.push({legacyMatchId,canonicalMatchId,canonicalSourceKey,
        competitionLabel,season,verified:true});
    }
    // Conflicting or repeated UUIDs are quarantined rather than arbitrarily
    // choosing the first match. The DB also enforces uniqueness.
    const oldCount=new Map(),newCount=new Map(),sourceCount=new Map();
    for(const v of candidates){
      for(const [map,key] of [[oldCount,v.legacyMatchId],
        [newCount,v.canonicalMatchId],[sourceCount,v.canonicalSourceKey]])
        map.set(key,(map.get(key)||0)+1);
    }
    return candidates.filter(v=>oldCount.get(v.legacyMatchId)===1
      &&newCount.get(v.canonicalMatchId)===1
      &&sourceCount.get(v.canonicalSourceKey)===1);
  }
  function annotateCanonical(matches,bridge){
    if(!Array.isArray(matches))return [];
    const valid=normalize(bridge);
    if(!valid.length)return matches.slice();
    const byId=new Map(valid.map(v=>[v.canonicalMatchId,v]));
    return matches.map(match=>{
      if(!match||typeof match!=='object')return match;
      const link=byId.get(safeUuid(match.matchId));
      if(!link||String(match.sourceKey||'')!==link.canonicalSourceKey
        ||String(match.season||'')!==link.season
        ||String(match.competitionLabel||'')!==link.competitionLabel)
        return match;
      // A legacy match ID is not an event UUID and is NEVER an RSVP write key.
      return {...match,_ccVerifiedLegacyMatchId:link.legacyMatchId,
        _ccBridgeVerified:true};
    });
  }
  const api=Object.freeze({loadSnapshot,isMissingV3,normalize,annotateCanonical});
  if(root)root.CCVerifiedMatchBridge=api;
  if(typeof module==='object'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:typeof globalThis!=='undefined'?globalThis:null);
