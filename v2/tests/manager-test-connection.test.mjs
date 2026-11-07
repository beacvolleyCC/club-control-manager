import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const js=readFileSync(new URL('../apps/manager/test-connection.js',import.meta.url),'utf8');
const html=readFileSync(new URL('../apps/manager/index.html',import.meta.url),'utf8');
test('TEST connection is explicitly user initiated',()=>{assert.match(js,/connectTest'\)\.addEventListener\('click'/);assert.match(html,/id="connectTest"/);});
test('TEST token is never written to persistent browser storage',()=>{assert.doesNotMatch(js,/localStorage|sessionStorage|indexedDB/);assert.match(js,/testToken'\)\.value=''/);});
test('TEST failure clears real-data panels instead of showing fixtures',()=>{assert.match(js,/testTeams'\)\.replaceChildren\(\)/);assert.match(js,/testEvents'\)\.replaceChildren\(\)/);});
