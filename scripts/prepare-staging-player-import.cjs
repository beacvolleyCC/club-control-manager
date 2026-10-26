'use strict';
// OFFLINE TEST-only roster import: no database credentials, API calls or network.
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),privateDir=path.join(root,'private-import');
const TEAM_IDS=new Set(['10000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000003']);
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const fail=s=>{throw Error('TEST import stopped: '+s);};
const quote=v=>v===null||v===undefined||v===''?'NULL':"'"+String(v).replace(/'/g,"''")+"'";
const uuid=(v,field)=>{if(!UUID.test(v||''))fail('invalid '+field);return v.toLowerCase();};
function csv(src){
  const rows=[];let cell='',row=[],quoted=false,closed=false;
  const write=()=>{row.push(cell);if(row.some(x=>x.trim()))rows.push(row);row=[];cell='';closed=false;};
  src=src.replace(/^\uFEFF/,'');
  for(let i=0;i<src.length;i++){
    const ch=src[i];
    if(quoted){
      if(ch==='"'){
        if(src[i+1]==='"'){cell+='"';i++;}
        else{quoted=false;closed=true;}
      }else cell+=ch;
    }else if(ch==='"'){
      if(cell!==''||closed)fail('malformed CSV quoting');
      quoted=true;
    }else if(ch===','){row.push(cell);cell='';closed=false;}
    else if(ch==='\n'||ch==='\r'){if(ch==='\r'&&src[i+1]==='\n')i++;write();}
    else if(closed&&ch.trim()!=='')fail('invalid CSV after quote');
    else cell+=ch;
  }
  if(quoted)fail('unterminated CSV quote');
  if(cell!==''||row.length)write();
  if(rows.length<2)fail('empty CSV');
  const header=rows.shift().map(x=>x.trim().toLowerCase());
  if(new Set(header).size!==header.length)fail('duplicate CSV header');
  return rows.map((r,i)=>{
    if(r.length!==header.length)fail('CSV column count mismatch at row '+(i+2));
    return Object.fromEntries(header.map((h,j)=>[h,r[j].trim()]));
  });
}
const requireColumns=(rows,keys,name)=>{
  if(!rows.length)fail(name+' has no rows');
  for(const key of keys)if(!Object.hasOwn(rows[0],key))fail(name+' missing '+key);
};
const bool=(value)=>{
  if(['true','t','1','yes'].includes(String(value).toLowerCase()))return 'TRUE';
  if(['false','f','0','no'].includes(String(value).toLowerCase()))return 'FALSE';
  fail('invalid boolean');
};
const sqlDate=v=>{
  if(!v||v.toLowerCase()==='null')return 'NULL';
  if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||Number.isNaN(Date.parse(v)))fail('invalid date');
  return quote(v)+'::date';
};
const salt=process.env.CC_TEST_IMPORT_SALT;
if(!salt||salt.length<32)fail('set local CC_TEST_IMPORT_SALT (min 32 chars)');
const preserve=String(process.env.CC_TEST_PRESERVE_EMAIL||'').trim().toLowerCase();
if(preserve&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(preserve))fail('invalid preserved TEST email');
function pseudo(kind,id){
  const b=crypto.createHmac('sha256',salt).update(kind+':'+id).digest();
  b[6]=(b[6]&0x0f)|0x40;b[8]=(b[8]&0x3f)|0x80;
  const h=b.toString('hex');
  return [h.slice(0,8),h.slice(8,12),h.slice(12,16),h.slice(16,20),h.slice(20,32)].join('-');
}
const arg=(name,fallback)=>{
  const i=process.argv.indexOf(name);return i>=0?process.argv[i+1]:fallback;
};
const ps=path.resolve(arg('--players',path.join(privateDir,'players.csv')));
const ms=path.resolve(arg('--memberships',path.join(privateDir,'team_memberships.csv')));
const out=path.resolve(arg('--out',path.join(privateDir,'staging_roster.sql')));
if(out.startsWith(root+path.sep)&&!out.startsWith(privateDir+path.sep))fail('SQL output in repo must stay in ignored private-import/');
if(path.extname(out).toLowerCase()!=='.sql')fail('output must be a SQL file');
const players=csv(fs.readFileSync(ps,'utf8'));
const membership=csv(fs.readFileSync(ms,'utf8'));
requireColumns(players,['id','name','email','active'],'players');
requireColumns(membership,['id','player_id','team_id','starts_on','active'],'team_memberships');
const map=new Map(),emails=new Set(),sentences=[
'-- TEST ONLY. Offline, privacy-reduced roster import; never run against LIVE.',
'-- Only sport data and selected TEST email. No auth_user_id, medical or financial data.',
'-- This does not delete pre-existing synthetic fixtures.',
'BEGIN;'
];
let kept=0;
for(const p of players){
  const orig=uuid(p.id,'player id');
  if(map.has(orig))fail('duplicate player id');
  const id=pseudo('player',orig);
  map.set(orig,id);
  const name=String(p.name||'').trim();
  if(!name||name.length>160)fail('invalid name');
  const email=String(p.email||'').trim().toLowerCase();
  if(!email)fail('missing email');
  const safeEmail=email===preserve?email:'cc-test-'+id.slice(0,12)+'@example.invalid';
  if(email===preserve)kept++;
  if(emails.has(safeEmail))fail('duplicate sanitized email');
  emails.add(safeEmail);
  const number=String(p.jersey_no||'').trim();
  if(number&&!/^\d{1,3}$/.test(number))fail('invalid jersey number');
  const vals=[quote(id),quote(safeEmail),quote(name),quote(p.display_name||''),quote(p.position||''),number||'NULL',quote(p.jersey_size||''),quote(p.shorts_size||''),bool(p.active)];
  sentences.push('INSERT INTO public.players(id,email,name,display_name,position,jersey_no,jersey_size,shorts_size,active) VALUES ('+vals.join(',')+') ON CONFLICT(id) DO UPDATE SET name=EXCLUDED.name,display_name=EXCLUDED.display_name,position=EXCLUDED.position,jersey_no=EXCLUDED.jersey_no,jersey_size=EXCLUDED.jersey_size,shorts_size=EXCLUDED.shorts_size,active=EXCLUDED.active;');
  sentences.push('INSERT INTO public.player_settings(player_id) VALUES ('+quote(id)+') ON CONFLICT(player_id) DO NOTHING;');
}
if(preserve&&kept!==1)fail('preserved TEST email must match exactly one player');
const seen=new Set();
for(const m of membership){
  const orig=uuid(m.id,'membership id');
  if(seen.has(orig))fail('duplicate membership id');
  seen.add(orig);
  const player=map.get(uuid(m.player_id,'membership player id'));
  if(!player)fail('membership player absent from CSV');
  const team=uuid(m.team_id,'membership team id');
  if(!TEAM_IDS.has(team))fail('unexpected team; verify league mapping');
  const starts=sqlDate(m.starts_on),ends=sqlDate(m.ends_on||'');
  if(starts==='NULL')fail('missing membership start');
  const vals=[quote(pseudo('membership',orig)),quote(player),quote(team),starts,ends,bool(m.active)];
  sentences.push('INSERT INTO public.team_memberships(id,player_id,team_id,starts_on,ends_on,active) VALUES ('+vals.join(',')+') ON CONFLICT(id) DO UPDATE SET starts_on=EXCLUDED.starts_on,ends_on=EXCLUDED.ends_on,active=EXCLUDED.active;');
}
sentences.push('COMMIT;');
fs.mkdirSync(path.dirname(out),{recursive:true,mode:0o700});
fs.writeFileSync(out,sentences.join('\n')+'\n',{encoding:'utf8',mode:0o600});
console.log('TEST import prepared:',players.length,'players,',membership.length,'memberships; preserved TEST emails:',kept);
console.log('PRIVATE local SQL file saved. Manually inspect and run only in the separate TEST Supabase project.');
