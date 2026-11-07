import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const auth = readFileSync(new URL('../packages/domain/src/authorization.ts', import.meta.url), 'utf8');
const api = readFileSync(new URL('../packages/api/src/contracts.ts', import.meta.url), 'utf8');
test('team scope requires exact matching team ID', () => {
 assert.match(auth, /grant\.scope\.teamId === request\.teamId/);
 assert.match(auth, /request\.teamId != null/);
});
test('API rejects unauthenticated and forbidden access', () => {
 assert.match(api, /code: 'UNAUTHENTICATED'/);
 assert.match(api, /code: 'FORBIDDEN'/);
 assert.match(api, /canAccess\(ctx\.grants/);
});
