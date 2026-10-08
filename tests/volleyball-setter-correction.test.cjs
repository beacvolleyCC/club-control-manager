/* Run: node tests/volleyball-setter-correction.test.cjs */
'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const window={};
vm.runInNewContext(fs.readFileSync(path.join(__dirname,'..','volleyball-core.js'),'utf8'),{window,Date,JSON,Array,Math,Number,Set,String});
const v=window.CCVolleyballCore,players=[['1','2','3','4','5','6'],['7','8','9','10','11','12']];
const c=v.newCourt(1);
v.start(c,players,0,[1,4]);
assert.equal(v.setterAt(c.active,0).label,'P1');
assert.equal(v.setterAt(c.active,1).label,'P4');
assert.equal(v.setterAt(c.active,0).jersey,'1');
v.award(c,0); // own service, no rotation
assert.equal(v.setterAt(c.active,0).label,'P1');
v.award(c,1); // opponent gets service, rotates
assert.equal(v.setterAt(c.active,1).label,'P3');
assert.equal(v.setterAt(c.active,0).label,'P1');
assert.equal(v.lastPointCorrection(c,0),null,'minus disabled for side that did not win last rally');
v.stat(c,1,'8','serve','ace');
const firstCorrection=v.lastPointCorrection(c,1);
assert.equal(firstCorrection.discardedStats,1);
const undone=v.retractLastPoint(c,1);
assert.equal(undone.discardedStats,1);
assert.deepEqual(Array.from(c.active.points),[1,0]);
assert.equal(c.active.events.length,0);
assert.equal(c.active.service,0);
assert.equal(v.setterAt(c.active,1).label,'P4');
v.award(c,1);v.award(c,0); // home gets service, rotates
assert.equal(v.setterAt(c.active,0).label,'P6');
const oldSetter=v.setterAt(c.active,0).jersey;
v.substitute(c,0,6,'22');
assert.equal(v.setterAt(c.active,0).jersey,'22');
assert.equal(v.setterAt(c.active,0).position,6);
assert.equal(c.active.substitutions[0].setterChange,true);
assert.equal(c.active.substitutions[0].out,oldSetter);
v.award(c,1); // opponent gets service
assert.equal(v.setterAt(c.active,0).label,'P6','setter remains in zone until home wins service');
v.award(c,0);
assert.equal(v.setterAt(c.active,0).label,'P5');
assert.equal(v.setterAt(c.active,0).jersey,'22');
v.award(c,0);
v.substitute(c,1,3,'21');
assert.equal(v.lastPointCorrection(c,0).discardedSubs,1);
v.retractLastPoint(c,0);
assert.equal(c.active.substitutions.length,1,'earlier substitution preserved');
assert.equal(c.active.points[0],3);
assert.equal(v.setterAt(c.active,0).label,'P5');
v.undo(c);
assert.equal(v.setterAt(c.active,0).label,'P6'); // undo previous side-out restores the preceding rotation
v.award(c,0); // break the tie before training-set close
v.close(c,true);
v.next(c);
assert.equal(c.active.setterStarts[0],1,'next set carries setter start position');
assert.equal(c.active.setterStarts[1],4);
v.start(c,players,1,[2,null]);
assert.equal(v.setterAt(c.active,0).label,'P2','setter start can change between sets');
assert.equal(v.setterAt(c.active,1),null,'opponent setter optional');
assert.throws(()=>v.start(c,players,1,[1,4]),/elkezdődött/);
const bad=v.newCourt(3);
assert.throws(()=>v.start(bad,players,0,[7,null]),/feladóhoz/);
console.log('PASS setter P1–P6 rotation, score minus/linked stat correction, setter substitution, new-set setup');
