import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../apps/manager/'+p,import.meta.url),'utf8');
test('main view listens to authenticated TEST data',()=>{assert.match(read('main.js'),/cc:v2-test-data/);assert.match(read('main.js'),/sourceEvents=liveTestData/);});
test('TEST events only appear after successful API reads',()=>{assert.match(read('test-connection.js'),/dispatchEvent\(new CustomEvent\('cc:v2-test-data'/);});
test('logout and API failure reset TEST view',()=>{assert.match(read('test-auth.js'),/cc:v2-test-clear/);assert.match(read('test-connection.js'),/cc:v2-test-clear/);assert.match(read('main.js'),/DEMO ADATOK/);});
test('TEST and demo mode are clearly labeled',()=>{assert.match(read('index.html'),/id="testDataMode"/);assert.match(read('main.js'),/TEST ADATOK/);});
