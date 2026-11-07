import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../apps/manager/test-connection.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../apps/manager/index.html',import.meta.url),'utf8');
test('Manager RPC connection is user initiated',()=>{assert.match(js,/connectTest'\)\.addEventListener\('click'/);assert.match(html,/id="connectTest"/);});
test('session comes from in-memory TEST auth, never persistent storage',()=>{assert.match(js,/getTestSession\(\)/);assert.doesNotMatch(js,/localStorage|sessionStorage|indexedDB/);});
test('failed RPC clears TEST state',()=>{assert.match(js,/cc:v2-test-clear/);assert.match(js,/testTeams'\)\.replaceChildren\(\)/);});
