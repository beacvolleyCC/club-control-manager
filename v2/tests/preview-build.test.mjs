import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const script=readFileSync(new URL('../scripts/build-preview.mjs',import.meta.url),'utf8');
test('preview build includes both apps',()=>{assert.match(script,/\['manager','player'\]/);assert.match(script,/dist,'index.html'/);});
test('preview landing page clearly labels fake data',()=>assert.match(script,/Fiktív tesztadatok/));
