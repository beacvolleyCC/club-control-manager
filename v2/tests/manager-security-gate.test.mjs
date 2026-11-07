import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const source=readFileSync(new URL('../apps/manager/test-connection.js',import.meta.url),'utf8');
test('Manager REST read is blocked before accessing session token',()=>{const gate=source.indexOf('SECURITY GATE:');const ret=source.indexOf('\n return;',gate);const token=source.indexOf('const {publishableKey:key,accessToken:token}');assert.ok(gate>=0&&ret>gate&&token>ret);});
