// RFC 5545 rendering is deliberately pure and has no database / HTTP dependencies.
// Source: authorized event rows from cc_calendar_feed_read_v1, never a client roster.
const utf8=new TextEncoder();
function utc(value) {
  if(!value)return null;
  const d=new Date(String(value));
  if(!Number.isFinite(d.getTime()))return null;
  return d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
}
function escapeText(value){
  return String(value??'')
    .replace(/\\/g,'\\\\')
    .replace(/\r\n|\r|\n/g,'\\n')
    .replace(/;/g,'\\;')
    .replace(/,/g,'\\,')
    .replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g,'');
}
function foldLine(line){
  const out=[];let current='',size=0;
  for(const ch of line){
    const n=utf8.encode(ch).length;
    if(size+n>75){out.push(current);current=' ';size=1;}
    current+=ch;size+=n;
  }
  out.push(current);
  return out;
}
export function buildIcs(events){
  const rows=['BEGIN:VCALENDAR','VERSION:2.0',
    'PRODID:-//Club Control//Private Subscription V1//HU',
    'CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'X-WR-CALNAME:Club Control'];
  for(const e of events){
    const start=utc(e.start);
    if(!start||!/^[a-f0-9]{8}-[a-f0-9-]{27,36}$/i.test(String(e.id??'')))continue;
    const changed=utc(e.updatedAt)||utc(e.createdAt)||start;
    const changedMs=Date.parse(e.updatedAt||e.createdAt||e.start);
    const sequence=Number.isFinite(changedMs)?Math.max(0,Math.floor(changedMs/1000)):0;
    const location=[e.venue,e.court,e.address].filter(Boolean).join(' · ');
    const lines=['BEGIN:VEVENT',`UID:${e.id}@club-control.beac`,
      `DTSTAMP:${changed}`,`LAST-MODIFIED:${changed}`,
      `SEQUENCE:${sequence}`,`DTSTART:${start}`];
    const end=utc(e.end);
    if(end&&end>start)lines.push(`DTEND:${end}`);
    lines.push(`SUMMARY:${escapeText(e.title||(e.type==='match'?'Mérkőzés':'Edzés'))}`);
    if(location)lines.push(`LOCATION:${escapeText(location)}`);
    lines.push(e.status==='cancelled'?'STATUS:CANCELLED':'STATUS:CONFIRMED');
    lines.push('END:VEVENT');
    rows.push(...lines);
  }
  rows.push('END:VCALENDAR');
  return rows.flatMap(foldLine).join('\r\n')+'\r\n';
}
