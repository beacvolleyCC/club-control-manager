'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {parseOfficialWomen1Protocol,parseFromVisibleText}=require('../scripts/history/parse-official-women1-protocol.cjs');

const match2446=[
 'VERSENYJEGYZŐKÖNYV Budapesti Egyetemi Atlétikai Club - EMERICUS SE',
 'Női Budapest-bajnokság / Női Budapest I. osztály Budapest',
 'időpont nem korosztály típus idény mérkőzés kód',
 '2025.10.17 - péntek 19:30 női felnőtt bajnoki (csoport) 2025/2026 2 446 helyszín ELTE SPORTPÁLYA',
 'játszmák eredményei játszmák ideje (perc) végeredmény 1. 2. 3. 4. 5. arany',
 'hazai 3 25 25 25 2 X 22 25 27 17 vendég 0 17 21 23 1 X',
 'játékvezetők HERR ZSUZSANNA POLGÁR DÁNIEL',
 'Budapesti Egyetemi Atlétikai Club mez játékosok neve K CS C L kód figyelmeztet büntet kiállít kizár',
 '2 SZALONTAI REBEKA K 37 523 4 PETRI ZSÓFIA CS 31 475',
 '5 SZABÓ CSENGE CS 31 266 8 PÁSZTOR DORINA K 54 846',
 '16 ALBERT ANNA K 27 892 18 UHRI SÁRA K 27 101',
 '19 KOLBA KATA K 51 046 21 IMRE ESZTER K C 42 988',
 '3 IGLÓI NÓRA CS L1 32 910 10 DIÓSZEGI RÉKA CS L2 30 317',
 'hivatalos személyek neve jelleg kód BARAKONYI LÁSZLÓ vezetőedző',
 'EMERICUS SE mez játékosok neve K CS C L kód figyelmeztet büntet kiállít kizár',
 '40 SCHULEK ÁGNES K 23 302 41 VINCZE DÓRA K 35 649',
 '45 GERENCSÉR MELINDA CS 24 510 46 CSÁKÁNY ZINA VIVIEN CS 31 437',
 '48 HAINZMANN REGE KATA K 28 517 61 BÁRSONY JOLÁN CS 65 362',
 '63 KUCSERA ESZTER MÁRTA CS 27 222 80 JAKAB ESZTER K 28 741',
 '81 HORUCZI BORBÁLA HANNA K 24 811 97 JANKOVITS HANNA K C 28 743',
 '38 BÁLINT ANGELIKA CS L1 28 748',
 'hivatalos személyek neve jelleg kód DÖMÖTÖR ÁGNES vezetőedző',
].join(' ');
const empty6161=[
 'VERSENYJEGYZŐKÖNYV Mozdulj - EMERICUS SE',
 'Női Budapest-bajnokság / Női Budapest I. osztály Budapest',
 '2026.01.21 - szerda 20:00 női felnőtt bajnoki (csoport) 2025/2026 6 161 helyszín MOZDULJ SPORTCSARNOK',
 'játszmák eredményei játszmák ideje (perc) végeredmény',
 'hazai vendég játékvezetők Mozdulj mez játékosok neve K CS C L kód',
 'hivatalos személyek neve jelleg kód EMERICUS SE mez játékosok neve K CS C L kód',
 'hivatalos személyek neve jelleg kód',
].join(' ');

test('official 2446 score parses all three real sets and both team rosters',()=>{
 const r=parseFromVisibleText(match2446,'2446');
 assert.equal(r.status,'verified_official_score',JSON.stringify(r));
 assert.equal(r.home,'Budapesti Egyetemi Atlétikai Club');
 assert.equal(r.away,'EMERICUS SE');
 assert.equal(r.date,'2025-10-17');
 assert.equal(r.time,'19:30');
 assert.equal(r.homeSets,3);
 assert.equal(r.awaySets,0);
 assert.deepEqual(r.setScores,[[25,17],[25,21],[25,23]]);
 assert.deepEqual(r.teams.map(t=>t.players.length),[10,11]);
 assert.equal(r.validRosterRows,21);
 assert.equal(r.teams[0].players.find(p=>p.name==='ALBERT ANNA').code,'27892');
 assert.equal(r.teams[0].players.find(p=>p.name==='IMRE ESZTER').captain,true);
 assert.equal(r.teams[0].players.find(p=>p.name==='IGLÓI NÓRA').libero,'L1');
 assert.equal(r.teams[0].players.find(p=>p.name==='DIÓSZEGI RÉKA').libero,'L2');
});
test('previous 6161 empty sheet is not scored and has no made-up players',()=>{
 const r=parseFromVisibleText(empty6161,'6161');
 assert.equal(r.status,'empty_official_sheet');
 assert.equal(r.homeSets,null);
 assert.equal(r.awaySets,null);
 assert.deepEqual(r.teams,[]);
});
test('different match ID or season never becomes a verified record',()=>{
 const r=parseOfficialWomen1Protocol(match2446,'6161');
 assert.equal(r.status,'match_code_or_season_mismatch');
 const bad=match2446.replace('2025/2026','2024/2025');
 assert.equal(parseFromVisibleText(bad,'2446').status,'match_code_or_season_mismatch');
});
test('invalid set score or inconsistent match score is rejected',()=>{
 const r=parseFromVisibleText(match2446.replace('25 25 25 2 X','18 25 25 2 X'),'2446');
 assert.equal(r.status,'unverified_set_points');
 const mismatch=parseFromVisibleText(match2446.replace('hazai 3 25 25 25','hazai 2 25 25 25'),'2446');
 assert.notEqual(mismatch.status,'verified_official_score');
});
test('mismatched player identifiers and duplicate shirts block player row acceptance',()=>{
 const r=parseFromVisibleText(match2446.replace('4 PETRI ZSÓFIA','2 PETRI ZSÓFIA'),'2446');
 assert.equal(r.status,'duplicate_or_ambiguous_player');
});
