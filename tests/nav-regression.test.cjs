/* Regression: Manager navigation must bind collections, not querySelector singletons.
 * Usage: node tests/nav-regression.test.cjs
 */
'use strict';
const fs=require('node:fs');
const assert=require('node:assert/strict');
const source=fs.readFileSync(require('node:path').join(__dirname,'..','app.js'),'utf8');
const start=source.indexOf('  function bindDynamicNavigation(){');
const end=source.indexOf('\n  function metric(',start);
assert.ok(start>=0&&end>start,'Navigation function is present');
const snippet=source.slice(start,end);
assert.ok(snippet.includes("$$('[data-route-module]').forEach"),'Section navigation uses querySelectorAll');
assert.ok(snippet.includes("$$('[data-planning-tab]').forEach"),'Planning navigation uses querySelectorAll');
const calls=[];
const document={querySelectorAll:()=>[]};
const buttons={
  modules:[{dataset:{routeArea:'competition',routeModule:'trainings'}},{dataset:{routeArea:'mass',routeModule:'trainings'}}],
  planning:[{dataset:{planningTab:'counter'}},{dataset:{planningTab:'planner'}}]
};
const all=(selector)=>selector==='[data-route-module]'?buttons.modules:selector==='[data-planning-tab]'?buttons.planning:[];
const bind=new Function('document','$$','state','setRoute','setPlannerTab_',snippet+';return bindDynamicNavigation;')(
  document,all,{area:'competition'},(area,module)=>calls.push(['route',area,module]),tab=>calls.push(['planning',tab])
);
bind();
for(const b of buttons.modules)b.onclick();
for(const b of buttons.planning)b.onclick();
assert.deepEqual(calls,[
  ['route','competition','trainings'],['route','mass','trainings'],['planning','counter'],['planning','planner']
]);
console.log('PASS manager navigation: collection selectors, two section and two planning links');
