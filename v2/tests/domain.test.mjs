import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const src = readFileSync(new URL('../packages/domain/src/models.ts', import.meta.url), 'utf8');
test('V2 contracts define canonical player, team, event, RSVP and audit entities', () => {
  for (const type of ['Player','Team','TeamMembership','Event','RSVP','Attendance','PermissionGrant','AuditEvent'])
    assert.match(src, new RegExp('export interface '+type+'\\b'));
});
test('missing timestamps remain null and have explicit display fallback', () => {
  assert.match(src, /if \(value == null \|\| value\.trim\(\) === ''\) return null/);
  assert.match(src, /if \(!value\) return 'Nincs adat'/);
});
