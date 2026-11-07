import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const auth=readFileSync(new URL('../apps/manager/test-auth.js',import.meta.url),'utf8');const connection=readFileSync(new URL('../apps/manager/test-connection.js',import.meta.url),'utf8');
test('TEST token has expiry and does not persist',()=>{assert.match(auth,/expires_in/);assert.match(auth,/Date\.now\(\)>=expiresAt/);assert.doesNotMatch(auth,/localStorage|sessionStorage/);});
test('logout invalidates in-flight RPC results',()=>{assert.match(auth,/sessionVersion\+\+/);assert.match(connection,/requestVersion=getSessionVersion\(\)/);assert.match(connection,/getSessionVersion\(\)!==requestVersion/);});
