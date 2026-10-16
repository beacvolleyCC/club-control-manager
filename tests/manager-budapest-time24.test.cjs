'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const src=fs.readFileSync('app.js','utf8');
const css=fs.readFileSync('styles.css','utf8');
const get=(start,end)=>{
 const a=src.indexOf(start),b=src.indexOf(end,a);
 assert.ok(a>=0&&b>a,'Missing time implementation: '+start);
 return src.slice(a,b);
};
const text=value=>String(value??'').trim();
const esc=value=>text(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const helpers=new Function('text','safeDate','esc',
 get('  function ccDateInputValue_(','  function ccCloseEntityDialog_(')
 +get('  function ccNormalizeTime24_(','  function ccHomeDefaultsForTeam_(')
 +get('  function ccBudapestLocalIso_(','  function ccBRSZMatchPayload_(')
 +';return {normalize:ccNormalizeTime24_,input:ccTimeInputValue_,toIso:ccLocalIso_,field:ccTimeField_,budapest:ccBudapestLocalIso_};'
)(text,v=>{const d=new Date(v);return Number.isFinite(d.getTime())?d:null;},esc);
test('24-hour input normalizes values and rejects AM/PM and out-of-range clock times',()=>{
 for(const [value,expected] of [['19:30','19:30'],['7:30','07:30'],['07.30','07:30'],['0730','07:30'],['1730','17:30'],['00:00','00:00'],['23:59','23:59']])
  assert.equal(helpers.normalize(value),expected);
 for(const invalid of ['12:30 PM','7:30 AM','24:00','23:60','-1:30','19:3','',null])
  assert.equal(helpers.normalize(invalid),'',String(invalid));
});
test('Every competition editor time field is a 24-hour text field independent of OS locale',()=>{
 const html=helpers.field('ceStart','Kezdés','19:30',{required:true});
 assert.ok(html.includes('type="text"'));
 assert.ok(html.includes('class="cc-time24-input"'));
 assert.ok(html.includes('pattern="(?:[01][0-9]|2[0-3]):[0-5][0-9]"'));
 assert.ok(html.includes('value="19:30"'));
 assert.ok(html.includes('24 óra'));
 assert.ok(!html.includes('type="time"'));
 assert.ok(!html.includes('AM'));
 assert.ok(!html.includes('PM'));
 const optional=helpers.field('ceMeetingTime','Találkozó','');
 assert.ok(!optional.includes('required'));
 assert.ok(src.includes("ccTimeField_('ceEnd'"));
 assert.ok(src.includes("ccTimeField_('ceMeetingTime'"));
});
test('Mass training start and end times use the same fixed 24-hour input',()=>{
 const start=src.indexOf('<input id="meStart"'),end=src.indexOf('<select id="meLevel"',start);
 assert.ok(start>0&&end>start);
 const snippet=src.slice(start,end);
 for(const id of ['meStart','meEnd'])assert.ok(snippet.includes('id="'+id+'" class="cc-time24-input" type="text"'));
 assert.ok(!snippet.includes('type="time"'));
 assert.ok(css.includes('.cc-native-time-field .cc-time24-input'));
 assert.ok(!css.includes('input[type="time"]'));
});
test('Stored UTC instants display as Budapest 24-hour wall time in summer and winter',()=>{
 assert.equal(helpers.input('2026-10-16T17:30:00Z'),'19:30');
 assert.equal(helpers.input('2026-12-16T17:30:00Z'),'18:30');
 assert.equal(helpers.input('2026-10-16T00:05:00Z'),'02:05');
});
test('Competition event saving uses Europe/Budapest, not the browser machine timezone',()=>{
 assert.equal(helpers.toIso('2026-10-16','19:30'),'2026-10-16T17:30:00.000Z');
 assert.equal(helpers.toIso('2026-12-16','19:30'),'2026-12-16T18:30:00.000Z');
 assert.equal(helpers.toIso('2026-10-16','0730'),'2026-10-16T05:30:00.000Z');
 assert.equal(helpers.toIso('2026-10-16','24:00'),null);
 assert.equal(helpers.toIso('2026-02-30','19:30'),null);
 assert.equal(helpers.toIso('2026-03-29','02:30'),null,'nonexistent DST spring-forward time must be rejected');
});
test('Existing Budapest formatter for archived BRSZ fixtures shares the validated clock conversion',()=>{
 assert.equal(helpers.budapest('2026-10-16','19:30'),helpers.toIso('2026-10-16','19:30'));
 assert.ok(src.includes('return ccBudapestLocalIso_(dateValue,ccNormalizeTime24_(timeValue))'));
 assert.ok(src.includes("hourCycle:'h23'"));
});
