import { createClient } from 'npm:@supabase/supabase-js@2';

const SOURCE='mrsz';
const DEFAULT_SEASON='2026/27';
const MRSZ_CLUB_CODE='198';
const MRSZ_CLUB_URL='https://www.hunvolley.info/pr_a/920/002/p_002.asp?p_sportszervezet_kod=198';
const cors={
  'Access-Control-Allow-Origin':'*',
  'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type, x-cc-sync-secret',
  'Access-Control-Allow-Methods':'POST, OPTIONS',
};

const CONTEXTS=Object.freeze({
  women1:{internalTeamId:'10000000-0000-4000-8000-000000000001',competitionLabel:'Női I. osztály'},
  women2:{internalTeamId:'10000000-0000-4000-8000-000000000002',competitionLabel:'Női II. osztály B csoport'},
  men:{internalTeamId:'10000000-0000-4000-8000-000000000003',competitionLabel:'Férfi I. osztály B csoport'},
});

type ContextKey='women1'|'women2'|'men';
type MrszContext={
  key:ContextKey;
  internalTeamId:string;
  competitionLabel:string;
  sourceTeamId:string;
  teamName:string;
  teamUrl:string;
  competitionUrl:string;
};
type Anchor={href:string;text:string;index:number};

function json(data:unknown,status=200){
  return new Response(JSON.stringify(data),{status,headers:{...cors,'content-type':'application/json; charset=utf-8','cache-control':'no-store'}});
}
function cleanText(v:unknown){return String(v??'').replace(/\s+/g,' ').trim()}
function decodeEntities(input:string){
  const named:Record<string,string>={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' ',aacute:'á',Aacute:'Á',eacute:'é',Eacute:'É',iacute:'í',Iacute:'Í',oacute:'ó',Oacute:'Ö',ouml:'ö',Ouml:'Ö',odblac:'ő',Odblac:'Ő',uacute:'ú',Uacute:'Ú',uuml:'ü',Uuml:'Ü',udblac:'ű',Udblac:'Ű'};
  return input.replace(/&(#x?[0-9a-f]+|[a-zA-Z]+);/g,(_,key)=>{
    if(key[0]==='#'){
      const hex=key[1]?.toLowerCase()==='x';
      const n=parseInt(key.slice(hex?2:1),hex?16:10);
      return Number.isFinite(n)?String.fromCodePoint(n):_;
    }
    return named[key]??named[key.toLowerCase()]??_;
  });
}
function stripHtml(input:string){
  return cleanText(decodeEntities(String(input||'').replace(/<br\s*\/?\s*>/gi,' ').replace(/<[^>]+>/g,' ')));
}
function decodeHtml(buf:ArrayBuffer,contentType:string|null){
  const bytes=new Uint8Array(buf),ct=(contentType||'').toLowerCase(),encs:string[]=[];
  const m=ct.match(/charset\s*=\s*([^;\s]+)/i);if(m)encs.push(m[1].replace(/["']/g,''));
  encs.push('windows-1250','iso-8859-2','utf-8');
  for(const enc of [...new Set(encs)]){try{return new TextDecoder(enc as any,{fatal:false}).decode(bytes)}catch(_){}}
  return new TextDecoder().decode(bytes);
}
function rowList(html:string){
  const rows:string[]=[],stack:{start:number;hasChild:boolean}[]=[],re=/<\/?tr\b[^>]*>/gi;let m:RegExpExecArray|null;
  while((m=re.exec(html))){
    const closing=/^<\/tr/i.test(m[0]);
    if(!closing){if(stack.length)stack[stack.length-1].hasChild=true;stack.push({start:m.index,hasChild:false});continue}
    const frame=stack.pop();if(frame&&!frame.hasChild)rows.push(html.slice(frame.start,re.lastIndex));
  }
  return rows;
}
function rowCells(rowHtml:string){
  const cells:string[]=[],re=/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi;let m:RegExpExecArray|null;
  while((m=re.exec(rowHtml)))cells.push(stripHtml(m[1]));
  return cells;
}
function htmlAnchors(html:string){
  const out:Anchor[]=[],re=/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;let m:RegExpExecArray|null;
  while((m=re.exec(html)))out.push({href:decodeEntities(m[1]),text:stripHtml(m[2]),index:m.index});
  return out;
}
function absoluteHunvolleyUrl(href:string){
  try{return new URL(String(href||'').replaceAll('&amp;','&'),'https://www.hunvolley.info/').toString()}catch(_){return ''}
}
function sourceTeamIdFromHref(href:string){return (String(href||'').match(/[?&]p_csapat_fo_kod=(\d+)/i)||[])[1]||''}
function seasonCode(season:string){return String((season.match(/(20\d{2})/)||[])[1]||'')}
function withSeason(url:string,season:string){
  try{const u=new URL(url),code=seasonCode(season);if(code)u.searchParams.set('p_evad_kod',code);return u.toString()}catch(_){return url}
}
function nameKey(value:string){
  return cleanText(value).toLocaleLowerCase('hu').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,' ').trim();
}
function isBeacTeamName(value:string){return nameKey(value).includes('budapesti egyetemi atletikai club')}
function ratio(a:number,b:number){if(b===0)return a>0?999999:0;return Math.round((a/b)*1000000)/1000000}
function huNumber(value:string){
  const v=cleanText(value).replace(/\u00a0/g,'').replace(/\s/g,'').replace(',','.');
  if(!/^-?\d+(?:\.\d+)?$/.test(v))return null;
  const n=Number(v);return Number.isFinite(n)?n:null;
}

async function fetchMrszHtml(url:string){
  const res=await fetch(url,{
    redirect:'follow',
    headers:{
      'user-agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36',
      'accept':'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'accept-language':'hu-HU,hu;q=0.9,en-US;q=0.7,en;q=0.6',
      'cache-control':'no-cache','pragma':'no-cache','referer':'https://www.hunvolley.info/',
    }
  });
  if(!res.ok)throw new Error(\`MRSZ_HTTP_\${res.status}\`);
  const html=decodeHtml(await res.arrayBuffer(),res.headers.get('content-type'));
  if(!html||html.length<500)throw new Error('MRSZ_EMPTY_HTML');
  return html;
}

function classifyContext(teamName:string,competitionName:string):ContextKey|null{
  const team=nameKey(teamName),competition=nameKey(competitionName);
  if(competition.includes('ferfi budapest bajnoksag'))return 'men';
  if(competition.includes('noi budapest bajnoksag')&&/\bii\b/.test(team))return 'women2';
  if(competition.includes('noi budapest bajnoksag'))return 'women1';
  return null;
}

function discoverContexts(clubHtml:string,season:string){
  const anchors=htmlAnchors(clubHtml),found=new Map<ContextKey,MrszContext>();
  let currentCompetition:Anchor|null=null;
  for(const a of anchors){
    if(/(?:Férfi|Női)\s+Budapest\s+Bajnokság/i.test(a.text))currentCompetition=a;
    const sourceTeamId=sourceTeamIdFromHref(a.href);
    if(!sourceTeamId||!isBeacTeamName(a.text)||!currentCompetition)continue;
    const key=classifyContext(a.text,currentCompetition.text);if(!key)continue;
    const spec=CONTEXTS[key];
    found.set(key,{
      key,internalTeamId:spec.internalTeamId,competitionLabel:spec.competitionLabel,
      sourceTeamId,teamName:a.text,teamUrl:withSeason(absoluteHunvolleyUrl(a.href),season),
      competitionUrl:absoluteHunvolleyUrl(currentCompetition.href)
    });
  }

  // Fallback for layouts where the competition label and team link sit in the same
  // visual row but nested markup prevents document-order tracking from seeing it.
  if(found.size<3){
    for(const row of rowList(clubHtml)){
      const text=stripHtml(row);if(!isBeacTeamName(text))continue;
      const links=htmlAnchors(row),team=links.find(a=>sourceTeamIdFromHref(a.href)&&isBeacTeamName(a.text));
      const competition=links.find(a=>/(?:Férfi|Női)\s+Budapest\s+Bajnokság/i.test(a.text));
      if(!team||!competition)continue;
      const key=classifyContext(team.text,competition.text);if(!key)continue;
      const spec=CONTEXTS[key];
      found.set(key,{
        key,internalTeamId:spec.internalTeamId,competitionLabel:spec.competitionLabel,
        sourceTeamId:sourceTeamIdFromHref(team.href),teamName:team.text,
        teamUrl:withSeason(absoluteHunvolleyUrl(team.href),season),
        competitionUrl:absoluteHunvolleyUrl(competition.href)
      });
    }
  }
  return [...found.values()];
}

async function resolveCompetitionUrl(ctx:MrszContext,season:string){
  // Team profile is used as a second source of truth for the competition link.
  // If the profile does not expose it, keep the club-profile link.
  try{
    const teamHtml=await fetchMrszHtml(withSeason(ctx.teamUrl,season));
    const target=ctx.key==='men'?/Férfi\s+Budapest\s+Bajnokság/i:/Női\s+Budapest\s+Bajnokság/i;
    const link=htmlAnchors(teamHtml).find(a=>target.test(a.text)&&!sourceTeamIdFromHref(a.href));
    const resolved=absoluteHunvolleyUrl(link?.href||'');if(resolved)return resolved;
  }catch(_){}
  return ctx.competitionUrl;
}

function parseStandings(html:string,ctx:MrszContext){
  const byId=new Map<string,any>();
  for(const row of rowList(html)){
    const links=htmlAnchors(row),team=links.find(a=>sourceTeamIdFromHref(a.href));
    if(!team)continue;
    const sourceTeamId=sourceTeamIdFromHref(team.href),cells=rowCells(row);
    if(!sourceTeamId||!cells.length)continue;

    const tKey=nameKey(team.text);
    let teamIdx=cells.findIndex(v=>nameKey(v)===tKey);
    if(teamIdx<0)teamIdx=cells.findIndex(v=>{const k=nameKey(v);return !!k&&(k.includes(tKey)||tKey.includes(k))});
    if(teamIdx<0)continue;

    const nums=cells.slice(teamIdx+1).map(huNumber).filter((v):v is number=>v!==null);
    if(nums.length<8)continue;

    const played=Math.trunc(nums[0]),wins=Math.trunc(nums[1]),losses=Math.trunc(nums[2]),tablePoints=Math.trunc(nums[3]);
    const setsFor=Math.trunc(nums[4]),setsAgainst=Math.trunc(nums[5]);
    let setRatio:number,pointsFor:number,pointsAgainst:number,pointRatio:number;
    if(nums.length>=10){
      setRatio=Number(nums[6]);pointsFor=Math.trunc(nums[7]);pointsAgainst=Math.trunc(nums[8]);pointRatio=Number(nums[9]);
    }else{
      pointsFor=Math.trunc(nums[6]);pointsAgainst=Math.trunc(nums[7]);
      setRatio=ratio(setsFor,setsAgainst);pointRatio=ratio(pointsFor,pointsAgainst);
    }
    if(played<0||wins<0||losses<0||wins+losses>played+2||setsFor<0||setsAgainst<0||pointsFor<0||pointsAgainst<0)continue;

    const positionCell=cells.slice(0,teamIdx).map(cleanText).reverse().find(v=>/^\d{1,2}\.?$/.test(v))||'';
    const position=positionCell?Number(positionCell.replace('.','')):null;
    byId.set(sourceTeamId,{
      sourceTeamId,teamName:team.text,competitionLabel:ctx.competitionLabel,position,
      played,wins,losses,tablePoints,setsFor,setsAgainst,setRatio,
      pointsFor,pointsAgainst,pointRatio,sourcePosition:!!position,logoUrl:null
    });
  }

  let rows=[...byId.values()];
  if(!rows.some(r=>r.sourceTeamId===ctx.sourceTeamId))throw new Error(\`MRSZ_STANDINGS_FOCUS_MISSING_\${ctx.sourceTeamId}\`);
  if(rows.length<2||rows.length>30)throw new Error(\`MRSZ_STANDINGS_SIZE_INVALID_\${rows.length}\`);

  const allPositioned=rows.every(r=>Number(r.position)>0);
  if(allPositioned)rows.sort((a,b)=>a.position-b.position);
  else{
    rows.sort((a,b)=>b.tablePoints-a.tablePoints||b.setRatio-a.setRatio||b.pointRatio-a.pointRatio||a.teamName.localeCompare(b.teamName,'hu'));
    rows=rows.map((r,i)=>({...r,position:i+1,sourcePosition:false}));
  }
  return rows;
}

async function ensureMap(service:any,ctx:MrszContext,season:string,competitionUrl:string){
  const now=new Date().toISOString();
  const {error:disableError}=await service.from('competition_source_team_maps')
    .update({enabled:false,updated_at:now})
    .eq('source',SOURCE).eq('season',season).eq('internal_team_id',ctx.internalTeamId)
    .neq('source_team_id',ctx.sourceTeamId);
  if(disableError)throw new Error(\`MRSZ_MAP_DISABLE_FAILED: \${disableError.message}\`);

  const {error:upsertError}=await service.from('competition_source_team_maps').upsert({
    source:SOURCE,season,source_team_id:ctx.sourceTeamId,internal_team_id:ctx.internalTeamId,
    competition_label:ctx.competitionLabel,source_url:competitionUrl||ctx.teamUrl,
    enabled:true,updated_at:now
  },{onConflict:'source,season,source_team_id'});
  if(upsertError)throw new Error(\`MRSZ_MAP_UPSERT_FAILED: \${upsertError.message}\`);
}

async function makeMrszCurrentSource(service:any,season:string,internalTeamId:string){
  // Keep federation history in sync_runs/source_matches, but only one standings
  // snapshot source is active at a time so Player and Manager cannot show duplicates.
  const {error}=await service.from('competition_source_standings')
    .delete().eq('season',season).eq('internal_team_id',internalTeamId).neq('source',SOURCE);
  if(error)throw new Error(\`MRSZ_SOURCE_SWITCH_FAILED: \${error.message}\`);
}

Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:cors});
  if(req.method!=='POST')return json({ok:false,error:'METHOD_NOT_ALLOWED'},405);

  const url=Deno.env.get('SUPABASE_URL')||'';
  const anon=Deno.env.get('SUPABASE_ANON_KEY')||'';
  const serviceKey=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  if(!url||!anon||!serviceKey)return json({ok:false,error:'EDGE_ENV_MISSING'},500);

  let body:any={};try{body=await req.json()}catch(_){return json({ok:false,error:'INVALID_JSON'},400)}
  const season=cleanText(body.season||DEFAULT_SEASON);
  const schedulerSecret=cleanText(Deno.env.get('CC_COMPETITION_SYNC_SECRET'));
  const suppliedSecret=cleanText(req.headers.get('x-cc-sync-secret'));
  let actor='scheduler';

  if(!(schedulerSecret&&suppliedSecret&&schedulerSecret===suppliedSecret)){
    const authorization=req.headers.get('authorization')||'';
    if(!authorization.toLowerCase().startsWith('bearer '))return json({ok:false,error:'AUTH_REQUIRED'},401);
    const userClient=createClient(url,anon,{global:{headers:{Authorization:authorization}},auth:{persistSession:false}});
    const {data,error}=await userClient.rpc('cc_manager_competition_sync_authorize_v1');
    if(error||!data?.ok)return json({ok:false,error:'MANAGER_PERMISSION_DENIED',detail:error?.message||null},403);
    actor=cleanText(data.email||'manager');
  }

  const service=createClient(url,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
  let contexts:MrszContext[]=[];
  try{
    const clubHtml=await fetchMrszHtml(MRSZ_CLUB_URL);
    contexts=discoverContexts(clubHtml,season);
  }catch(err){
    return json({ok:false,status:'failed',source:SOURCE,season,errors:[err instanceof Error?err.message:String(err)]},502);
  }

  const missing=(['women1','women2','men'] as ContextKey[]).filter(key=>!contexts.some(ctx=>ctx.key===key));
  if(missing.length){
    return json({ok:false,status:'validation_failed',source:SOURCE,season,errors:[\`MRSZ_BEAC_CONTEXT_MISSING: \${missing.join(', ')}\`]},200);
  }

  const {data:run,error:runError}=await service.from('competition_sync_runs')
    .insert({source:SOURCE,season,triggered_by:actor,status:'running'}).select('*').single();
  if(runError||!run)return json({ok:false,error:'SYNC_RUN_CREATE_FAILED',detail:runError?.message||null},500);

  const totals={fetchedTeamCount:0,fetchedMatchCount:0,createdEvents:0,updatedEvents:0,linkedEvents:0,unchangedEvents:0,reviewCount:0,changeCount:0,resultChanges:0,standingsChanges:0,standingsRows:0};
  const teamResults:any[]=[],errors:string[]=[];

  for(const ctx of contexts){
    try{
      const competitionUrl=await resolveCompetitionUrl(ctx,season);
      if(!competitionUrl)throw new Error(\`MRSZ_COMPETITION_URL_MISSING: \${ctx.key}\`);
      await ensureMap(service,ctx,season,competitionUrl);

      const standings=parseStandings(await fetchMrszHtml(competitionUrl),ctx);
      const {data:extra,error:extraError}=await service.rpc('cc_competition_sync_apply_results_standings_v1',{
        p_run_id:run.id,p_source:SOURCE,p_season:season,p_source_team_id:ctx.sourceTeamId,
        p_results:[],p_standings:standings
      });
      if(extraError)throw new Error(extraError.message);

      await makeMrszCurrentSource(service,season,ctx.internalTeamId);
      const changed=extra?.standingsChanged===true?1:0;
      totals.fetchedTeamCount++;
      totals.standingsChanges+=changed;
      totals.standingsRows+=Number(extra?.standingsRows||standings.length);
      totals.changeCount+=changed;
      teamResults.push({
        teamId:ctx.internalTeamId,sourceTeamId:ctx.sourceTeamId,teamName:ctx.teamName,
        competitionLabel:ctx.competitionLabel,competitionUrl,ok:true,
        standingsRows:standings.length,...extra
      });
    }catch(err){
      const message=err instanceof Error?err.message:String(err);
      errors.push(\`\${ctx.key}: \${message}\`);
      teamResults.push({
        teamId:ctx.internalTeamId,sourceTeamId:ctx.sourceTeamId,
        competitionLabel:ctx.competitionLabel,ok:false,error:message
      });
    }
  }

  const status=errors.length===0?'success':(totals.fetchedTeamCount>0?'partial':'failed');
  const details={
    version:'MRSZ-STANDINGS-V1',
    mode:'standings_only',
    clubCode:MRSZ_CLUB_CODE,
    clubUrl:MRSZ_CLUB_URL,
    teamResults,errors,
    standingsChanges:totals.standingsChanges,
    standingsRows:totals.standingsRows
  };

  const {error:updateError}=await service.from('competition_sync_runs').update({
    status,completed_at:new Date().toISOString(),
    fetched_team_count:totals.fetchedTeamCount,fetched_match_count:0,
    created_events:0,updated_events:0,linked_events:0,unchanged_events:0,
    review_count:0,change_count:totals.changeCount,
    error:errors.length?errors.join(' | '):null,details
  }).eq('id',run.id);
  if(updateError)errors.push(\`RUN_UPDATE: \${updateError.message}\`);

  return json({
    ok:status!=='failed',status,runId:run.id,source:SOURCE,season,actor,
    mode:'standings_only',totals,teamResults,errors
  },status==='failed'?502:200);
});
