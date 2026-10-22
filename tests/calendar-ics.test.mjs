import test from 'node:test';
import assert from 'node:assert/strict';
import {buildIcs} from '../supabase/functions/cc-calendar/ics.mjs';
const id='12345678-aaaa-4bbb-8ccc-123456789abc';
const base={
 id,title:'BEAC –;\\ próba, edzés\nÚj sor',type:'training',
 start:'2026-10-25T18:30:00+01:00',
 end:'2026-10-25T20:30:00+01:00',
 venue:'Bogdánfy',address:'Budapest, Bogdánfy u. 12.',
 court:'2-es pálya',status:'active',createdAt:'2026-10-20T11:00:00Z',
 updatedAt:'2026-10-20T12:00:00.123Z'
};
function unfold(s){return s.replace(/\r\n /g,'');}
test('RFC5545 framing, escaping, UTC DST, and no private roster',()=>{
 const raw=buildIcs([base]);
 assert.ok(raw.startsWith('BEGIN:VCALENDAR\r\n'));
 assert.ok(raw.endsWith('END:VCALENDAR\r\n'));
 assert.ok(!/(?<!\r)\n/.test(raw),'only CRLF separators');
 const s=unfold(raw);
 assert.match(s,/DTSTART:20261025T173000Z/);
 assert.match(s,/DTEND:20261025T193000Z/);
 assert.match(s,/UID:12345678-aaaa-4bbb-8ccc-123456789abc@club-control\.beac/);
 assert.ok(s.includes('SUMMARY:BEAC –\\;\\\\ próba\\, edzés\\nÚj sor'));
 assert.ok(s.includes('LOCATION:Bogdánfy · 2-es pálya · Budapest\\, Bogdánfy u. 12.'));
 assert.ok(!s.includes('player_id'));
 assert.ok(!s.includes('medical'));
});
test('stable UID and higher sequence after reschedule',()=>{
 const first=unfold(buildIcs([base]));
 const later=unfold(buildIcs([{...base,start:'2026-11-01T19:30:00+01:00',updatedAt:'2026-10-22T12:01:00Z'}]));
 assert.equal(first.match(/UID:[^\r\n]+/)[0],later.match(/UID:[^\r\n]+/)[0]);
 assert.notEqual(first.match(/DTSTART:[^\r\n]+/)[0],later.match(/DTSTART:[^\r\n]+/)[0]);
 const seq=s=>Number(s.match(/SEQUENCE:(\d+)/)[1]);
 assert.ok(seq(later)>seq(first));
});
test('cancelled and archive semantics: cancellation explicit, archive not cancellation',()=>{
 assert.ok(unfold(buildIcs([{...base,status:'cancelled'}])).includes('STATUS:CANCELLED'));
 assert.ok(unfold(buildIcs([{...base,status:'archived'}])).includes('STATUS:CONFIRMED'));
});
test('folded lines never exceed 75 UTF-8 bytes',()=>{
 const text=buildIcs([{...base,title:'Árvíztűrő tükörfúrógép — 😺'.repeat(30)}]);
 for(const line of text.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75,'line too long');
});
test('invalid timestamps and ids skipped, dates not invented',()=>{
 assert.equal((buildIcs([{...base,id:'not uuid'}]).match(/BEGIN:VEVENT/g)||[]).length,0);
 assert.equal((buildIcs([{...base,start:'invalid'}]).match(/BEGIN:VEVENT/g)||[]).length,0);
 assert.ok(!unfold(buildIcs([{...base,end:null}])).includes('DTEND:'));
});

test('meeting location and Hungarian daylight-saving conversion are safe',()=>{
 const s=unfold(buildIcs([{...base,
   meetingAt:'2026-10-25T17:30:00Z',meetingPlace:'Főbejárat, 2-es pálya'
 }]));
 assert.ok(s.includes('DESCRIPTION:Találkozó:'));
 assert.ok(s.includes('18:30'));
 assert.ok(s.includes('Főbejárat\\, 2-es pálya'));
 assert.ok(!s.includes('medical'));
});
