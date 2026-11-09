import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const read=p=>readFileSync(new URL('../apps/manager/'+p,import.meta.url),'utf8');
test('main view receives TEST Manager data',()=>{assert.match(read('main.js'),/cc:v2-test-data/);assert.match(read('main.js'),/sourceEvents=liveTestData/);});
test('TEST mode only after successful Manager RPCs',()=>{assert.match(read('test-connection.js'),/Promise\.all/);assert.match(read('test-connection.js'),/cc:v2-test-data/);});
test('logout and failure reset TEST view',()=>{assert.match(read('test-auth.js'),/cc:v2-test-clear/);assert.match(read('test-connection.js'),/cc:v2-test-clear/);});
