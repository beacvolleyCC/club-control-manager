'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {parsePlayerRows,parseFlexibleProtocol}=require('../scripts/history/parse-flexible-women1-protocol.cjs');
test('old 2025 MRSZ K/CS markers remain intact, including captain and libero',()=>{
 const a=parsePlayerRows('2 SZALONTAI REBEKA K 37 523 21 IMRE ESZTER K C 42 988 3 IGLÓI NÓRA CS L1 32 910');
 assert.equal(a.valid,true,JSON.stringify(a.errors));
 assert.equal(a.players.length,3);
 assert.equal(a.players[0].designation,'K');
 assert.equal(a.players[1].captain,true);
 assert.equal(a.players[2].libero,'L1');
});
test('missing K/CS and missing shirt are explicit nulls, not invented starts/subs',()=>{
 const a=parsePlayerRows('1 IMRE ESZTER C 42 988 2 SZALONTAI REBEKA 37 523 DELI-GERMANN OLGA L1 21 482');
 assert.equal(a.valid,true,JSON.stringify(a.errors));
 assert.equal(a.players.length,3);
 assert.equal(a.players[0].designation,null);
 assert.equal(a.players[0].captain,true);
 assert.equal(a.players[2].shirt,null);
 assert.equal(a.players[2].libero,'L1');
 assert.ok(a.warnings.some(x=>x.reason==='no_K_or_CS_marker'));
});
test('duplicate shirt is a source warning, NOT grounds for merging IDs',()=>{
 const r=parsePlayerRows('4 VAJDA LILLA K 25 526 4 VAS KITTI CS 29 594');
 assert.equal(r.valid,true,JSON.stringify(r.errors));
 assert.deepEqual(r.players.map(x=>x.code),['25526','29594']);
 assert.ok(r.warnings.some(x=>x.reason==='duplicate_shirt_number'));
});
test('degree after a name and unusual source suffix remain recognizable',()=>{
 const a=parsePlayerRows('5 HELLER SARA ESZTER DR. 79 417 10 GEISZELHARDT ÁGNES DR K 22 459');
 assert.equal(a.valid,true,JSON.stringify(a.errors));
 assert.equal(a.players.length,2);
 assert.equal(a.players[0].name,'HELLER SARA ESZTER');
 assert.equal(a.players[0].title,'DR.');
 assert.equal(a.players[1].designation,'K');
});
test('repeated MRSZ code and unparseable text are fail closed',()=>{
 const a=parsePlayerRows('1 KISS ANNA K 21 301 2 KISS ANNA CS 21 301');
 assert.equal(a.valid,false);
 assert.ok(a.errors.some(x=>x.reason==='duplicate_MRSZ_player_code'));
 const b=parsePlayerRows('5 ALMA ?? K 23 222');
 assert.equal(b.valid,false);
});
function protocol(year){
 return [
  'VERSENYJEGYZŐKÖNYV BEAC - MTK Budapest Női Budapest-bajnokság / Női Budapest I. osztály',
  year+'.10.17 - péntek 19:30 női felnőtt bajnoki (csoport) '+year+'/'+(Number(year)+1)+' 2 446 helyszín ELTE',
  'játszmák eredményei hazai 3 25 25 25 2 X vendég 0 17 21 23 1 X játékvezetők',
  'BEAC mez játékosok neve K CS C L kód figyelmeztet büntet kiállít kizár',
  '1 IMRE ESZTER C 42 988 2 SZALONTAI REBEKA K 37 523',
  'hivatalos személyek neve jelleg kód',
  'MTK Budapest mez játékosok neve K CS C L kód figyelmeztet büntet kiállít kizár',
  '1 JUHOS ROZÁLIA K 21 301 5 KISS VIRÁG BARBARA C 21 303',
  'hivatalos személyek neve jelleg kód'
 ].join(' ');
}
test('same parser accepts exact season 2024/25 and 2025/26 without mixing IDs',()=>{
 for(const year of ['2024','2025']){
  const p=parseFlexibleProtocol(protocol(year),'2446',year);
  assert.equal(p.status,'verified_official_score',JSON.stringify(p));
  assert.equal(p.twoRosterListsVerified,true,JSON.stringify(p.errors));
  assert.equal(p.sourcePlayerRows,4);
  assert.equal(p.homeSets,3);
 }
 assert.equal(parseFlexibleProtocol(protocol('2024'),'2446','2025').status,'match_code_or_season_mismatch');
 assert.equal(parseFlexibleProtocol(protocol('2024'),'2222','2024').status,'match_code_or_season_mismatch');
});
test('missing protocol score does not disappear even if roster rows exist',()=>{
 const txt=protocol('2025').replace('hazai 3 25 25 25 2 X vendég 0 17 21 23 1 X','hazai vendég');
 const x=parseFlexibleProtocol(txt,'2446','2025');
 assert.equal(x.status,'no_verified_protocol_score');
 assert.equal(x.twoRosterListsVerified,true);
 assert.equal(x.homeSets,null);
});
