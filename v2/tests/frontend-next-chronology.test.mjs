import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
const code=readFileSync(new URL('../frontend-next/manager/main.js',import.meta.url),'utf8');
const start=code.indexOf('function byTimePhase(rows){');
const end=code.indexOf('\nfunction eventPanel(',start);
assert.ok(start>=0&&end>start,'phase sorter must be present');
const FixedDate=class extends Date {static now(){return Date.parse('2026-11-10T12:00:00Z')}};
const group=new Function('Date',code.slice(start,end)+'\nreturn byTimePhase;')(FixedDate);

test('recent past training first, upcoming events ascending, null dates separate',()=>{
 const input=[
  {id:'yesterday',startsAt:'2026-11-09T10:00:00Z'},
  {id:'nextWeek',startsAt:'2026-11-17T10:00:00Z'},
  {id:'null',startsAt:null},
  {id:'lastWeek',startsAt:'2026-11-03T10:00:00Z'},
  {id:'tomorrow',startsAt:'2026-11-11T10:00:00Z'},
  {id:'invalid',startsAt:'invalid'}
 ];
 const phases=group(input);
 assert.deepEqual(phases.map(x=>x[0]),['Közelgő','Elmúlt – legutóbbi elöl','Időpont nélkül']);
 assert.deepEqual(phases[0][1].map(x=>x.id),['tomorrow','nextWeek']);
 assert.deepEqual(phases[1][1].map(x=>x.id),['yesterday','lastWeek']);
 assert.deepEqual(phases[2][1].map(x=>x.id),['null','invalid']);
});

test('sorting does not mutate source order',()=>{
 const input=[{id:'b',startsAt:'2026-11-09T10:00:00Z'},{id:'a',startsAt:'2026-11-08T10:00:00Z'}];
 group(input);
 assert.deepEqual(input.map(x=>x.id),['b','a']);
});

test('mass trainings use the same phase ordering and show bounded counts',()=>{
 assert.match(code,/byTimePhase\(rows\)/);
 assert.match(code,/data\.massTrainings/);
 assert.match(code,/e\.waitlistCount/);
 assert.match(code,/e\.free/);
 assert.match(code,/e\.capacity/);
 assert.match(code,/e\.totalActive/);
});
