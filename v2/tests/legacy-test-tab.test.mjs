import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const app=readFileSync(new URL('../../app.js',import.meta.url),'utf8');
test('legacy mass module remains registered and untouched',()=>{assert.match(app,/mass:\{label:'Tömegsport'/);assert.match(app,/\['trainings','Edzések'/);});
test('Teszt tab loads isolated V2 iframe and precedes Settings',()=>{assert.match(app,/testTab\.textContent='Teszt'/);assert.match(app,/primary\.insertBefore\(testTab,settingsTab\)/);assert.match(app,/preview\.src='\.\/v2\/apps\/manager\/index\.html'/);});
test('returning to original module hides preview',()=>{assert.match(app,/preview\.hidden=true/);assert.match(app,/child!==preview/);});
